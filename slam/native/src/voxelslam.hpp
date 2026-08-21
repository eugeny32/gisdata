#pragma once

#include "tools.hpp"
#include "ekf_imu.hpp"
#include "voxel_map.hpp"
#include "feature_point.hpp"
#include "loop_refine.hpp"
#include <mutex>
#include <Eigen/Eigenvalues>
#include <malloc.h>
#include "../compat/pcl_compat.hpp"
#include "../compat/msg_types.hpp"
#include "../compat/intermediate_format.hpp"
#include "../compat/posix_shims.hpp"
#include <gtsam/inference/Symbol.h>
#include <gtsam/navigation/ImuFactor.h>
#include <gtsam/navigation/CombinedImuFactor.h>
#include <gtsam/nonlinear/GaussNewtonOptimizer.h>
#include <gtsam/nonlinear/LevenbergMarquardtOptimizer.h>
#include <Eigen/Sparse>
#include <Eigen/SparseQR>
#include "BTC.h"

#ifdef _WIN32
#include <windows.h>
#include <psapi.h>   // GetProcessMemoryInfo (see get_memory() below) -- link with -lpsapi
#include <io.h>      // _access (see VOXEL_SLAM constructor -- replaces POSIX access())
#include <direct.h>  // _mkdir (see VOXEL_SLAM constructor -- replaces system("mkdir ..."))
#else
#include <unistd.h>    // access() (see VOXEL_SLAM constructor) -- real POSIX call, native build
#include <sys/stat.h>  // mkdir() (see VOXEL_SLAM constructor) -- real POSIX call, native build
#endif

using namespace std;

// Было ros::Publisher/ros::Subscriber (7 паблишеров + 2 подписки на живые
// топики) — эта сборка headless, реального ROS-транспорта нет вообще (см.
// NullPublisher в msg_types.hpp). Подписки (sub_imu/sub_pcl) отсюда
// убраны совсем: в оригинале они были для live-топиков, а этот пайплайн
// всегда работает в offline-режиме через IntermediateReader (см. ниже).
NullPublisher pub_scan, pub_cmap, pub_init, pub_pmap;
NullPublisher pub_test, pub_prev_path, pub_curr_path;

template <typename T>
void pub_pl_func(T &pl, NullPublisher &pub)
{
  // Было: сериализация в sensor_msgs::PointCloud2 и publish в RViz-топик.
  // Headless-сборка без визуализации — намеренный no-op (см. комментарий
  // у NullPublisher).
  (void)pl; (void)pub;
}

mutex mBuf;
Features feat;
deque<ImuSample::Ptr> imu_buf;
deque<pcl::PointCloud<PointType>::Ptr> pcl_buf;
deque<double> time_buf;

double imu_last_time = -1;
int point_notime = 0;
double last_pcl_time = -1;

void imu_handler(const ImuSample::ConstPtr &msg_in)
{
  static int flag = 1;
  if(flag)
  {
    flag = 0;
    printf("Time0: %lf\n", msg_in->header.stamp.toSec());
  }

  ImuSample::Ptr msg(new ImuSample(*msg_in));

  // S20 built-in MID-360 IMU reports linear_acceleration in g, not
  // m/s^2 (see slamcloude worker bridges); Voxel-SLAM/ROS expect m/s^2.
  msg->linear_acceleration.x *= 9.80665;
  msg->linear_acceleration.y *= 9.80665;
  msg->linear_acceleration.z *= 9.80665;

  mBuf.lock();
  imu_last_time = msg->header.stamp.toSec();
  imu_buf.push_back(msg);
  mBuf.unlock();
}

template<class T>
void pcl_handler(T &msg)
{
  pcl::PointCloud<PointType>::Ptr pl_ptr(new pcl::PointCloud<PointType>());
  double t0 = feat.process(msg, *pl_ptr);

  if(pl_ptr->empty())
  {
    PointType ap;
    ap.x = 0; ap.y = 0; ap.z = 0;
    ap.intensity = 0; ap.curvature = 0;
    pl_ptr->push_back(ap);
    ap.curvature = 0.09;
    pl_ptr->push_back(ap);
  }

  sort(pl_ptr->begin(), pl_ptr->end(), [](PointType &x, PointType &y)
  {
    return x.curvature < y.curvature;
  });
  while(pl_ptr->back().curvature > 0.11)
    pl_ptr->points.pop_back();

  mBuf.lock();
  time_buf.push_back(t0);
  pcl_buf.push_back(pl_ptr);
  mBuf.unlock();
}


