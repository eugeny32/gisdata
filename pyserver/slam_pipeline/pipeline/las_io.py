"""
Port of slam/lib/lasIO.mjs. Minimal, self-contained LAS 1.4 reader/writer --
NOT general-purpose (unlike Python's laspy): supports ONLY point data record
format 6 and 7 (no extra bytes), because that's the only pair this
pipeline's own steps ever produce/consume (decode_raw writes 6, colorize
reads 6 -> writes 7, georeference/ppk_correction read and rewrite whatever
format arrived on input). General LAZ (compression) is not supported --
compression is always a separate pdal call (see build_octree.py), same
pattern already used for COPC conversion elsewhere in this project.

Header/offsets follow the ASPRS LAS 1.4 spec (fixed 375-byte header for
version 1.4, no CRS VLR -- a coordinate system, if needed, is applied by a
separate `pdal translate --writers.las.a_srs`/`--writers.copc.a_srs` call
rather than hand-assembling a WKT VLR here -- simpler and more reliable
than building one by hand).

Vectorized with numpy structured arrays (the original .mjs looped byte-by-
byte since JS has no equivalent) -- same exact binary layout, much faster
for the multi-million-point clouds this pipeline handles.
"""

import struct

import numpy as np

HEADER_SIZE = 375
POINT_SIZE = {6: 30, 7: 36}

_DTYPE_6 = np.dtype([
    ("x", "<i4"), ("y", "<i4"), ("z", "<i4"),
    ("intensity", "<u2"),
    ("return_byte", "u1"), ("flags_byte", "u1"), ("classification", "u1"), ("user_data", "u1"),
    ("scan_angle", "<i2"), ("point_source_id", "<u2"),
    ("gps_time", "<f8"),
])
_DTYPE_7 = np.dtype(_DTYPE_6.descr + [("red", "<u2"), ("green", "<u2"), ("blue", "<u2")])
assert _DTYPE_6.itemsize == POINT_SIZE[6]
assert _DTYPE_7.itemsize == POINT_SIZE[7]


def _dtype_for(point_format: int) -> np.dtype:
    return _DTYPE_7 if point_format == 7 else _DTYPE_6


def _write_header(f, point_format, scale, offset, count, mins, maxs):
    buf = bytearray(HEADER_SIZE)
    buf[0:4] = b"LASF"
    struct.pack_into("<H", buf, 4, 0)  # file source ID
    struct.pack_into("<H", buf, 6, 1)  # global encoding: bit0 = standard GPS time
    # GUID (16 bytes) left zero
    buf[24] = 1  # version major
    buf[25] = 4  # version minor
    buf[26:26 + len(b"OTHER")] = b"OTHER"
    buf[58:58 + len(b"gisdata-slam")] = b"gisdata-slam"
    struct.pack_into("<H", buf, 90, 0)  # creation day of year
    struct.pack_into("<H", buf, 92, 0)  # creation year
    struct.pack_into("<H", buf, 94, HEADER_SIZE)
    struct.pack_into("<I", buf, 96, HEADER_SIZE)  # offset to point data (no VLRs)
    struct.pack_into("<I", buf, 100, 0)  # number of VLRs
    buf[104] = point_format
    struct.pack_into("<H", buf, 105, POINT_SIZE[point_format])
    struct.pack_into("<I", buf, 107, count if count <= 0xFFFFFFFF else 0)  # legacy count
    struct.pack_into("<5I", buf, 111, 0, 0, 0, 0, 0)  # legacy points by return
    struct.pack_into("<3d", buf, 131, *scale)
    struct.pack_into("<3d", buf, 155, *offset)
    struct.pack_into("<dddddd", buf, 179, maxs[0], mins[0], maxs[1], mins[1], maxs[2], mins[2])
    struct.pack_into("<Q", buf, 227, 0)  # start of waveform data packet record
    struct.pack_into("<Q", buf, 235, 0)  # start of first extended VLR
    struct.pack_into("<I", buf, 243, 0)  # number of extended VLRs
    struct.pack_into("<Q", buf, 247, count)
    struct.pack_into("<15Q", buf, 255, *([0] * 15))
    f.write(bytes(buf))


