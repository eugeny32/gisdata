// COMPUTE_SLAM (Фаза 3 плана переноса slamcloude) — заменяет прежнюю
// заглушку. Готовит вход для нативного voxelslam_native.exe (см.
// slam/native/, собран на сервере из hku-mars/Voxel-SLAM без ROS1/Docker) и
// запускает его как внешний процесс — тот же приём, что уже используется
// для pdal.exe/untwine.exe (slam/steps/buildOctree.mjs).
//
// Два файла, которые нужно подготовить для бинарника:
//  - Промежуточный бинарный файл вместо rosbag::View (см.
//    slam/native/compat/intermediate_format.hpp) — LiDAR(CustomMsg)+IMU
//    записи из bag-файла, отсортированные по envelope-времени.
//  - Плоский текстовый конфиг "key=value" по строкам (читается через
//    ParamReader, см. slam/native/compat/param_reader.hpp) — пути +
//    параметры алгоритма. НЕ YAML: yaml-cpp (mingw-w64 0.9.0 на сервере)
//    оказался сломан (детерминированно теряет данные при повторном обходе
//    YAML::Node, см. докстринг param_reader.hpp) — конфиг тривиален
//    (2 уровня вложенности, скаляры и плоские числовые списки), поэтому
//    вместо отладки/пересборки yaml-cpp зависимость убрали целиком.
//
// Результат бинарника — alidarState.txt (текстовый формат "t x y z qx qy qz
// qw ...", см. slam/native/src/voxelslam.hpp::read_lidarstate) — БАЙТ-В-БАЙТ
// тот же формат, что frame_pose.txt (slam/lib/framePose.mjs), поэтому просто
// регистрируется как ScanInputKind 'frame_pose' — decodeRaw.mjs уже умеет
// подхватывать его вместо вендорского frame_pose.txt из ZIP (см. докстринг
// decodeRaw.mjs), без каких-либо изменений в downstream-шагах.
//
// Best-effort, как и остальные необязательные обогащения в decodeRaw.mjs:
// при отсутствии bag/сбое бинарника шаг просто не регистрирует frame_pose
// input — downstream уходит на вендорский frame_pose.txt (тот же путь
// деградации, что уже был при заглушке).

import { existsSync, readdirSync, statSync, mkdirSync, writeFileSync, rmSync, openSync, writeSync, closeSync, readFileSync, copyFileSync } from "node:fs";
import { join, extname } from "node:path";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";
import { runStep } from "../lib/stepContext.mjs";
import { writeNativeConfigString } from "../lib/nativeConfig.mjs";
import { readMessages } from "../lib/ros1bag.mjs";
import { parseImuRos1 } from "../lib/msgParsers.mjs";
import { extractZip } from "../lib/winZip.mjs";

// Абсолютный путь на сервере ntrip.host, где живёт собранный бинарник (см.
// план, Фаза 3) — тот же принцип фиксированного пути, что PDAL_EXE/
// UNTWINE_EXE в buildOctree.mjs/filterOutliers.mjs. Собирается ОТДЕЛЬНО (см.
// slam/native/CMakeLists.txt) — не часть git-деплоя (платформенный бинарник,
// пересобирается на сервере вручную при обновлении slam/native/*).
const VOXELSLAM_EXE = "C:\\Users\\admin\\bin\\voxelslam_native.exe";

const LIDAR_TOPICS = ["/livox/lidar", "/livox/lidar_node", "/points", "/livox/points"];
// Не подтверждено эмпирически (нет реального S20 bag под рукой, см. план) —
// тот же защитный список вариантов имени топика, что уже применяется для
// LIDAR_TOPICS/CAM_TOPICS/FIX_TOPICS в decodeRaw.mjs. "/livox/imu" — дефолт
// самого Voxel-SLAM (General/imu_topic, см. voxelslam.cpp), остальные —
// частые альтернативы.
const IMU_TOPICS = ["/livox/imu", "/imu", "/imu/data", "/livox/imu_node"];

