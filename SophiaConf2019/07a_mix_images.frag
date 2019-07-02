#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D  texture0;
uniform sampler2D  texture1;
uniform vec2       resolution;
uniform float      time;

const float pi = 3.14159265359;
const float speed = 0.4;

float coef(float t, float o)
{
  return sin((t + (o * 2.)) * pi) / 2.1 + 0.5;
}

void main(void)
{
  float ts = time * speed;
  float m0 = coef(ts, 0./2.);
  float m1 = coef(ts, 1./2.);

  vec2 uv = vec2(gl_FragCoord.x / resolution.x,
		 1.0 - gl_FragCoord.y / resolution.y);

  vec4 c;
  c  = m0 * texture2D(texture0, uv).rgba;
  c += m1 * texture2D(texture1, uv).rgba;

  gl_FragColor = c;
}