// ---------------- offline intermediate-format reader (slamcloude S20) ----------------
// Было: rosbag::Bag/View — читало LiDAR+IMU топики напрямую из ROS1 bag.
// Здесь вместо этого читает простой бинарный формат, который заранее (до
// запуска этого бинарника) готовит Node из bag-файла (см.
// compat/intermediate_format.hpp) — тот же принцип "нет ROS вообще нигде",
// что и остальная Фаза 3. Логика клампинга/look-ahead НИЖЕ не менялась —
// это тот самый защитный механизм от "LiDAR time regress exit(0)",
// найденный и отлаженный ранее на реальных S20-записях, трогать не нужно.
static IntermediateReader *g_reader = nullptr;
static bool   g_bag_open = false;
static bool   g_bag_done = false;
// One LiDAR scan is held one step behind (look-ahead) so its intra-scan
// offset_time span can be clamped to the ACTUAL interval to the next scan.
static CustomMsg::Ptr g_pending_lid;
static bool   g_have_pending = false;

inline void offline_bag_open(const string &intermediate_path)
{
  g_reader = new IntermediateReader(intermediate_path);
  g_bag_open = true;
  printf("[offline] opened intermediate data file %s\n", intermediate_path.c_str());
}

// Clamp a scan's intra-scan offset_time span to <= budget seconds (but never
// above a 60ms default), then hand it to the LiDAR callback. Clamping each
// scan to the MEASURED interval to the next scan keeps pcl_end_time from
// overrunning the next scan's begin, which trips ekf_imu.hpp's >10ms "LiDAR
// time regress" exit(0). A fixed 60ms clamp is too coarse for bags whose
// record times jitter below that (e.g. 6fb3: consecutive scans ~33ms apart,
// prev-end overran next-begin by 27ms -> exit(0)).
inline void feed_lidar_clamped(const CustomMsg::Ptr &lm2, double budget_s)
{
  uint32_t maxoff = 0;
  for(const auto &pt : lm2->points)
    if(pt.offset_time > maxoff) maxoff = pt.offset_time;
  uint32_t cap = 60000000u;  // 60ms default cap (ns)
  if(budget_s > 0.0)
  {
    double bns = budget_s * 1e9;
    if(bns < 1000000.0) bns = 1000000.0;   // never clamp below 1ms
    if(bns < (double)cap) cap = (uint32_t)bns;
  }
  if(maxoff > cap && maxoff > 0)
  {
    double sc = (double)cap / (double)maxoff;
    for(auto &pt : lm2->points)
      pt.offset_time = (uint32_t)(pt.offset_time * sc);
  }
  // pcl_handler takes a non-const T& (template), so pass a named lvalue.
  CustomMsg::ConstPtr lm2c(lm2);
  pcl_handler(lm2c);
}

// Feed up to max_msgs messages from the intermediate file into the same
// buffers the ROS callbacks would fill. Returns false once the file is
// exhausted. LiDAR scans are released one step behind so each can be
// clamped to its measured interval; IMU is fed immediately (the <=1-scan
// LiDAR lag is absorbed by sync_packages, which matches LiDAR to IMU by
// timestamp).
inline bool offline_bag_feed(int max_msgs)
{
  if(!g_bag_open) return false;
  int n = 0;
  IntermRecordType type;
  ImuSample::Ptr imu;
  CustomMsg::Ptr lidar;
  while(n < max_msgs && g_reader->next(type, imu, lidar))
  {
    if(type == IntermRecordType::LIDAR)
    {
      if(g_have_pending)
      {
        double budget = (lidar->header.stamp.toSec()
                         - g_pending_lid->header.stamp.toSec()) - 0.001;
        feed_lidar_clamped(g_pending_lid, budget);
      }
      g_pending_lid = lidar;
      g_have_pending = true;
    }
    else if(type == IntermRecordType::IMU)
    {
      imu_handler(ImuSample::ConstPtr(imu));
    }
    ++n;
  }
  if(n < max_msgs)  // reader exhausted before filling the batch
  {
    if(g_have_pending)   // flush the final scan with the default 60ms cap
    {
      feed_lidar_clamped(g_pending_lid, -1.0);
      g_have_pending = false;
    }
    g_bag_done = true;
  }
  return !g_bag_done;
}

