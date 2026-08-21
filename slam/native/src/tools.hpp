#ifndef TOOLS_HPP
#define TOOLS_HPP

#include <Eigen/Core>
#include <Eigen/Geometry>
#include <unordered_map>
#include "../compat/pcl_compat.hpp"

#define HASH_P 116101
#define MAX_N 10000000000
#define SKEW_SYM_MATRX(v) 0.0,-v[2],v[1],v[2],0.0,-v[0],-v[1],v[0],0.0
#define PLM(a) vector<Eigen::Matrix<double, a, a>, Eigen::aligned_allocator<Eigen::Matrix<double, a, a>>>
#define PLV(a) vector<Eigen::Matrix<double, a, 1>, Eigen::aligned_allocator<Eigen::Matrix<double, a, 1>>>

#define G_m_s2 9.8
#define DIM 15
#define NMATCH 5

typedef pcl::PointXYZINormal PointType;
using namespace std;

// ---- tightly-coupled RTK (slamcloude GPSFactor2) ----
#include <fstream>
#include <algorithm>
static std::vector<double> g_rtk_t;
static std::vector<Eigen::Vector3d> g_rtk_utm;
static Eigen::Matrix3d g_u2s_R = Eigen::Matrix3d::Identity();
static Eigen::Vector3d g_u2s_t = Eigen::Vector3d::Zero();
static bool g_rtk_datum_ready = false;
static double g_gps_wh = 0.0, g_gps_wv = 0.0;  // GPS info weights (0 = off)
inline void rtk_load(const std::string &path) {
  g_rtk_t.clear(); g_rtk_utm.clear();
  std::ifstream f(path.c_str());
  double tt, x, y, z;
  while(f >> tt >> x >> y >> z) { g_rtk_t.push_back(tt); g_rtk_utm.push_back(Eigen::Vector3d(x, y, z)); }
  printf("[rtk] loaded %zu epochs from %s\n", g_rtk_t.size(), path.c_str());
}
inline bool rtk_utm_at(double t, Eigen::Vector3d &out) {
  int n = (int)g_rtk_t.size();
  if(n < 2 || t < g_rtk_t[0] || t > g_rtk_t[n-1]) return false;
  int lo = (int)(std::lower_bound(g_rtk_t.begin(), g_rtk_t.end(), t) - g_rtk_t.begin());
  if(lo <= 0) lo = 1;
  if(lo >= n) lo = n-1;
  double t0 = g_rtk_t[lo-1], t1 = g_rtk_t[lo];
  if(t1 - t0 > 1.0) return false;
  double a = (t - t0) / (t1 - t0);
  out = (1-a)*g_rtk_utm[lo-1] + a*g_rtk_utm[lo];
  return true;
}
inline bool rtk_at_slam(double t, Eigen::Vector3d &out) {
  if(!g_rtk_datum_ready) return false;
  Eigen::Vector3d u;
  if(!rtk_utm_at(t, u)) return false;
  out = g_u2s_R * u + g_u2s_t;
  return true;
}