def write_las(path, point_format, x, y, z, gps_time=None, intensity=None, red=None, green=None, blue=None, scale=(0.001, 0.001, 0.001)):
    """
    x/y/z: array-like of float64 (metres). gps_time/intensity: array-like of
    float64, optional. red/green/blue: array-like of uint8 (0-255), required
    for point_format 7.
    """
    if point_format not in (6, 7):
        raise ValueError(f"Unsupported point format {point_format} (only 6/7)")
    if point_format == 7 and (red is None or green is None or blue is None):
        raise ValueError("point format 7 requires red/green/blue")

    x = np.asarray(x, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    z = np.asarray(z, dtype=np.float64)
    n = x.shape[0]

    if n:
        x_min, y_min, z_min = float(x.min()), float(y.min()), float(z.min())
        x_max, y_max, z_max = float(x.max()), float(y.max()), float(z.max())
    else:
        x_min = y_min = z_min = x_max = y_max = z_max = 0.0

    offset = (x_min, y_min, z_min)
    dtype = _dtype_for(point_format)
    points = np.zeros(n, dtype=dtype)
    points["x"] = np.round((x - offset[0]) / scale[0]).astype(np.int32)
    points["y"] = np.round((y - offset[1]) / scale[1]).astype(np.int32)
    points["z"] = np.round((z - offset[2]) / scale[2]).astype(np.int32)
    if intensity is not None:
        points["intensity"] = np.clip(np.round(np.asarray(intensity, dtype=np.float64)), 0, 65535).astype(np.uint16)
    points["return_byte"] = 1  # return number=1, number of returns=1 (packed, matches original byte-for-byte)
    if gps_time is not None:
        points["gps_time"] = np.asarray(gps_time, dtype=np.float64)
    if point_format == 7:
        points["red"] = np.asarray(red, dtype=np.uint16) * 257
        points["green"] = np.asarray(green, dtype=np.uint16) * 257
        points["blue"] = np.asarray(blue, dtype=np.uint16) * 257

    with open(path, "wb") as f:
        _write_header(f, point_format, scale, offset, n, (x_min, y_min, z_min), (x_max, y_max, z_max))
        f.write(points.tobytes())


class LasData:
    __slots__ = (
        "point_format", "count", "scale", "offset",
        "x", "y", "z", "intensity", "gps_time", "red", "green", "blue",
    )

    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


def read_las(path) -> LasData:
    """Reads an entire LAS (format 6/7) into memory as numpy arrays. For
    files produced by this pipeline's own steps only (see module docstring)
    -- arbitrary third-party LAS files with extra bytes/other formats are
    out of scope."""
    with open(path, "rb") as f:
        header = f.read(HEADER_SIZE)
        if header[0:4] != b"LASF":
            raise ValueError(f"Not a LAS file: {path}")
        point_format = header[104] & 0x7F  # top bit = "has WKT" flag in 1.4, ignore
        if point_format not in (6, 7):
            raise ValueError(f"Unsupported point format {point_format} in {path}")
        point_data_offset = struct.unpack_from("<I", header, 96)[0]
        point_size = struct.unpack_from("<H", header, 105)[0]
        scale = struct.unpack_from("<3d", header, 131)
        offset = struct.unpack_from("<3d", header, 155)
        (count,) = struct.unpack_from("<Q", header, 247)
        if count == 0:
            count = struct.unpack_from("<I", header, 107)[0]  # fall back to legacy count

        f.seek(point_data_offset)
        dtype = _dtype_for(point_format)
        raw = f.read(count * point_size)
        points = np.frombuffer(raw, dtype=dtype, count=count)

    x = points["x"].astype(np.float64) * scale[0] + offset[0]
    y = points["y"].astype(np.float64) * scale[1] + offset[1]
    z = points["z"].astype(np.float64) * scale[2] + offset[2]
    intensity = points["intensity"].astype(np.float64)
    gps_time = points["gps_time"].astype(np.float64)
    red = green = blue = None
    if point_format == 7:
        red = np.round(points["red"].astype(np.float64) / 257).astype(np.uint8)
        green = np.round(points["green"].astype(np.float64) / 257).astype(np.uint8)
        blue = np.round(points["blue"].astype(np.float64) / 257).astype(np.uint8)

    return LasData(
        point_format=point_format, count=count, scale=scale, offset=offset,
        x=x, y=y, z=z, intensity=intensity, gps_time=gps_time, red=red, green=green, blue=blue,
    )
