"""
Port of app/lib/rinex_merge.php. Stitches multiple hourly RINEX files of
one station/type into "per-day" files. Rules:
  1) Only merge files WITHOUT a gap between them -- if one file's end
     (its start + nominal duration from the filename) and the next
     file's start differ by more than gap_tolerance_minutes, that's two
     separate continuous stretches -> two separate output files, not one
     with a hole in the middle.
  2) A merge never crosses a UTC day boundary -- even back-to-back 23:00
     and 00:00-next-day files land in different days and never merge,
     mirroring how the FTP server itself is organized (one day, one
     folder).

Merging the RINEX content itself is line-based: a file has one header up
to and including "END OF HEADER", then data. For a merged file, the
header comes from the first (by time) file in the group; every other
file's header is stripped entirely, leaving only data. Works the same
for observation and navigation files -- both formats mark end-of-header
with the same "END OF HEADER" label.
"""

from datetime import timedelta


def rinex_group_contiguous_files(files: list[dict], gap_tolerance_minutes: int = 5) -> list[list[dict]]:
    """files: each a dict with 'local_path', 'timestamp' (naive datetime),
    'period_minutes' (int|None). Must already belong to one station and
    one type (MO or MN) -- that grouping happens before this call, in
    the process_rinex_requests management command."""
    files = sorted(files, key=lambda f: f["timestamp"])

    groups: list[list[dict]] = []
    current: list[dict] = []
    expected_next_start = None

    for file in files:
        if current and expected_next_start is not None:
            diff_minutes = (file["timestamp"] - expected_next_start).total_seconds() / 60
            same_day = file["timestamp"].date() == current[0]["timestamp"].date()
            if not same_day or diff_minutes > gap_tolerance_minutes:
                groups.append(current)
                current = []
        current.append(file)
        period_minutes = file.get("period_minutes") or 60  # 60 -- sane default if the period token wasn't recognized
        expected_next_start = file["timestamp"] + timedelta(minutes=period_minutes)

    if current:
        groups.append(current)
    return groups


def rinex_merge_group(local_paths_in_order: list[str], output_path: str) -> bool:
    """Physical merge of an already-chronologically-sorted group into one
    new file. A group of ONE file is just a copy, for uniform handling
    upstream (no need to distinguish "merge" from "just copy")."""
    header_done = False
    with open(output_path, "wb") as out:
        for path in local_paths_in_order:
            try:
                fh = open(path, "rb")
            except OSError:
                continue
            with fh:
                skipping_this_files_header = header_done  # False for the group's first file -- header written whole
                for line in fh:
                    if skipping_this_files_header:
                        if b"END OF HEADER" in line:
                            skipping_this_files_header = False
                        continue
                    out.write(line)
                    if not header_done and b"END OF HEADER" in line:
                        header_done = True
    return True