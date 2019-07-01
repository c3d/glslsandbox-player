precision mediump float;uniform float time;uniform vec2 resolution;
vec3 roty(vec3 p,float a){return p*mat3(cos(a),0,-sin(a),0,1,0,sin(a),0,cos(a));}
varying vec2 surfacePosition;
uniform vec2 mouse;
float map(in vec3 p) {
	float res=0.;vec3 c = p;
	int lim = int(resolution.x/length(gl_FragCoord.xy-mouse*resolution));
	for (int i = 0; i < 16; i++) {
		if(i > lim) break;
		p =0.9*abs(p)/dot(p,p) -.7;
		p.yz= vec2(p.y*p.y-p.z*p.z,2.*p.y*p.z);
		res += exp(-20. * abs(dot(p,c)));}
	return res/2.0;}

vec3 raymarch(vec3 ro, vec3 rd){
	float t = 4.0;
	vec3 col=vec3(0);float c=0.;
	for( int i=0; i<64; i++ ){
		t+=0.02*exp(-2.0*c);
		c = map(ro+t*rd);               
		col += vec3(c/2.0,c*c+0.1*sqrt(c),c*2.5/(1.+sqrt(c)))/4.0;}    
	return col;}

void main(){
    vec2 p = (gl_FragCoord.xy-resolution/2.0)/(resolution.y);
    vec3 ro = roty(vec3(3.),time*0.3);
    vec3 uu = normalize( cross(ro,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ro));
    vec3 rd = normalize( p.x*uu + p.y*vv -ro*0.3 );
    gl_FragColor.rgb = 0.5*log(1.0+raymarch(ro,rd));
    gl_FragColor.a = 1.0;
}
//original code from https://www.shadertoy.com/view/MtX3Ws
//simplified edit: Robert 25.11.2015
