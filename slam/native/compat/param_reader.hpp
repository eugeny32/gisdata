// Замена ros::NodeHandle::param<T>(key, var, default) для нативной сборки
// без ROS (Фаза 3 плана). В оригинале ~50 вызовов вида
// `n.param<double>("Odometry/cov_gyr", cov_gyr, 0.1)` — это ВСЕГДА
// typed-чтение значения по вложенному ключу из конфига с дефолтом, никакой
// "живой" семантики параметр-сервера не используется (проверено
// построчным чтением всех вызовов в voxelslam.cpp/BTC.cpp).
//
// ПЕРВАЯ версия читала конфиг через yaml-cpp — ОТКАЧЕНО (2026-07-31): пакет
// mingw-w64-x86_64-yaml-cpp 0.9.0 на этом сервере даёт детерминированно
// воспроизводимый баг при ПОВТОРНОМ обходе одного и того же YAML::Node
// (подтверждено изолированным тестом вне ParamReader/этого проекта —
// YAML::Node::operator[] отрабатывает верно только для САМОГО ПЕРВОГО
// обращения к дереву за весь процесс, каждое следующее — независимо от
// экземпляра/ключа/наличия std::move — тихо возвращает пустой узел). Не
// компиляторный UB (репродуцируется и на -O0), похоже на реальную регрессию
// в этой конкретной сборке пакета. Поскольку нашему конфигу не нужна
// реальная YAML-семантика (якоря, множественные документы, смешение
// block/flow) — вместо отладки/пересборки yaml-cpp из исходников просто
// убрали зависимость целиком: плоский текстовый формат "key=value" по
// строкам, где key уже использует тот же "/"-путь, что и вызовы
// n.param<T>("Section/key", ...) в коде — конвертация Node->computeSlam.mjs
// делается тривиально (см. slam/steps/computeSlam.mjs).
//
// Формат значений по типам:
//   string: остаток строки после первого "=" как есть.
//   int/double: std::stoi/std::stod.
//   vector<double>: значения через запятую ("0,0,0").
//
// Класс называется ParamReader и имеет метод .param<T>(...) с ТЕМ ЖЕ
// сигнатурой, что ros::NodeHandle — при портировании остальных n.param<T>
// вызовов в voxelslam.cpp/BTC.cpp менять не пришлось вообще.

#pragma once
#include <string>
#include <vector>
#include <unordered_map>
#include <fstream>
#include <sstream>
#include <type_traits>

class ParamReader {
 public:
  // true, если файл успешно открылся (main() должен завершиться с ошибкой,
  // если нет — тот же fail-fast, что был у YAML::LoadFile до отката).
  bool ok = false;

  explicit ParamReader(const std::string &configPath) {
    std::ifstream f(configPath);
    if (!f.is_open()) return;
    ok = true;
    std::string line;
    while (std::getline(f, line)) {
      while (!line.empty() && (line.back() == '\r' || line.back() == '\n')) line.pop_back();
      size_t start = 0;
      while (start < line.size() && (line[start] == ' ' || line[start] == '\t')) start++;
      if (start >= line.size() || line[start] == '#') continue;
      size_t eq = line.find('=', start);
      if (eq == std::string::npos) continue;
      values_[line.substr(start, eq - start)] = line.substr(eq + 1);
    }
  }

  template <typename T>
  void param(const std::string &key, T &var, const T &def) const {
    auto it = values_.find(key);
    if (it == values_.end()) { var = def; return; }
    const std::string &v = it->second;
    try {
      if constexpr (std::is_same_v<T, std::string>) {
        var = v;
      } else if constexpr (std::is_same_v<T, std::vector<double>>) {
        std::vector<double> out;
        std::stringstream ss(v);
        std::string tok;
        while (std::getline(ss, tok, ',')) out.push_back(std::stod(tok));
        var = out;
      } else if constexpr (std::is_same_v<T, int>) {
        var = std::stoi(v);
      } else if constexpr (std::is_same_v<T, double>) {
        var = std::stod(v);
      } else {
        var = def;
      }
    } catch (...) {
      // Значение есть, но не того формата — как и n.param в ROS, тихо
      // откатываемся на дефолт, а не падаем.
      var = def;
    }
  }

 private:
  std::unordered_map<std::string, std::string> values_;
};