#include <Eigen/SVD>
static std::vector<double> g_sess_t;
static std::vector<Eigen::Vector3d> g_sess_p;
inline void rtk_datum_reset() { g_sess_t.clear(); g_sess_p.clear(); g_rtk_datum_ready = false; }
inline void rtk_datum_accumulate(double t, const Eigen::Vector3d &p) {
  if(g_gps_wh <= 0.0) return;
  g_sess_t.push_back(t); g_sess_p.push_back(p);
  if(g_rtk_datum_ready) return;
  if((int)g_sess_t.size() < 150) return;
  std::vector<Eigen::Vector3d> S, U;
  for(size_t i=0; i<g_sess_t.size(); i++) { Eigen::Vector3d u; if(rtk_utm_at(g_sess_t[i], u)) { S.push_back(g_sess_p[i]); U.push_back(u); } }
  if((int)S.size() < 40) return;
  Eigen::Vector3d smin=S[0], smax=S[0];
  for(size_t i=0;i<S.size();i++){ smin=smin.cwiseMin(S[i]); smax=smax.cwiseMax(S[i]); }
  if((smax-smin).head(2).norm() < 10.0) return;
  Eigen::Vector2d sc=Eigen::Vector2d::Zero(), uc=Eigen::Vector2d::Zero();
  for(size_t i=0;i<S.size();i++){ sc+=S[i].head(2); uc+=U[i].head(2); }
  sc/=(double)S.size(); uc/=(double)U.size();
  Eigen::Matrix2d H=Eigen::Matrix2d::Zero();
  for(size_t i=0;i<S.size();i++) H += (S[i].head(2)-sc)*(U[i].head(2)-uc).transpose();
  Eigen::JacobiSVD<Eigen::Matrix2d> svd(H, Eigen::ComputeFullU|Eigen::ComputeFullV);
  Eigen::Matrix2d R2 = svd.matrixV()*svd.matrixU().transpose();
  if(R2.determinant()<0){ Eigen::Matrix2d V=svd.matrixV(); V.col(1)*=-1; R2=V*svd.matrixU().transpose(); }
  Eigen::Vector2d tt2 = uc - R2*sc;
  double dz=0; for(size_t i=0;i<S.size();i++) dz += U[i].z()-S[i].z(); dz/=(double)S.size();
  Eigen::Matrix3d Rs2u=Eigen::Matrix3d::Identity(); Rs2u.block(0,0,2,2)=R2;
  Eigen::Vector3d ts2u(tt2.x(), tt2.y(), dz);
  g_u2s_R = Rs2u.transpose();
  g_u2s_t = -Rs2u.transpose()*ts2u;
  g_rtk_datum_ready = true;
  printf("[rtk] datum ready: %zu pairs, %.1fm travel\n", S.size(), (smax-smin).head(2).norm());
}


Eigen::Matrix3d I33(Eigen::Matrix3d::Identity());

class VOXEL_LOC
{
public:
  int64_t x, y, z;

  VOXEL_LOC(int64_t vx=0, int64_t vy=0, int64_t vz=0): x(vx), y(vy), z(vz){}

  bool operator == (const VOXEL_LOC &other) const
  {
    return (x==other.x && y==other.y && z==other.z);
  }
};

namespace std
{
  template<>
  struct hash<VOXEL_LOC>
  {
    size_t operator() (const VOXEL_LOC &s) const
    {
      using std::size_t; using std::hash;
      // return ((hash<int64_t>()(s.x) ^ (hash<int64_t>()(s.y) << 1)) >> 1) ^ (hash<int64_t>()(s.z) << 1);
      return (((hash<int64_t>()(s.z)*HASH_P)%MAX_N + hash<int64_t>()(s.y))*HASH_P)%MAX_N + hash<int64_t>()(s.x);
    }
  };
}

Eigen::Matrix3d Exp(const Eigen::Vector3d &ang)
{
  double ang_norm = ang.norm();
  // if (ang_norm > 0.00001)
  if (ang_norm >= 1e-11)
  {
    Eigen::Vector3d r_axis = ang / ang_norm;
    Eigen::Matrix3d K;
    K << SKEW_SYM_MATRX(r_axis);
    /// Roderigous Tranformation
    return I33 + std::sin(ang_norm) * K + (1.0 - std::cos(ang_norm)) * K * K;
  }
  
  return I33;
  
}

Eigen::Matrix3d Exp(const Eigen::Vector3d &ang_vel, const double &dt)
{
  double ang_vel_norm = ang_vel.norm();
  if (ang_vel_norm > 1e-7)
  {
    Eigen::Vector3d r_axis = ang_vel / ang_vel_norm;
    Eigen::Matrix3d K;

    K << SKEW_SYM_MATRX(r_axis);
    double r_ang = ang_vel_norm * dt;

    /// Roderigous Tranformation
    return I33 + std::sin(r_ang) * K + (1.0 - std::cos(r_ang)) * K * K;
  }
  
  return I33;
}