const REC_IMU = 1;
const REC_LIDAR = 2;
const CUSTOM_POINT_SIZE = 4 + 4 + 4 + 4 + 1 + 1 + 1; // offset_time,x,y,z,reflectivity,tag,line — см. intermediate_format.hpp

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function findBagAndCalibration(extractDir) {
  const files = walk(extractDir).filter((f) => !f.includes("__MACOSX"));
  const bags = files.filter((f) => extname(f).toLowerCase() === ".bag");
  bags.sort((a, b) => statSync(b).size - statSync(a).size);
  const bag = bags[0] || null;
  const calibration = files.find((f) => f.toLowerCase().endsWith("calibration.yaml")) || null;
  return { bag, calibration };
}

function headerEnd(raw) {
  const off = 12;
  const fidLen = raw.readUInt32LE(off);
  return off + 4 + fidLen;
}

/**
 * Находит смещение и число точек в сыром теле livox_ros_driver/CustomMsg
 * (ROS1 wire format), БЕЗ декодирования отдельных точек — байтовый layout
 * (offset_time u32 + x/y/z f32 + reflectivity/tag/line u8, packed) уже
 * СОВПАДАЕТ с CustomPoint из intermediate_format.hpp, поэтому нужные байты
 * можно просто скопировать as-is в промежуточный файл.
 *
 * Сознательно НЕ переиспользует msgParsers.mjs::parseCustomMsgLidar — та
 * функция уже фильтрует sentinel-точки (range<=1e-4) и меняет масштаб
 * intensity для LAS-вывода в decodeRaw.mjs. Нативный код (feature_point.hpp
 * livox_handler) сам делает эквивалентную фильтрацию по General/blind и
 * децимацию по point_filter_num над СЫРЫМИ полями — предварительная
 * фильтрация здесь была бы избыточной и рисковала бы разойтись с
 * оригинальной семантикой ROS-пайплайна.
 */
function rawCustomMsgPoints(raw) {
  try {
    let off = headerEnd(raw);
    off += 8; // timebase (не используется, см. msgParsers.mjs)
    off += 4; // point_num (избыточно, есть длина массива ниже)
    off += 4; // lidar_id(1) + rsvd(3)
    const n = raw.readUInt32LE(off);
    off += 4;
    const need = off + n * CUSTOM_POINT_SIZE;
    if (n === 0 || need > raw.length) return null;
    return { count: n, bytes: raw.subarray(off, need) };
  } catch {
    return null;
  }
}

function writeImuRecord(fd, timeSec, av, la) {
  const buf = Buffer.alloc(1 + 8 + 48);
  buf.writeUInt8(REC_IMU, 0);
  buf.writeDoubleLE(timeSec, 1);
  let o = 9;
  for (const v of av) { buf.writeDoubleLE(v, o); o += 8; }
  for (const v of la) { buf.writeDoubleLE(v, o); o += 8; }
  writeSync(fd, buf);
}

function writeLidarRecord(fd, timeSec, count, pointBytes) {
  const header = Buffer.alloc(1 + 8 + 4);
  header.writeUInt8(REC_LIDAR, 0);
  header.writeDoubleLE(timeSec, 1);
  header.writeUInt32LE(count, 9);
  writeSync(fd, header);
  writeSync(fd, pointBytes);
}

/**
 * Пишет промежуточный файл (см. intermediate_format.hpp), строго
 * упорядоченный по envelope-времени. IMU-сэмплы малы (единицы МБ на весь
 * скан) — читаются один раз и буферизуются целиком в памяти. LiDAR-точки
 * (потенциально гигабайты на длинную запись) НИКОГДА не буферизуются —
 * читаются и сразу пишутся в выходной файл. Оба потока (IMU-only,
 * LiDAR-only) сами по себе гарантированно монотонны по времени (ROS-топик
 * публикуется строго вперёд по времени одним источником) — слияние их
 * как в classic merge-sort даёт строго глобально упорядоченный результат
 * без полной буферизации LiDAR, в отличие от "накопить всё -> отсортировать".
 *
 * @returns {number} общее число записанных LiDAR-сообщений (0 => бага нет данных)
 */
