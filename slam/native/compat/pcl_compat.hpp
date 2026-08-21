// Минимальная замена PCL для нативной сборки Voxel-SLAM без ROS/catkin
// (Фаза 3 плана переноса slamcloude). Полная PCL сюда НЕ тянется —
// реальное использование в исходнике Voxel-SLAM (проверено построчным
// grep по всем src/*.cpp,*.hpp) сводится ровно к пяти вещам:
//   1. pcl::PointXYZ / PointXYZI / PointXYZINormal — простые POD-точки.
//   2. pcl::PointCloud<T> — по сути std::vector<T> с полями width/height/
//      is_dense и .makeShared().
//   3. pcl::KdTreeFLANN<T> — setInputCloud/nearestKSearch/radiusSearch.
//   4. pcl::io::loadPCDFile/savePCDFileBinary — только для
//      pcl::PointXYZI, только для сохранения/чтения "предыдущей карты"
//      между сессиями (save_pcd/previous_map_read в voxelslam.cpp) —
//      читает и пишет всегда один и тот же код, поэтому формат можно
//      сделать твёрдо своим (фиксированный бинарный layout), не общий
//      PCD-парсер для произвольных чужих файлов.
//
// KdTreeFLANN здесь — ПРЯМОЙ линейный перебор (brute-force), не
// настоящее k-d дерево. Сознательное упрощение, не забытая оптимизация:
// оба места использования (BTC.cpp) ищут среди "ключевых" точек STD-
// дескрипторов (одна точка на кластер плоскости на кадр) — это сотни-
// тысячи точек, не сырое облако точек лидара, поэтому O(n) на запрос
// достаточно быстро. Если на реальных данных выяснится, что это узкое
// место — заменить на настоящее дерево (напр. nanoflann), не меняя
// сигнатуры вызовов в BTC.cpp.

#pragma once
#include <vector>
#include <memory>
#include <string>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <stdexcept>
#include <limits>
#include <algorithm>

// `uint` — не стандартный C++-тип, а удобный typedef, обычно доступный на
// Linux/glibc через sys/types.h (транзитивно попадал в область видимости
// через ROS/PCL-заголовки в оригинале) — MinGW его не определяет. 4 места
// использования в исходнике (BTC.cpp/voxelslam.cpp), проще один typedef
// здесь, чем везде заменять на unsigned int.
using uint = unsigned int;

namespace pcl {

struct PointXYZ {
  float x = 0, y = 0, z = 0;
};

struct PointXYZI {
  float x = 0, y = 0, z = 0, intensity = 0;
};

struct PointXYZINormal {
  float x = 0, y = 0, z = 0, intensity = 0;
  float normal_x = 0, normal_y = 0, normal_z = 0, curvature = 0;
};

// Минимальная замена pcl::PCLHeader (только поле seq реально читается в
// портируемом коде — BTC.cpp индексирует loop-closure совпадения по нему).
struct PCLHeader {
  uint32_t seq = 0;
  uint64_t stamp = 0;
  std::string frame_id;
};

template <typename T>
class PointCloud {
 public:
  using Ptr = std::shared_ptr<PointCloud<T>>;
  using ConstPtr = std::shared_ptr<const PointCloud<T>>;

  PCLHeader header;
  std::vector<T> points;
  uint32_t width = 0;
  uint32_t height = 1;
  bool is_dense = true;

  size_t size() const { return points.size(); }
  bool empty() const { return points.empty(); }
  void clear() { points.clear(); width = 0; }
  void reserve(size_t n) { points.reserve(n); }
  void resize(size_t n) { points.resize(n); width = static_cast<uint32_t>(n); }
  void push_back(const T &p) {
    points.push_back(p);
    width = static_cast<uint32_t>(points.size());
  }
  T &operator[](size_t i) { return points[i]; }
  const T &operator[](size_t i) const { return points[i]; }
  T &front() { return points.front(); }
  const T &front() const { return points.front(); }
  T &back() { return points.back(); }
  const T &back() const { return points.back(); }
  void swap(PointCloud<T> &other) {
    points.swap(other.points);
    std::swap(width, other.width);
    std::swap(height, other.height);
    std::swap(is_dense, other.is_dense);
  }
  typename std::vector<T>::iterator begin() { return points.begin(); }
  typename std::vector<T>::iterator end() { return points.end(); }
  typename std::vector<T>::const_iterator begin() const { return points.begin(); }
  typename std::vector<T>::const_iterator end() const { return points.end(); }

