const pointcloud_dynamic_fs_rslib_entry_ = `
precision highp float;
precision highp int;

varying vec3	vColor;

void main() {

	vec3 color = vColor;

	gl_FragColor = vec4(color, 1.0);
}


`;
export { pointcloud_dynamic_fs_rslib_entry_ as default };
