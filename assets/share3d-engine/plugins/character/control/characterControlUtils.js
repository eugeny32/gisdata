import * as __WEBPACK_EXTERNAL_MODULE_three__ from "three";
const CHARACTER_DIRECTION_EPSILON = 1e-6;
const MOVE_FORWARD_CODES = [
    'KeyW',
    'ArrowUp'
];
const MOVE_BACKWARD_CODES = [
    'KeyS',
    'ArrowDown'
];
const MOVE_LEFT_CODES = [
    'KeyA',
    'ArrowLeft'
];
const MOVE_RIGHT_CODES = [
    'KeyD',
    'ArrowRight'
];
const RUN_CODES = [
    'ShiftLeft',
    'ShiftRight'
];
const JUMP_CODES = [
    'Space'
];
function createAimDirection(yaw, pitch) {
    const planar = Math.cos(pitch);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.cos(yaw) * planar, Math.sin(yaw) * planar, Math.sin(pitch)).normalize();
}
function createPlanarForward(yaw) {
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(Math.cos(yaw), Math.sin(yaw), 0).normalize();
}
function createPlanarRight(yaw) {
    const forward = createPlanarForward(yaw);
    return new __WEBPACK_EXTERNAL_MODULE_three__.Vector3(forward.y, -forward.x, 0).normalize();
}
function resolvePlanarYawFromDirection(direction, fallbackYaw) {
    const planarDirection = direction.clone();
    planarDirection.z = 0;
    if (planarDirection.lengthSq() <= CHARACTER_DIRECTION_EPSILON) return fallbackYaw;
    return Math.atan2(planarDirection.y, planarDirection.x);
}
function isCharacterInputKey(code) {
    return MOVE_FORWARD_CODES.includes(code) || MOVE_BACKWARD_CODES.includes(code) || MOVE_LEFT_CODES.includes(code) || MOVE_RIGHT_CODES.includes(code) || RUN_CODES.includes(code) || JUMP_CODES.includes(code);
}
export { JUMP_CODES, MOVE_BACKWARD_CODES, MOVE_FORWARD_CODES, MOVE_LEFT_CODES, MOVE_RIGHT_CODES, RUN_CODES, createAimDirection, createPlanarForward, createPlanarRight, isCharacterInputKey, resolvePlanarYawFromDirection };