bool sync_packages(pcl::PointCloud<PointType>::Ptr &pl_ptr, deque<ImuSample::Ptr> &imus, IMUEKF &p_imu)
{
  static bool pl_ready = false;

  if(!pl_ready)
  {
    if(pcl_buf.empty()) return false;

    mBuf.lock();
    pl_ptr = pcl_buf.front();
    p_imu.pcl_beg_time = time_buf.front();
    pcl_buf.pop_front(); time_buf.pop_front();
    mBuf.unlock();

    p_imu.pcl_end_time = p_imu.pcl_beg_time + pl_ptr->back().curvature;

    if(point_notime)
    {
      if(last_pcl_time < 0)
      {
        last_pcl_time = p_imu.pcl_beg_time;
        return false;
      }

      p_imu.pcl_end_time = p_imu.pcl_beg_time;
      p_imu.pcl_beg_time = last_pcl_time;
      last_pcl_time = p_imu.pcl_end_time;
    }

    pl_ready = true;
  }

  if(!pl_ready || imu_last_time <= p_imu.pcl_end_time) return false;

  mBuf.lock();
  double imu_time = imu_buf.front()->header.stamp.toSec();
  while((!imu_buf.empty()) && (imu_time < p_imu.pcl_end_time))
  {
    imu_time = imu_buf.front()->header.stamp.toSec();
    if(imu_time > p_imu.pcl_end_time) break;
    imus.push_back(imu_buf.front());
    imu_buf.pop_front();
  }
  mBuf.unlock();

  if(imu_buf.empty())
  {
    printf("imu buf empty\n"); exit(0);
  }

  pl_ready = false;

  if(imus.size() > 4)
    return true;
  else
    return false;
}

double dept_err, beam_err;
void calcBodyVar(Eigen::Vector3d &pb, const float range_inc, const float degree_inc, Eigen::Matrix3d &var)
{
  if (pb[2] == 0)
    pb[2] = 0.0001;
  float range = sqrt(pb[0] * pb[0] + pb[1] * pb[1] + pb[2] * pb[2]);
  float range_var = range_inc * range_inc;
  Eigen::Matrix2d direction_var;
  direction_var << pow(sin(DEG2RAD(degree_inc)), 2), 0, 0, pow(sin(DEG2RAD(degree_inc)), 2);
  Eigen::Vector3d direction(pb);
  direction.normalize();
  Eigen::Matrix3d direction_hat;
  direction_hat << 0, -direction(2), direction(1), direction(2), 0, -direction(0), -direction(1), direction(0), 0;
  Eigen::Vector3d base_vector1(1, 1, -(direction(0) + direction(1)) / direction(2));
  base_vector1.normalize();
  Eigen::Vector3d base_vector2 = base_vector1.cross(direction);
  base_vector2.normalize();
  Eigen::Matrix<double, 3, 2> N;
  N << base_vector1(0), base_vector2(0), base_vector1(1), base_vector2(1), base_vector1(2), base_vector2(2);
  Eigen::Matrix<double, 3, 2> A = range * direction_hat * N;
  var = direction * range_var * direction.transpose() + A * direction_var * A.transpose();
};

// Compute the variance of the each point
void var_init(IMUST &ext, pcl::PointCloud<PointType> &pl_cur, PVecPtr pptr, double dept_err, double beam_err)
{
  int plsize = pl_cur.size();
  pptr->clear();
  pptr->resize(plsize);
  for(int i=0; i<plsize; i++)
  {
    PointType &ap = pl_cur[i];
    pointVar &pv = pptr->at(i);
    pv.pnt << ap.x, ap.y, ap.z;
    calcBodyVar(pv.pnt, dept_err, beam_err, pv.var);
    pv.pnt = ext.R * pv.pnt + ext.p;
    pv.var = ext.R * pv.var * ext.R.transpose();
  }
}

