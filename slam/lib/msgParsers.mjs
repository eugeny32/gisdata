// Механический перенос struct-парсеров сырых ROS1-сообщений из
// slamcloude/worker/pipeline/s20.py (строки 612-707, 909-947) — офсеты и
// комментарии-инварианты (envelope-время вместо timebase и т.п.) сохранены
// без изменений, только struct.unpack_from -> Buffer.read*LE.

const CUSTOM_POINT_SIZE = 4 + 4 + 4 + 4 + 1 + 1 + 1; // offset_time,x,y,z,reflectivity,tag,line (packed, no padding)

function headerEnd(raw) {
  // uint32 seq + uint32 stamp.sec + uint32 stamp.nsec + (uint32 len + bytes) frame_id
  const off = 12;
  const fidLen = raw.readUInt32LE(off);
  return off + 4 + fidLen;
}

/**
 * Parse livox_ros_driver2/msg/CustomMsg (ROS1 wire format).
 *
 * msgTimeSec is the bag's own envelope timestamp for this message, used as
 * the point-time base instead of the message's embedded `timebase` field:
 * on real S20 recordings `timebase` runs on the Livox unit's own
 * free-running/unsynced internal clock and can be off from the true
 * recording time by a large, effectively constant offset (observed: ~1.5
 * years) — while every other topic (RTK, camera, on-device SLAM's own
 * frame_pose.txt) is timestamped against the bag's envelope clock.
 *
 * @returns {{x: Float64Array, y: Float64Array, z: Float64Array, t: Float64Array, intensity: Float64Array}}
 */
export function parseCustomMsgLidar(raw, msgTimeSec) {
  try {
    let off = headerEnd(raw);
    off += 8; // timebase -- unreliable, ignored (see docstring above)
    off += 4; // point_num (redundant with array length below)
    off += 4; // lidar_id (1) + rsvd (3)
    const arrLen = raw.readUInt32LE(off);
    off += 4;

    const x = new Float64Array(arrLen);
    const y = new Float64Array(arrLen);
    const z = new Float64Array(arrLen);
    const t = new Float64Array(arrLen);
    const intensity = new Float64Array(arrLen);
    let n = 0;
    for (let i = 0; i < arrLen; i++) {
      const base = off + i * CUSTOM_POINT_SIZE;
      const offsetTime = raw.readUInt32LE(base);
      const px = raw.readFloatLE(base + 4);
      const py = raw.readFloatLE(base + 8);
      const pz = raw.readFloatLE(base + 12);
      const reflectivity = raw.readUInt8(base + 16);
      // Livox emits a body-frame-origin sentinel point for every "no return"
      // sample within a scan -- on real data these are the vast majority of
      // points in some batches and, left in, create a massive coincident
      // cluster that makes downstream outlier removal pathologically slow.
      const rangeSq = px * px + py * py + pz * pz;
      if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(pz) || rangeSq <= 1e-4) {
        continue;
      }
      x[n] = px; y[n] = py; z[n] = pz;
      t[n] = msgTimeSec + offsetTime / 1e9;
      intensity[n] = reflectivity;
      n++;
    }
    return { x: x.subarray(0, n), y: y.subarray(0, n), z: z.subarray(0, n), t: t.subarray(0, n), intensity: intensity.subarray(0, n) };
  } catch {
    const empty = new Float64Array(0);
    return { x: empty, y: empty, z: empty, t: empty, intensity: empty };
  }
}

/** Parse sensor_msgs/msg/CompressedImage (ROS1 wire format). Returns a JPEG Buffer or null. */
export function parseCompressedImageRos1(raw) {
  try {
    let off = headerEnd(raw);
    const fmtLen = raw.readUInt32LE(off);
    off += 4 + fmtLen;
    const dataLen = raw.readUInt32LE(off);
    off += 4;
    return raw.subarray(off, off + dataLen);
  } catch {
    return null;
  }
}

/**
 * Parse sensor_msgs/msg/NavSatFix (ROS1 wire format).
 * Altitude is always 0.0 on this device (RTK agent computes no
 * NTRIP-derived height here).
 * @returns {{status:number, lat:number, lon:number, alt:number}|null}
 */
export function parseNavSatFixRos1(raw) {
  try {
    let off = headerEnd(raw);
    const status = raw.readInt8(off);
    off += 3; // int8 status + uint16 service, no padding
    const lat = raw.readDoubleLE(off);
    const lon = raw.readDoubleLE(off + 8);
    const alt = raw.readDoubleLE(off + 16);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { status, lat, lon, alt };
    }
  } catch {
    /* fall through */
  }
  return null;
}

/**
 * Read raw gyroscope (angular_velocity) + accelerometer (linear_acceleration)
 * samples from sensor_msgs/msg/Imu (ROS1 tightly-packed wire format):
 * Header, then orientation (4x float64) + orientation_covariance (9x
 * float64) before angular_velocity (3x float64, rad/s) +
 * angular_velocity_covariance (9x float64) before linear_acceleration (3x
 * float64, m/s^2) -- offsets fixed regardless of header content since only
 * frame_id has variable length, and headerEnd already accounts for that.
 */
export function parseImuRos1(raw) {
  try {
    let off = headerEnd(raw);
    off += 4 * 8; // orientation (x,y,z,w)
    off += 9 * 8; // orientation_covariance
    const gx = raw.readDoubleLE(off);
    const gy = raw.readDoubleLE(off + 8);
    const gz = raw.readDoubleLE(off + 16);
    off += 3 * 8;
    off += 9 * 8; // angular_velocity_covariance
    const ax = raw.readDoubleLE(off);
    const ay = raw.readDoubleLE(off + 8);
    const az = raw.readDoubleLE(off + 16);
    return { angularVelocity: [gx, gy, gz], linearAcceleration: [ax, ay, az] };
  } catch {
    return null;
  }
}