function writeIntermediateFile(bagPath, outPath) {
  const imu = [];
  for (const msg of readMessages(bagPath, IMU_TOPICS)) {
    const parsed = parseImuRos1(msg.data);
    if (parsed) imu.push({ t: msg.timeSec, av: parsed.angularVelocity, la: parsed.linearAcceleration });
  }
  let imuIdx = 0;

  const fd = openSync(outPath, "w");
  let lidarCount = 0;
  try {
    for (const msg of readMessages(bagPath, LIDAR_TOPICS)) {
      const pts = rawCustomMsgPoints(msg.data);
      if (!pts) continue;
      while (imuIdx < imu.length && imu[imuIdx].t <= msg.timeSec) {
        writeImuRecord(fd, imu[imuIdx].t, imu[imuIdx].av, imu[imuIdx].la);
        imuIdx++;
      }
      writeLidarRecord(fd, msg.timeSec, pts.count, pts.bytes);
      lidarCount++;
    }
    while (imuIdx < imu.length) {
      writeImuRecord(fd, imu[imuIdx].t, imu[imuIdx].av, imu[imuIdx].la);
      imuIdx++;
    }
  } finally {
    closeSync(fd);
  }
  return lidarCount;
}

/**
 * LiDAR->IMU экстринзик (General/extrinsic_tran/extrinsic_rota) —
 * ОБЯЗАТЕЛЬНО непустые 3/9-элементные векторы: конструктор VOXEL_SLAM
 * (voxelslam.cpp:794-797) индексирует vecT[0..2]/vecR[0..8] без проверки
 * размера — при отсутствующем ключе n.param вернул бы пустой вектор по
 * дефолту, и это была бы UB (выход за границы). Identity — только
 * запасной дефолт, если файла нет вообще.
 *
 * ИСПРАВЛЕНО: реальный calibration.yaml (проверено на скане 1, "Шоссейная
 * 39А") хранит экстринзик как ДВА ОТДЕЛЬНЫХ ключа верхнего уровня —
 * LIDAR_IMU_T (плоский 3-вектор) + LIDAR_IMU_R (3x3 opencv-matrix), а НЕ
 * под extrinsic.lidar_imu (там только камеры). Старый код искал только
 * второй, несуществующий для этого файла путь и тихо подставлял identity
 * ПЕРЕВОДА — реальный сдвиг [-0.011, -0.0233, 0.0441] м терялся молча.
 * Разбор calibration.yaml скана e6b4bbe7 (см. план) — единственный ранее
 * виденный файл, где экстринзик действительно лежал под extrinsic.lidar_imu
 * как 4x4 — оставлен запасным путём на случай другого формата файла.
 */
function loadLidarImuExtrinsic(calibrationPath) {
  const identity = { tran: [0, 0, 0], rota: [1, 0, 0, 0, 1, 0, 0, 0, 1] };
  if (!calibrationPath || !existsSync(calibrationPath)) return identity;
  try {
    let text = readFileSync(calibrationPath, "utf8");
    text = text.replace(/^%YAML:[\d.]+\s*\n/, "").replaceAll("!!opencv-matrix", "");
    const d = yaml.load(text);

    if (Array.isArray(d?.LIDAR_IMU_T) && d.LIDAR_IMU_T.length >= 3 && d?.LIDAR_IMU_R) {
      const rMat = d.LIDAR_IMU_R.data ? d.LIDAR_IMU_R.data : d.LIDAR_IMU_R;
      if (Array.isArray(rMat) && rMat.length >= 9) {
        return { tran: d.LIDAR_IMU_T.slice(0, 3), rota: rMat.slice(0, 9) };
      }
    }

    const extRaw = d && d.extrinsic && (d.extrinsic.lidar_imu || d.extrinsic.imu_lidar);
    if (extRaw) {
      const data = extRaw.data ? extRaw.data : extRaw;
      if (Array.isArray(data) && data.length >= 16) {
        // 4x4 row-major (та же OpenCV-matrix конвенция, что lidar_middlecamera
        // в colorize.mjs) -- верхний левый 3x3 = поворот, правый столбец = перенос.
        const rota = [data[0], data[1], data[2], data[4], data[5], data[6], data[8], data[9], data[10]];
        const tran = [data[3], data[7], data[11]];
        return { tran, rota };
      }
    }
    return identity;
  } catch {
    return identity;
  }
}