void pvec_update(PVecPtr pptr, IMUST &x_curr, PLV(3) &pwld)
{
  Eigen::Matrix3d rot_var = x_curr.cov.block<3, 3>(0, 0);
  Eigen::Matrix3d tsl_var = x_curr.cov.block<3, 3>(3, 3);

  for(pointVar &pv: *pptr)
  {
    Eigen::Matrix3d phat = hat(pv.pnt);
    pv.var = x_curr.R * pv.var * x_curr.R.transpose() + phat * rot_var * phat.transpose() + tsl_var;
    pwld.push_back(x_curr.R * pv.pnt + x_curr.p);
  }
}

// Read the alidarstate.txt
void read_lidarstate(string filename, vector<ScanPose*> &bl_tem)
{
  ifstream file(filename);
  if(!file.is_open())
  {
    printf("Error: %s not found\n", filename.c_str());
    exit(0);
  }

  string lineStr, str;
  vector<double> nums;
  while(getline(file, lineStr))
  {
    nums.clear();
    stringstream ss(lineStr);
    while(getline(ss, str, ' '))
      nums.push_back(stod(str));

    IMUST xx;
    xx.t = nums[0];
    xx.p << nums[1], nums[2], nums[3];
    xx.R = Eigen::Quaterniond(nums[7], nums[4], nums[5], nums[6]).matrix();

    if(nums.size() >= 20)
    {
      xx.v << nums[8], nums[9], nums[10];
      xx.bg << nums[11], nums[12], nums[13];
      xx.ba << nums[14], nums[15], nums[16];
      xx.g << nums[17], nums[18], nums[19];
    }

    ScanPose* blp = new ScanPose(xx, nullptr);
    bl_tem.push_back(blp);

    if(nums.size() >= 26)
      for(int i=0; i<6; i++)
        blp->v6[i] = nums[i + 20];
  }
}

double get_memory()
{
  // Было: чтение /proc/self/status (Linux) — не портируется буквально на
  // Windows. Диагностическая функция (только для printf-логов памяти в
  // оригинале), не влияет на саму математику SLAM — GetProcessMemoryInfo
  // это прямой Windows-эквивалент того же VmRSS.
#ifdef _WIN32
  PROCESS_MEMORY_COUNTERS pmc;
  if(GetProcessMemoryInfo(GetCurrentProcess(), &pmc, sizeof(pmc)))
    return static_cast<double>(pmc.WorkingSetSize) / (1024.0 * 1024.0 * 1024.0);
  return -1;
#else
  ifstream infile("/proc/self/status");
  double mem = -1;
  string lineStr, str;
  while(getline(infile, lineStr))
  {
    stringstream ss(lineStr);
    bool is_find = false;
    while(ss >> str)
    {
      if(str == "VmRSS:")
      {
        is_find = true; continue;
      }

      if(is_find) mem = stod(str);
      break;
    }
    if(is_find) break;
  }
  return mem / (1048576);
#endif
}

void icp_check(pcl::PointCloud<PointType> &pl_src, pcl::PointCloud<PointType> &pl_tar, NullPublisher &pub_src, NullPublisher &pub_tar, pair<Eigen::Vector3d, Eigen::Matrix3d> &loop_transform, IMUST &xx)
{
  pcl::PointCloud<PointType> pl1, pl2;
  for(PointType ap: pl_src.points)
  {
    Eigen::Vector3d v(ap.x, ap.y, ap.z);
    v = loop_transform.second * v + loop_transform.first;
    v = xx.R * v + xx.p;
    ap.x = v[0]; ap.y = v[1]; ap.z = v[2];
    pl1.push_back(ap);
  }
  for(PointType ap: pl_tar.points)
  {
    Eigen::Vector3d v(ap.x, ap.y, ap.z);
    v = xx.R * v + xx.p;
    ap.x = v[0]; ap.y = v[1]; ap.z = v[2];
    pl2.push_back(ap);
  }
  pub_pl_func(pl1, pub_src); pub_pl_func(pl2, pub_tar);
}