Eigen::Vector3d Log(const Eigen::Matrix3d &R)
{
  double theta = (R.trace() > 3.0 - 1e-6) ? 0.0 : std::acos(0.5 * (R.trace() - 1));
  Eigen::Vector3d K(R(2,1) - R(1,2), R(0,2) - R(2,0), R(1,0) - R(0,1));
  return (std::abs(theta) < 0.001) ? (0.5 * K) : (0.5 * theta / std::sin(theta) * K);
}

Eigen::Matrix3d hat(const Eigen::Vector3d &v)
{
  Eigen::Matrix3d Omega;
  Omega <<  0, -v(2),  v(1)
      ,  v(2),     0, -v(0)
      , -v(1),  v(0),     0;
  return Omega;
}

Eigen::Matrix3d jr(Eigen::Vector3d vec)
{
  double ang = vec.norm();

  if(ang < 1e-9)
  {
    return I33;
  }
  else
  {
    vec /= ang;
    double ra = sin(ang)/ang;
    return ra*I33 + (1-ra)*vec*vec.transpose() - (1-cos(ang))/ang * hat(vec);
  }
}

Eigen::Matrix3d jr_inv(const Eigen::Matrix3d &rotR)
{
  Eigen::AngleAxisd rot_vec(rotR);
  Eigen::Vector3d axi = rot_vec.axis();
  double ang = rot_vec.angle();

  if(ang < 1e-9)
  {
    return I33;
  }
  else
  {
    double ctt = ang / 2 / tan(ang/2);
    return ctt*I33 + (1-ctt)*axi*axi.transpose() + ang/2 * hat(axi);
  }
}

struct IMUST
{
  EIGEN_MAKE_ALIGNED_OPERATOR_NEW
  double t;
  Eigen::Matrix3d R;
  Eigen::Vector3d p;
  Eigen::Vector3d v;
  Eigen::Vector3d bg;
  Eigen::Vector3d ba;
  Eigen::Vector3d g;
  Eigen::Matrix<double, DIM, DIM> cov;
  
  IMUST()
  {
    setZero();
  }

  IMUST(double _t, const Eigen::Matrix3d &_R, const Eigen::Vector3d &_p, const Eigen::Vector3d &_v, const Eigen::Vector3d &_bg, const Eigen::Vector3d &_ba, const Eigen::Vector3d &_g = Eigen::Vector3d(0, 0, -G_m_s2)) : t(_t), R(_R), p(_p), v(_v), bg(_bg), ba(_ba), g(_g) {}

  IMUST &operator+=(const Eigen::Matrix<double, DIM, 1> &ist)
  {
    this->R = this->R * Exp(ist.block<3, 1>(0, 0));
    this->p += ist.block<3, 1>(3, 0);
    this->v += ist.block<3, 1>(6, 0);
    this->bg += ist.block<3, 1>(9, 0);
    this->ba += ist.block<3, 1>(12, 0);
    return *this;
  }

  Eigen::Matrix<double, DIM, 1> operator-(const IMUST &b) 
  {
    Eigen::Matrix<double, DIM, 1> a;
    a.block<3, 1>(0, 0) = Log(b.R.transpose() * this->R);
    a.block<3, 1>(3, 0) = this->p - b.p;
    a.block<3, 1>(6, 0) = this->v - b.v;
    a.block<3, 1>(9, 0) = this->bg - b.bg;
    a.block<3, 1>(12, 0) = this->ba - b.ba;
    return a;
  }

  IMUST &operator=(const IMUST &b)
  {
    this->R = b.R;
    this->p = b.p;
    this->v = b.v;
    this->bg = b.bg;
    this->ba = b.ba;
    this->g = b.g;
    this->t = b.t;
    this->cov = b.cov;
    return *this;
  }

