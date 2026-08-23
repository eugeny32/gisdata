const SHOWCASE_SHADER_COMMON_GLSL = `
float showcaseSaturate(float value) {
  return clamp(value, 0.0, 1.0);
}

float showcaseHash13(vec3 value) {
  return fract(sin(dot(value, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

float showcaseHash12(vec2 value) {
  return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 showcaseRotate2d(vec2 value, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(c * value.x - s * value.y, s * value.x + c * value.y);
}

float showcaseRing(float radius, float front, float width) {
  return 1.0 - showcaseSaturate(abs(radius - front) / max(width, 0.0001));
}
`;
export { SHOWCASE_SHADER_COMMON_GLSL };
