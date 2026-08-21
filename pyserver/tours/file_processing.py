"""
Port of app/lib/tour_files.php. PLY denoise + header-cleanup shared by
tours (admin) and tour_user_upload (self-service) upload paths.
"""

import subprocess
import time
from pathlib import Path

from django.conf import settings

# Windows-only paths in the PHP original became a Linux node.exe + a
# globally npm-installed @playcanvas/splat-transform CLI -- see the
# migration plan's decision to keep a small Node.js runtime ONLY for this
# external-tool invocation (same category as calling pdal/untwine, not a
# "backend on Node").
NODE_EXE = getattr(settings, "SPLAT_TRANSFORM_NODE_EXE", "node")
SPLAT_TRANSFORM_CLI = getattr(settings, "SPLAT_TRANSFORM_CLI", "")


def denoise_splat_ply_if_possible(absolute_path: str) -> None:
    """
    Cleans a splat file (.ply) of two noise types via the
    @playcanvas/splat-transform CLI (GPU voxelization):
      1) -V scale_*,lt,N -- giant individual splats (real tours had scale
         up to 18-26m at a ~0.02m median) -- these cause the "glow" and
         blow up the bounding box for step 2's voxelization (without this
         step -G crashes with a RangeError on large scenes);
      2) -G -- the tool's standard voxel-based "points with no neighbors"
         filter.
    Best-effort: if the CLI isn't installed or the process fails/times
    out, the original file is silently left untouched -- denoise is a
    quality improvement, not a requirement for creating a tour.
    """
    path = Path(absolute_path)
    if not SPLAT_TRANSFORM_CLI or not Path(SPLAT_TRANSFORM_CLI).is_file() or not path.is_file():
        return

    tmp_out = path.with_suffix(path.suffix + ".denoised.ply")
    cmd = [
        NODE_EXE, SPLAT_TRANSFORM_CLI, str(path),
        "-N", "-V", "scale_0,lt,2", "-V", "scale_1,lt,2", "-V", "scale_2,lt,2",
        "-G", str(tmp_out), "-w",
    ]
    try:
        subprocess.run(cmd, capture_output=True, timeout=300)
        ok = tmp_out.is_file()
    except (subprocess.TimeoutExpired, OSError):
        ok = False

    if ok:
        path.unlink()
        tmp_out.rename(path)
    elif tmp_out.is_file():
        tmp_out.unlink()  # failed/partial result -- don't replace the original


_PLY_ALLOWED_HEADER_WORDS = {"ply", "format", "comment", "element", "property", "end_header"}


def strip_unsupported_ply_header_lines(absolute_path: str) -> None:
    """
    PlayCanvas's built-in PlyParser only understands ply/format/comment/
    element/property/end_header header lines -- any other first word
    throws "Unrecognized header value" and the tour never opens. Some
    exporters write an optional (per the Stanford PLY spec) "obj_info
    ..." line -- valid PLY, unrecognized by this parser. Fixed once at
    upload time, not on every render -- only the text header (up to
    "end_header\n") is rewritten; the binary/text data tail is streamed
    through unread into memory (models range from tens of MB to several GB).
    """
    path = Path(absolute_path)
    if not path.is_file():
        return
    with open(path, "rb") as src:
        head_buf = src.read(65536)
        if head_buf[0:3] != b"ply":
            return
        terminator = b"end_header\n"
        end_pos = head_buf.find(terminator)
        if end_pos == -1:
            return  # header longer than 64KB -- atypical, safer to leave alone
        header_len = end_pos + len(terminator)
        header = head_buf[:header_len]

        kept = []
        changed = False
        for line in header.rstrip(b"\n").split(b"\n"):
            first_word = line.split(b" ", 1)[0].decode("ascii", errors="replace")
            if first_word in _PLY_ALLOWED_HEADER_WORDS:
                kept.append(line)
            else:
                changed = True  # a line like "obj_info ..." -- drop it

        if not changed:
            return  # the common path for all "normal" files -- header's already clean

        tmp_path = path.with_name(path.name + ".headerfix.tmp")
        with open(tmp_path, "wb") as dst:
            dst.write(b"\n".join(kept) + b"\n")
            dst.write(head_buf[header_len:])  # tail of the already-read 64KB buffer
            while True:
                chunk = src.read(4 * 1024 * 1024)
                if not chunk:
                    break
                dst.write(chunk)
    path.unlink()
    tmp_path.rename(path)