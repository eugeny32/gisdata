// Плоский текстовый конфиг для voxelslam_native.exe (см.
// slam/native/compat/param_reader.hpp) — "key=value" по строкам, "/" внутри
// key для вложенных секций (совпадает с путями, которые уже используют все
// n.param<T>("Section/key", ...) вызовы в slam/native/src). НЕ YAML — см.
// докстринг param_reader.hpp/computeSlam.mjs про сломанный yaml-cpp 0.9.0
// на сервере.

/**
 * @param {string} path
 * @param {object} obj вложенность максимум на 1 уровень (top-level ключи
 *   и/или top-level объекты вида {Section: {key: value}}); значения —
 *   string/number/массив чисел (сериализуется через запятую).
 */
export function writeNativeConfigString(obj) {
  const lines = [];
  const emit = (key, value) => {
    if (Array.isArray(value)) lines.push(`${key}=${value.join(",")}`);
    else lines.push(`${key}=${value}`);
  };
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      for (const [subKey, subValue] of Object.entries(value)) emit(`${key}/${subKey}`, subValue);
    } else {
      emit(key, value);
    }
  }
  return lines.join("\n") + "\n";
}
