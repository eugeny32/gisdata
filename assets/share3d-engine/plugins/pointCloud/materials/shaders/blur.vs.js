const blur_vs_rslib_entry_ = `
varying vec2 vUv;

void main() {
	vUv = uv;

	gl_Position =   projectionMatrix * modelViewMatrix * vec4(position,1.0);
}`;
export { blur_vs_rslib_entry_ as default };
