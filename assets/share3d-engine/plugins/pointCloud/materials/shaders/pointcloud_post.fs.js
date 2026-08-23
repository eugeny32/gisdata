const pointcloud_post_fs_rslib_entry_ = `#extension GL_EXT_frag_depth : enable

precision mediump float;
precision mediump int;

uniform float screenWidth;
uniform float screenHeight;
uniform float opacity;

uniform float uNear;
uniform float uFDar;
uniform mat4 uProj;
uniform sampler2D uColor;
uniform sampler2D uDepth;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(uColor, vUv);
  float depth = color.a;
	depth = (depth == 1.0) ? 0.0 : depth;
  gl_FragColor = vec4(color.rgb, opacity);

  {
    float dl = pow(2.0, depth);
    vec4 dp = uProj * vec4(.0, .0, -dl, 1.0);
    float pz = dp.z / dp.w;
    float fragDepth = (pz + 1.0) / 2.0;
    gl_FragDepthEXT = fragDepth;
  }
  // gl_FragColor = vec4(0.0, 0.7, 0.0, 1.0);
  if(depth == 0.0){
		discard;
	}
}`;
export { pointcloud_post_fs_rslib_entry_ as default };
