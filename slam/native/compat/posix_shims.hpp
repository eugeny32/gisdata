// Мелкие Linux/ROS-специфичные вещи, не имеющие прямого аналога на
// Windows/MinGW (Фаза 3 плана). Каждая — отдельный маленький кусок, не
// общая тема, собраны в одном файле просто для удобства подключения.
#pragma once
#include <chrono>
#include <thread>
#include <cstdio>

#ifndef DEG2RAD
#define DEG2RAD(deg) ((deg) * 0.017453292519943295)  // deg * M_PI / 180.0
#endif

// Оригинал звал POSIX sleep(unsigned int seconds) с ДРОБНЫМИ аргументами
// (sleep(0.05) и т.п.) -- на настоящем POSIX это молча обрезается до
// sleep(0) неявным приведением к unsigned int (сам оригинал имел этот
// изъян). Здесь даём дробным секундам реально сработать через
// this_thread::sleep_for -- эти вызовы только в фоновых
// polling/idle-циклах (не влияют на математику SLAM), так что более
// точный сон не меняет результат, только (чуть) снижает нагрузку на CPU
// в ожидании.
inline void sleep(double seconds)
{
  std::this_thread::sleep_for(std::chrono::duration<double>(seconds));
}

// malloc_trim(3) -- glibc-специфичная функция возврата свободной памяти
// heap обратно ОС, нет аналога в MinGW/MSVCRT. Диагностика/оптимизация
// памяти (см. get_memory() в voxelslam.hpp, план про OOM на длинных
// записях), не влияет на корректность -- no-op на Windows. На нативной
// Linux-сборке НЕ определяем свою версию вообще -- <malloc.h> (уже
// подключён в voxelslam.hpp) даёт настоящий glibc malloc_trim(size_t),
// и он реально возвращает память ОС, а не просто заглушка.
#ifdef _WIN32
inline void malloc_trim(int) {}
#endif
