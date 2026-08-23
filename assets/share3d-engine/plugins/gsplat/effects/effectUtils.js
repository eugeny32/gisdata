import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
function createVector3(value, fallback) {
    if (!value) return fallback.clone();
    if (value instanceof __WEBPACK_EXTERNAL_MODULE_three__.Vector3) return value.clone();
    if (Array.isArray(value)) return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(value[0], value[1], value[2]);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(value.x, value.y, value.z);
}
function createColor(value, fallback) {
    if (!value) return fallback.clone();
    if (value instanceof __WEBPACK_EXTERNAL_MODULE_three__.Color) return value.clone();
    if (Array.isArray(value)) return new __WEBPACK_EXTERNAL_MODULE_three__.Color(value[0], value[1], value[2]);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Color(value.r, value.g, value.b);
}
function writeVector3Array(value, target) {
    target[0] = value.x;
    target[1] = value.y;
    target[2] = value.z;
    return target;
}
function writeColorArray(value, target) {
    target[0] = value.r;
    target[1] = value.g;
    target[2] = value.b;
    return target;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function solveWaveTime(distance, speed, acceleration) {
    if (Math.abs(acceleration) < 1e-6) return speed > 0 ? distance / speed : 1 / 0;
    const discriminant = speed * speed + 2 * acceleration * distance;
    if (discriminant < 0) return 1 / 0;
    return (-speed + Math.sqrt(discriminant)) / acceleration;
}
export { clamp, createColor, createVector3, solveWaveTime, writeColorArray, writeVector3Array };