  // PCL's makeShared() copies the cloud into a new shared_ptr-owned instance.
  Ptr makeShared() const { return std::make_shared<PointCloud<T>>(*this); }
};

// --- KdTreeFLANN: brute-force stand-in, see file header for rationale ---
template <typename T>
class KdTreeFLANN {
 public:
  using Ptr = std::shared_ptr<KdTreeFLANN<T>>;

  void setInputCloud(const typename PointCloud<T>::Ptr &cloud) { cloud_ = cloud; }
  void setInputCloud(const typename PointCloud<T>::ConstPtr &cloud) {
    cloud_ = std::const_pointer_cast<PointCloud<T>>(cloud);
  }

  int nearestKSearch(const T &query, int k, std::vector<int> &indices,
                      std::vector<float> &sqDistances) const {
    if (!cloud_ || cloud_->empty()) { indices.clear(); sqDistances.clear(); return 0; }
    const size_t n = cloud_->size();
    std::vector<std::pair<float, int>> all(n);
    for (size_t i = 0; i < n; i++) {
      all[i] = {sqDist(query, cloud_->points[i]), static_cast<int>(i)};
    }
    const size_t kk = std::min<size_t>(static_cast<size_t>(k), n);
    std::partial_sort(all.begin(), all.begin() + kk, all.end(),
                       [](const auto &a, const auto &b) { return a.first < b.first; });
    indices.resize(kk);
    sqDistances.resize(kk);
    for (size_t i = 0; i < kk; i++) { indices[i] = all[i].second; sqDistances[i] = all[i].first; }
    return static_cast<int>(kk);
  }

  int radiusSearch(const T &query, double radius, std::vector<int> &indices,
                    std::vector<float> &sqDistances) const {
    indices.clear();
    sqDistances.clear();
    if (!cloud_) return 0;
    const float r2 = static_cast<float>(radius * radius);
    for (size_t i = 0; i < cloud_->size(); i++) {
      float d2 = sqDist(query, cloud_->points[i]);
      if (d2 <= r2) { indices.push_back(static_cast<int>(i)); sqDistances.push_back(d2); }
    }
    return static_cast<int>(indices.size());
  }

 private:
  static float sqDist(const T &a, const T &b) {
    float dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }
  typename PointCloud<T>::Ptr cloud_;
};

namespace io {

// Собственный фиксированный бинарный формат (НЕ настоящий .pcd, см.
// докстринг файла) — читается и пишется только этим же кодом, поэтому
// достаточно: magic, точек-число, затем x,y,z,intensity как float32 подряд.
inline int savePCDFileBinary(const std::string &path, const PointCloud<PointXYZI> &cloud) {
  std::ofstream f(path, std::ios::binary);
  if (!f) return -1;
  const char magic[8] = {'V', 'S', 'P', 'C', 'D', '0', '1', '\n'};
  f.write(magic, 8);
  uint64_t n = cloud.size();
  f.write(reinterpret_cast<const char *>(&n), sizeof(n));
  if (n > 0) {
    f.write(reinterpret_cast<const char *>(cloud.points.data()), n * sizeof(PointXYZI));
  }
  return f.good() ? 0 : -1;
}

inline int loadPCDFile(const std::string &path, PointCloud<PointXYZI> &cloud) {
  std::ifstream f(path, std::ios::binary);
  if (!f) return -1;
  char magic[8];
  f.read(magic, 8);
  if (!f || std::memcmp(magic, "VSPCD01\n", 8) != 0) return -1;
  uint64_t n = 0;
  f.read(reinterpret_cast<char *>(&n), sizeof(n));
  if (!f) return -1;
  cloud.resize(static_cast<size_t>(n));
  if (n > 0) {
    f.read(reinterpret_cast<char *>(cloud.points.data()), n * sizeof(PointXYZI));
    if (!f) return -1;
  }
  return 0;
}

}  // namespace io
}  // namespace pcl
