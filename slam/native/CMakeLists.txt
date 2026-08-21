# Нативная (без ROS/catkin) сборка Voxel-SLAM (Фаза 3/7 плана переноса
# slamcloude). Кросс-платформенная: WIN32-ветка ниже — историческая, для
# сборки MSYS2/mingw64 тулчейном, каким собирался вендорский
# share_slam2_offline.exe (подтверждено разбором его бинарника); не-WIN32
# ветка — настоящая нативная Linux-сборка (см. план, миграция на
# ntrip.host-сервер, Фаза 7), которую использует production.
#
# Linux сильно проще Windows-ветки: Ubuntu 26.04 несёт готовый пакет
# libgtsam-dev версии 4.2.0+dfsg — РОВНО та версия GTSAM, под которую
# писан этот код, никакой ручной сборки GTSAM из исходников (в отличие от
# MSYS2, где пакета GTSAM вообще нет) — просто find_package(GTSAM).
# Аналогично Eigen3/Boost — обычные apt-пакеты, без ODR-конфликта версий
# Eigen (тот конфликт был специфичен для MSYS2: системный Eigen 5.x там
# не совместим с GTSAM 4.2.0, писан под Eigen 3.x — Ubuntu же несёт Eigen
# 3.4.0, единую версию и для системы, и для того, с чем собран
# libgtsam-dev).
#
# PCL/ROS/catkin/yaml-cpp — НЕ нужны вообще ни на одной платформе (см.
# compat/pcl_compat.hpp, compat/param_reader.hpp — оба уже самодостаточные
# замены, PCL't KdTreeFLANN сознательно brute-force, не забытая
# оптимизация, см. докстринг pcl_compat.hpp).

cmake_minimum_required(VERSION 3.15)
project(voxelslam_native CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

add_executable(voxelslam_native
  src/voxelslam.cpp
  src/BTC.cpp
)
target_include_directories(voxelslam_native PRIVATE compat src)

if(WIN32)
  # --- Историческая ветка: MSYS2/mingw64, см. докстринг файла. ---

  # Путь к установке GTSAM, собранной вручную (см. план, Фаза 3) — задаётся
  # при конфигурации: cmake -DGTSAM_INSTALL_DIR=D:/build_deps/install ..
  if(NOT DEFINED GTSAM_INSTALL_DIR)
    set(GTSAM_INSTALL_DIR "D:/build_deps/install")
  endif()

  find_package(Eigen3 REQUIRED)
  # GTSAM собрана статически (BUILD_SHARED_LIBS=OFF, см. план -- обходит
  # ошибку "definition is marked dllimport" на инлайн-методах GTSAM под
  # MinGW) -- статическая библиотека НЕ утаскивает свои собственные
  # зависимости (Boost) автоматически, как утащила бы .dll, поэтому линкуем
  # нужные компоненты Boost явно сами.
  find_package(Boost REQUIRED COMPONENTS timer chrono serialization)

  if(NOT DEFINED MINGW_PREFIX)
    set(MINGW_PREFIX "D:/msys64/mingw64")
  endif()

  target_include_directories(voxelslam_native BEFORE PRIVATE
    # GTSAM'овский Eigen — ПЕРЕД системным MSYS2 Eigen3 (см. докстринг выше).
    ${GTSAM_INSTALL_DIR}/include/gtsam/3rdparty/Eigen
  )
  target_include_directories(voxelslam_native PRIVATE
    ${GTSAM_INSTALL_DIR}/include
    ${MINGW_PREFIX}/include
  )

  target_link_directories(voxelslam_native PRIVATE ${GTSAM_INSTALL_DIR}/lib)

  target_link_libraries(voxelslam_native PRIVATE
    gtsam
    Boost::timer
    Boost::chrono
    Boost::serialization
    psapi   # GetProcessMemoryInfo, см. voxelslam.hpp get_memory()
  )

  target_compile_definitions(voxelslam_native PRIVATE
    _WIN32_WINNT=0x0A00
    NOMINMAX          # windows.h иначе определяет min/max макросами, ломает std::min/max в коде
    WIN32_LEAN_AND_MEAN
  )

  if(MINGW)
    # Полностью статическая линковка (-static, покрывает и libwinpthread-1.dll
    # для std::thread/std::mutex) -- итог: один самостоятельный .exe без
    # рантайм-DLL-зависимостей от MSYS2, который можно вызывать из PHP-
    # оркестрации точно так же, как pdal.exe/untwine.exe, без необходимости
    # держать MSYS2/mingw64/bin на PATH. GTSAM тоже статическая
    # (libgtsam.a) -- никаких .dll-зависимостей не остаётся вообще.
    target_link_options(voxelslam_native PRIVATE -static -static-libgcc -static-libstdc++)
    target_compile_options(voxelslam_native PRIVATE -pthread)
    target_link_options(voxelslam_native PRIVATE -pthread)
  endif()

else()
  # --- Нативная Linux-сборка (production, см. докстринг файла). ---
  find_package(Eigen3 REQUIRED)
  find_package(GTSAM REQUIRED)
  find_package(Boost REQUIRED COMPONENTS timer chrono serialization)
  find_package(Threads REQUIRED)

  target_link_libraries(voxelslam_native PRIVATE
    gtsam
    Boost::timer
    Boost::chrono
    Boost::serialization
    Threads::Threads
  )

  target_compile_options(voxelslam_native PRIVATE -O3)
endif()
