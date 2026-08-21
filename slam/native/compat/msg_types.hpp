// Замена ROS-типов сообщений на простые POD-структуры (Фаза 3 плана).
// S20 всегда использует только Livox MID-360 (livox_ros_driver::CustomMsg)
// — многолидарная поддержка (Velodyne/Ouster/Hesai/RoboSense) в исходнике
// Voxel-SLAM НЕ нужна для этого проекта и не портируется (см. план,
// раздел "Разбор вендорского share_slam2_offline.exe" — у вендора она
// тоже узкая часть общего движка, не специфика самого SLAM-ядра).
//
// Форма структур (Header{stamp}, Vec3-подобные x/y/z под-объекты) намеренно
// повторяет форму настоящих ROS-сообщений — не решение "из вакуума", а
// подгонка под фактические обращения в НЕИЗМЕНЁННЫХ файлах (ekf_imu.hpp:
// `imu->angular_velocity.x`, `imu->header.stamp.toSec()/.fromSec(t)`) —
// так эти файлы (чистая математика EKF, без единого ros::) остаются
// портированными МЕХАНИЧЕСКИ, без правок вообще.
//
// Layout полей CustomPoint/CustomMsg — тот же, что уже подтверждён и
// используется в slam/lib/msgParsers.mjs (Node-порт struct-парсера ROS1
// wire-формата) и в decodeRaw.mjs. Промежуточный формат, который Node
// готовит из bag-файла для этого нативного бинарника (взамен
// rosbag::View), должен сериализовать значения В ТОЧНОСТИ в эти поля —
// см. slam/native/compat/intermediate_format.hpp.

#pragma once
#include <cstdint>
#include <memory>
#include <string>
#include <vector>

struct Vec3 {
  double x = 0, y = 0, z = 0;
};

// Заменяет ros::Time — только .toSec()/.fromSec(), больше ничего из
// реального ros::Time нигде не используется (проверено grep по всему
// исходнику).
struct TimeStamp {
  double t = 0;
  double toSec() const { return t; }
  void fromSec(double s) { t = s; }
};

struct Header {
  TimeStamp stamp;
  int seq = 0;
  std::string frame_id;
};

struct CustomPoint {
  uint32_t offset_time = 0;  // ns от начала скана (то же поле, что Livox CustomMsg)
  float x = 0, y = 0, z = 0;
  uint8_t reflectivity = 0;
  uint8_t tag = 0;
  uint8_t line = 0;
};

struct CustomMsg {
  using Ptr = std::shared_ptr<CustomMsg>;
  using ConstPtr = std::shared_ptr<const CustomMsg>;

  Header header;
  uint32_t point_num = 0;
  std::vector<CustomPoint> points;
};

struct ImuSample {
  using Ptr = std::shared_ptr<ImuSample>;
  using ConstPtr = std::shared_ptr<const ImuSample>;

  Header header;
  Vec3 angular_velocity;
  Vec3 linear_acceleration;
};

// Замена ros::Publisher/ros::Subscriber/tf::TransformBroadcaster — эта
// сборка headless (без RViz), 7 паблишеров + tf-трансляция позы из
// оригинала (Фаза 3 плана) просто становятся тихими no-op вместо удаления
// каждого места вызова по всему voxelslam.cpp (~20 мест) — функционально
// эквивалентно, но не требует трогать саму логику SLAM вокруг них.
struct NullPublisher {
  template <typename T>
  void publish(const T &) const {}
};