  void setZero()
  {
    t = 0; R.setIdentity();
    p.setZero(); v.setZero();
    bg.setZero(); ba.setZero();
    // g << 0, 0, -G_m_s2;
    cov.setIdentity(); 
    cov *= 0.0001;
    cov.block<6, 6>(9, 9) = Eigen::Matrix<double, 6, 6>::Identity() * 0.00001;
  }

};

void down_sampling_voxel(pcl::PointCloud<PointType> &pl_feat, double voxel_size)
{
  if(voxel_size < 0.001) return;

  unordered_map<VOXEL_LOC, PointType> feat_map;
  float loc_xyz[3];
  for(PointType &p_c : pl_feat.points)
  {
    // Было p_c.data[j] (реальный PCL хранит x/y/z в объединении с
    // data[4]-массивом через PCL_ADD_POINT4D) -- наша прослойка (см.
    // compat/pcl_compat.hpp) хранит их как обычные поля, без массива.
    loc_xyz[0] = p_c.x / voxel_size;
    loc_xyz[1] = p_c.y / voxel_size;
    loc_xyz[2] = p_c.z / voxel_size;
    for(int j=0; j<3; j++)
    {
      if(loc_xyz[j] < 0)
        loc_xyz[j] -= 1.0;
    }

    VOXEL_LOC position((int64_t)loc_xyz[0], (int64_t)loc_xyz[1], (int64_t)loc_xyz[2]);
    auto iter = feat_map.find(position);
    if(iter == feat_map.end())
    {
      PointType pp = p_c;
      pp.curvature = 1;
      feat_map[position] = pp;
    }
    else
    {
      PointType &pp = iter->second;
      pp.x = (pp.x * pp.curvature + p_c.x) / (pp.curvature + 1);
      pp.y = (pp.y * pp.curvature + p_c.y) / (pp.curvature + 1);
      pp.z = (pp.z * pp.curvature + p_c.z) / (pp.curvature + 1);
      pp.curvature += 1;
    }
  }

  pl_feat.clear();
  for(auto iter=feat_map.begin(); iter!=feat_map.end(); ++iter)
    pl_feat.push_back(iter->second);
  
}

void down_sampling_close(pcl::PointCloud<PointType> &pl_feat, double voxel_size)
{
  if(voxel_size < 0.001) return;

  unordered_map<VOXEL_LOC, pcl::PointCloud<PointType>::Ptr> feat_map;
  float loc_xyz[3];
  for(PointType &p_c: pl_feat.points)
  {
    // Было p_c.data[j] (реальный PCL хранит x/y/z в объединении с
    // data[4]-массивом через PCL_ADD_POINT4D) -- наша прослойка (см.
    // compat/pcl_compat.hpp) хранит их как обычные поля, без массива.
    loc_xyz[0] = p_c.x / voxel_size;
    loc_xyz[1] = p_c.y / voxel_size;
    loc_xyz[2] = p_c.z / voxel_size;
    for(int j=0; j<3; j++)
    {
      if(loc_xyz[j] < 0)
        loc_xyz[j] -= 1.0;
    }

    VOXEL_LOC position((int64_t)loc_xyz[0], (int64_t)loc_xyz[1], (int64_t)loc_xyz[2]);
    auto iter = feat_map.find(position);
    if(iter == feat_map.end())
    {
      pcl::PointCloud<PointType>::Ptr pl_ptr(new pcl::PointCloud<PointType>);
      pl_ptr->push_back(p_c);
      feat_map[position] = pl_ptr;
    }
    else
    {
      iter->second->push_back(p_c);
    }
  }

  pl_feat.clear();
  for(auto iter=feat_map.begin(); iter!=feat_map.end(); ++iter)
  {
    pcl::PointCloud<PointType>::Ptr pl_ptr = iter->second;

    PointType pb = pl_ptr->points[0];
    int plsize = pl_ptr->size();
    for(int i=1; i<plsize; i++)
    {
      PointType &pp = pl_ptr->points[i];
      pb.x += pp.x; pb.y += pp.y; pb.z += pp.z;
    }
    pb.x /= plsize; pb.y /=plsize; pb.z /= plsize;

    double ndis = 100;
    int mnum = 0;
    for(int i=0; i<plsize; i++)
    {
      PointType &pp = pl_ptr->points[i];
      double xx = pb.x - pp.x;
      double yy = pb.y - pp.y;
      double zz = pb.z - pp.z;
      double dis = xx*xx + yy*yy + zz*zz;
      if(dis < ndis)
      {
        mnum = i;
        ndis = dis;
      }
    }

    pl_feat.push_back(pl_ptr->points[mnum]);
  }

}

