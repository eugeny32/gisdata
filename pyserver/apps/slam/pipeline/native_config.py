"""
Port of slam/lib/nativeConfig.mjs. Flat text config for voxelslam_native
(see slam/native/compat/param_reader.hpp): "key=value" per line, "/" inside
a key for nested sections (matches the paths every n.param<T>("Section/key",
...) call in slam/native/src already uses). NOT YAML -- see
param_reader.hpp/compute_slam.py's docstring about yaml-cpp 0.9.0 being
broken on the old MSYS2 build.
"""


def write_native_config_string(obj: dict) -> str:
    """
    obj: nesting at most 1 level deep (top-level scalar/list keys and/or
    top-level dicts of the form {Section: {key: value}}); values are
    str/int/float or a list of numbers (serialized comma-separated).
    """
    lines = []

    def emit(key, value):
        if isinstance(value, (list, tuple)):
            lines.append(f"{key}={','.join(str(v) for v in value)}")
        else:
            lines.append(f"{key}={value}")

    for key, value in obj.items():
        if isinstance(value, dict):
            for sub_key, sub_value in value.items():
                emit(f"{key}/{sub_key}", sub_value)
        else:
            emit(key, value)
    return "\n".join(lines) + "\n"