await runStep(async (ctx) => {
  if (!ctx.bag_lidar_enabled) return {};
  if (!ctx.raw_file_path || !existsSync(ctx.raw_file_path)) return {};

  const scanId = ctx.scan_id;
  const scanDir = ctx.scan_dir.replace(/\\/g, "/");
  const extractDir = join(scanDir, "_extract_slam");
  mkdirSync(scanDir, { recursive: true });
  if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });

  try {
    extractZip(ctx.raw_file_path, extractDir);
    const { bag, calibration } = findBagAndCalibration(extractDir);
    if (!bag) return {};

    const intermediateDir = join(scanDir, "intermediate");
    mkdirSync(intermediateDir, { recursive: true });
    const intermediatePath = join(intermediateDir, "compute_slam.bin").replace(/\\/g, "/");
    const lidarCount = writeIntermediateFile(bag, intermediatePath);
    if (lidarCount === 0) {
      rmSync(intermediatePath, { force: true });
      return {};
    }

    const outDir = join(scanDir, "slam_out");
    if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
    const { tran, rota } = loadLidarImuExtrinsic(calibration);

    const config = {
      intermediate_path: intermediatePath,
      General: {
        save_path: `${scanDir}/`,
        bagname: "slam_out",
        is_save_map: 0,
        lidar_type: 0,
        blind: 0.1,
        point_filter_num: 3,
        extrinsic_tran: tran,
        extrinsic_rota: rota,
      },
      Loop: { enable: 1 },
    };
    const configPath = join(scanDir, "voxelslam_config.txt");
    writeFileSync(configPath, writeNativeConfigString(config), "utf8");

    const run = spawnSync(VOXELSLAM_EXE, [configPath], {
      cwd: scanDir,
      timeout: 2 * 60 * 60 * 1000, // 2 часа — тот же порядок, что STALL_MINUTES в process_slam_jobs.php
      maxBuffer: 256 * 1024 * 1024,
      encoding: "utf8",
    });
    const alidarStatePath = join(outDir, "alidarState.txt");
    if (run.status !== 0 || !existsSync(alidarStatePath)) {
      // status===0 без alidarState.txt — не крах: voxelslam_native.exe
      // (сам вендорский алгоритм, не наш порт) вызывает exit(0) напрямую в
      // нескольких местах при недостаточных для BA данных (напр. "Too Less
      // Voxel" в voxel_map.hpp) — короткие/скудные сканы. В обоих случаях
      // (реальный крах ИЛИ вендорский early-exit) поведение одинаковое:
      // best-effort деградация на вендорский frame_pose.txt, если он есть.
      console.error(
        `voxelslam_native.exe не дал SLAM-траекторию (exit code=${run.status}, signal=${run.signal}); ` +
          "скан продолжит работу без неё (вендорский frame_pose.txt, если есть).\n" +
          `stdout: ${(run.stdout || "").slice(-4000)}\nstderr: ${(run.stderr || "").slice(-4000)}`
      );
      return {};
    }

    const inputsDir = join(scanDir, "inputs");
    mkdirSync(inputsDir, { recursive: true });
    const framePosePath = join(inputsDir, "frame_pose.txt");
    copyFileSync(alidarStatePath, framePosePath);

    return {
      inputs: [{ kind: "frame_pose", path: `${scanId}/inputs/frame_pose.txt`, size: statSync(framePosePath).size }],
    };
  } finally {
    if (existsSync(extractDir)) rmSync(extractDir, { recursive: true, force: true });
  }
});
