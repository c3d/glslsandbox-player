#ifdef GL_ES
precision mediump float;
#endif
uniform float time;
uniform vec2 resolution;
// Leadlight by @hintz 2013-05-02
void main()
{
	vec2 position = (gl_FragCoord.xy - 0.5*resolution) / resolution.xx ;
	float r = length(position);
	float a = atan(position.y, position.x);
	float t = time + 100.0/(r+1.0);	
	float light = 15.0*abs(0.05*(sin(t)+sin(time+a*8.0)));
	vec3 color = vec3(-sin(r*5.0-a-time+sin(r+t)), sin(r*3.0+a-time+sin(r+t)), cos(r+a*2.0+a+time)-sin(r+t));
	gl_FragColor = vec4((normalize(color)+0.9) * light , 1.0);
}
