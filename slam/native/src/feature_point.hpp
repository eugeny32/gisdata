// Порт feature_point.hpp — только Livox-путь (S20 = Livox MID-360 всегда).
// Оригинал поддерживал ещё Velodyne/Ouster/Hesai/RoboSense/TartanAir через
// sensor_msgs::PointCloud2 + PCL point-registration макросы — та часть
// сознательно не портируется (см. план, раздел про разбор вендорского
// share_slam2_offline.exe: многолидарность — не специфика ядра SLAM).
#ifndef FEATURE_POINT_HPP
#define FEATURE_POINT_HPP

#include "../compat/pcl_compat.hpp"
#include "../compat/msg_types.hpp"

typedef pcl::PointXYZINormal PointType;
using namespace std;

enum LID_TYPE{LIVOX};

class Features
{
public:
  int lidar_type = LIVOX, point_filter_num = 1;
  double blind = 1;

  double process(const CustomMsg::ConstPtr &msg, pcl::PointCloud<PointType> &pl_full)
  {
    livox_handler(msg, pl_full);
    return msg->header.stamp.toSec();
  }

  void livox_handler(const CustomMsg::ConstPtr &msg, pcl::PointCloud<PointType> &pl_full)
  {
    int plsize = msg->point_num;
    pl_full.reserve(plsize);

    for(int i=0; i<plsize; i++)
    {
      PointType ap;
      ap.x = msg->points[i].x;
      ap.y = msg->points[i].y;
      ap.z = msg->points[i].z;
      ap.intensity = msg->points[i].reflectivity;
      ap.curvature = msg->points[i].offset_time / float(1000000000); // s

      if(i % point_filter_num == 0)
      {
        if(ap.x*ap.x + ap.y*ap.y + ap.z*ap.z > blind)
        {
          pl_full.push_back(ap);
        }
      }
    }
  }
};

#endif
