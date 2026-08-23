"""
Thin wrapper around the `rosbags` package for reading ROS1 bag files --
replaces the hand-rolled container reader in slam/lib/ros1bag.mjs (written
against the raw ROS1 bag format spec, http://wiki.ros.org/Bags/Format/2.0,
because Node has no `rosbags` equivalent -- see that file's own docstring
for why it wasn't a mechanical port of anything). Python has the real
package: besides not needing a hand-rolled container reader, `rosbags`
also handles lz4-compressed chunks (the old JS reader only supported bz2
via `seek-bzip`, since that's what rosbag record's default --compression
produces -- lz4 is rarer but now free to support too).
"""

from pathlib import Path

from rosbags.rosbag1 import Reader


def read_messages(bag_path, topics: set[str] | None = None):
    """
    Yields (topic, time_sec, data) for every message in the bag whose topic
    is in `topics` (or all topics if `topics` is None). `data` is the raw
    serialized ROS1 message bytes for that connection -- same format the
    hand-rolled reader's MESSAGE_DATA record.data gave, so
    slam.pipeline.msg_parsers's byte-offset parsers apply unchanged.
    """
    with Reader(Path(bag_path)) as reader:
        connections = [c for c in reader.connections if topics is None or c.topic in topics]
        if not connections:
            return
        for connection, timestamp, rawdata in reader.messages(connections=connections):
            yield connection.topic, timestamp / 1e9, rawdata

