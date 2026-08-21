// Замена ros::Time::now().toSec() — везде в исходнике используется ТОЛЬКО
// для профилирования в консольных логах (тайминги этапов), не влияет на
// саму математику SLAM (см. Фазу 0 плана — подтверждено построчным
// разбором всех обращений к ros::Time).
#pragma once
#include <chrono>

inline double now_sec()
{
  using namespace std::chrono;
  return duration<double>(steady_clock::now().time_since_epoch()).count();
}
