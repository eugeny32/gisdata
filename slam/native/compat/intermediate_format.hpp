// Промежуточный бинарный формат вместо rosbag::Bag/View (Фаза 3 плана —
// "Node готовит промежуточный плоский формат из bag-файла, нативный
// бинарник читает его вместо rosbag::View — не портируем сам librosbag").
// Node (slam/steps/computeSlam.mjs, ещё не написан) читает bag через уже
// рабочий slam/lib/ros1bag.mjs + msgParsers.mjs (тот же код, что уже
// используется в decodeRaw.mjs) и пишет ОБА топика (LiDAR CustomMsg + IMU)
// одним файлом, отсортированным по envelope-времени бага — то же
// гарантированное упорядочивание, что rosbag::View(TopicQuery) давал
// оригинальному коду.
//
// Формат записи: [type u8][stamp_sec f64][payload]
//   type=1 (IMU):   angular_velocity(3xf64) + linear_acceleration(3xf64) = 48 байт
//   type=2 (LIDAR):  point_count(u32) + point_count x CustomPoint(19 байт:
//                    offset_time u32, x/y/z f32, reflectivity/tag/line u8)
// Никакого сжатия/выравнивания — файл читается один раз последовательно,
// как и оригинальный rosbag::View::iterator.

#pragma once
#include <cstdint>
#include <cstdio>
#include <stdexcept>
#include <string>
#include <vector>

#include "msg_types.hpp"

enum class IntermRecordType : uint8_t { IMU = 1, LIDAR = 2 };

class IntermediateReader {
 public:
  explicit IntermediateReader(const std::string &path) {
    f_ = std::fopen(path.c_str(), "rb");
    if (!f_) throw std::runtime_error("cannot open intermediate file: " + path);
  }
  ~IntermediateReader() { if (f_) std::fclose(f_); }

  IntermediateReader(const IntermediateReader &) = delete;
  IntermediateReader &operator=(const IntermediateReader &) = delete;

  // Возвращает false, когда файл исчерпан. При true — ровно одно из полей
  // imu/lidar непустое (вызывающий код сам решает, что делать по типу).
  bool next(IntermRecordType &type, ImuSample::Ptr &imu, CustomMsg::Ptr &lidar) {
    uint8_t t;
    if (std::fread(&t, 1, 1, f_) != 1) return false;
    double stamp;
    if (std::fread(&stamp, sizeof(double), 1, f_) != 1) return false;

    if (t == static_cast<uint8_t>(IntermRecordType::IMU)) {
      imu = std::make_shared<ImuSample>();
      imu->header.stamp.fromSec(stamp);
      double buf[6];
      if (std::fread(buf, sizeof(double), 6, f_) != 6) return false;
      imu->angular_velocity = {buf[0], buf[1], buf[2]};
      imu->linear_acceleration = {buf[3], buf[4], buf[5]};
      type = IntermRecordType::IMU;
      lidar.reset();
      return true;
    }

    if (t == static_cast<uint8_t>(IntermRecordType::LIDAR)) {
      lidar = std::make_shared<CustomMsg>();
      lidar->header.stamp.fromSec(stamp);
      uint32_t n;
      if (std::fread(&n, sizeof(uint32_t), 1, f_) != 1) return false;
      lidar->point_num = n;
      lidar->points.resize(n);
      for (uint32_t i = 0; i < n; i++) {
        CustomPoint &p = lidar->points[i];
        if (std::fread(&p.offset_time, sizeof(uint32_t), 1, f_) != 1) return false;
        float xyz[3];
        if (std::fread(xyz, sizeof(float), 3, f_) != 3) return false;
        p.x = xyz[0]; p.y = xyz[1]; p.z = xyz[2];
        uint8_t rtl[3];
        if (std::fread(rtl, 1, 3, f_) != 3) return false;
        p.reflectivity = rtl[0]; p.tag = rtl[1]; p.line = rtl[2];
      }
      type = IntermRecordType::LIDAR;
      imu.reset();
      return true;
    }

    throw std::runtime_error("intermediate file: unknown record type");
  }

 private:
  std::FILE *f_ = nullptr;
};