class PointCluster
{
public:
  EIGEN_MAKE_ALIGNED_OPERATOR_NEW
  Eigen::Matrix3d P;
  Eigen::Vector3d v;
  int N;

  PointCluster()
  {
    P.setZero();
    v.setZero();
    N = 0;
  }

  void clear()
  {
    P.setZero();
    v.setZero();
    N = 0;
  }

  void push(const Eigen::Vector3d &vec)
  {
    N++;
    P += vec * vec.transpose();
    v += vec;
  }

  Eigen::Matrix3d cov()
  {
    Eigen::Vector3d center = v / N;
    return P/N - center*center.transpose();
  }

  PointCluster & operator+=(const PointCluster &sigv)
  {
    this->P += sigv.P;
    this->v += sigv.v;
    this->N += sigv.N;

    return *this;
  }

  PointCluster & operator-=(const PointCluster &sigv)
  {
    this->P -= sigv.P;
    this->v -= sigv.v;
    this->N -= sigv.N;

    return *this;
  }

  void transform(const PointCluster &sigv, const IMUST &stat)
  {
    N = sigv.N;
    v = stat.R*sigv.v + N*stat.p;
    Eigen::Matrix3d rp = stat.R * sigv.v * stat.p.transpose();
    P = stat.R*sigv.P*stat.R.transpose() + rp + rp.transpose() + N*stat.p*stat.p.transpose();
  }

};

inline void gps_add_hess(std::vector<IMUST> &x_stats, int win_size, Eigen::MatrixXd &Hess, Eigen::VectorXd &JacT, double &residual) {
  if(g_gps_wh <= 0.0) return;
  Eigen::Vector3d rp; int _ap=0; double _mr=0;
  for(int gi=0; gi<win_size; gi++)
    if(rtk_at_slam(x_stats[gi].t, rp)) {
      Eigen::Vector3d r = x_stats[gi].p - rp;
      Hess(gi*DIM+3, gi*DIM+3) += g_gps_wh; Hess(gi*DIM+4, gi*DIM+4) += g_gps_wh; Hess(gi*DIM+5, gi*DIM+5) += g_gps_wv;
      JacT(gi*DIM+3) += g_gps_wh*r.x(); JacT(gi*DIM+4) += g_gps_wh*r.y(); JacT(gi*DIM+5) += g_gps_wv*r.z();
      residual += 0.5*(g_gps_wh*(r.x()*r.x()+r.y()*r.y()) + g_gps_wv*r.z()*r.z());
      _ap++; if(r.norm()>_mr) _mr=r.norm();
    }
  { static int _c=0; _c++; if(g_rtk_datum_ready && _c%2500==0){ printf("[gps-hess] wh=%.0f win=%d applied=%d maxres=%.3fm datum=%d\n", g_gps_wh, win_size, _ap, _mr, (int)g_rtk_datum_ready); _c++; } }
}
inline double gps_add_resi(std::vector<IMUST> &x_stats, int win_size) {
  if(g_gps_wh <= 0.0) return 0.0;
  double res = 0; Eigen::Vector3d rp;
  for(int gi=0; gi<win_size; gi++)
    if(rtk_at_slam(x_stats[gi].t, rp)) {
      Eigen::Vector3d r = x_stats[gi].p - rp;
      res += 0.5*(g_gps_wh*(r.x()*r.x()+r.y()*r.y()) + g_gps_wv*r.z()*r.z());
    }
  return res;
}
#endif
