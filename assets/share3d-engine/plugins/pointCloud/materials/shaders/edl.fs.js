const edl_fs_rslib_entry_ = `// #extension GL_EXT_frag_depth : enable

//
// adapted from the EDL shader code from Christian Boucheny in cloud compare:
// https://github.com/cloudcompare/trunk/tree/master/plugins/qEDL/shaders/EDL
//

precision highp float;
precision mediump int;

uniform float screenWidth;
uniform float screenHeight;
uniform vec2 neighbours[NEIGHBOUR_COUNT];
uniform float edlStrength;
uniform float radius;
uniform float opacity;

uniform sampler2D uEDLColor;
uniform sampler2D uEDLDepth;

in vec2 vUv;
out vec4 pc_fragColor;

bool isBackground(float sceneDepth){
	return sceneDepth >= 1.0;
}

float response(float depth){
	vec2 uvRadius = radius / vec2(screenWidth, screenHeight);
	
	float sum = 0.0;
	
	for(int i = 0; i < NEIGHBOUR_COUNT; i++){
		vec2 uvNeighbor = vUv + uvRadius * neighbours[i];
		float neighbourDepth = texture(uEDLColor, uvNeighbor).a;
		float isValid = step(1.0, neighbourDepth);
		sum += isValid * max(0.0, depth - neighbourDepth);
	}
	
	return sum / float(NEIGHBOUR_COUNT);
}

void main(){
	float sceneDepth = texture(uEDLDepth, vUv).r;
	if(isBackground(sceneDepth)){
		discard;
	}

	vec4 cEDL = texture(uEDLColor, vUv);
	float depth = cEDL.a;
	float res = response(depth);
	float shade = exp(-res * 300.0 * edlStrength);

	pc_fragColor = vec4(cEDL.rgb * shade, opacity);
	gl_FragDepth = sceneDepth;
}
`;
export { edl_fs_rslib_entry_ as default };
