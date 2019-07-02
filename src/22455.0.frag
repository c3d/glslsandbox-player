// "Wet stone" by Alexander Alekseev aka TDM - 2014
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
// Mahmud Yuldashev modification mahmud9935@gmail.com
// Gold Nugget modifications by I.G.P. - 12/2014

#ifdef GL_ES
  precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;




const int AO_SAMPLES = 4;
const vec2 AO_PARAM = vec2(1.2, 3.8);
const vec2 CORNER_PARAM = vec2(0.2, 20.0);
const float INV_AO_SAMPLES = 1.0 / float(AO_SAMPLES);
const float TRESHOLD   = 0.1;
const float EPSILON   = 1e-4;
const float LIGHT_INTENSITY = 0.2;
const vec3 RED    = vec3(1.0, 0.70, 0.3) * LIGHT_INTENSITY;
const vec3 ORANGE = vec3(1.0, 0.67, 0.43) * LIGHT_INTENSITY;
const vec3 BLUE   = vec3(0.54, 0.77, 1.0) * LIGHT_INTENSITY;
const vec3 WHITE  = vec3(1.2, 1.07, 0.98) * LIGHT_INTENSITY;
const float DISPLACEMENT = 0.1;
const float PI = 3.1415;
const int NUM_STEPS = 40;

// math
mat3 fromEuler(vec3 ang)
{
  vec2 a1 = vec2(sin(ang.x), cos(ang.x));
  vec2 a2 = vec2(sin(ang.y), cos(ang.y));
  vec2 a3 = vec2(sin(ang.z), cos(ang.z));
  mat3 m;
  m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x, a1.y*a2.x*a3.x+a3.y*a1.x, -a2.y*a3.x);
  m[1] = vec3(-a2.y*a1.x, a1.y*a2.y, a2.x);
  m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x, a1.x*a3.x-a1.y*a3.y*a2.x, a2.y*a3.y);
  return m;
}
float hash11(float p)
{ return fract(sin(p * 727.1)*43758.5453123);
}
float hash12(vec2 p)
{ float h = dot(p, vec2(127.1, 311.7));  
  return fract(sin(h)*43758.5453123);
}
vec3 hash31(float p)
{ vec3 h = vec3(1275.231, 4461.7, 7182.423) * p;  
  return fract(sin(h)*43758.543123);
}

// 3d noise
float noise_3(in vec3 p)
{
  //p += 123.0;
  vec3 i = floor(p);
  vec3 f = fract(p);  
  vec3 u = f*f*(3.0-2.0*f);

  vec2 ii = i.xy + i.z * vec2(5.0);
  float a = hash12( ii + vec2(0.0, 0.0) );
  float b = hash12( ii + vec2(1.0, 0.0) );    
  float c = hash12( ii + vec2(0.0, 1.0) );
  float d = hash12( ii + vec2(1.0, 1.0) ); 
  float v1 = mix(mix(a, b, u.x), mix(c, d, u.x), u.y);

  ii += vec2(5.0);
  a = hash12( ii + vec2(0.0, 0.0) );
  b = hash12( ii + vec2(1.0, 0.0) );    
  c = hash12( ii + vec2(0.0, 1.0) );
  d = hash12( ii + vec2(1.0, 1.0) );
  float v2 = mix(mix(a, b, u.x), mix(c, d, u.x), u.y);

  return max(mix(v1, v2, u.z), 0.0);
}

// fBm
float fbm3(vec3 p, float a, float f) 
{
  return noise_3(p);
}

float fbm3_high(vec3 p, float a, float f)
{
  float ret = 0.0;    
  float amp = 1.0;
  float frq = 1.0;
  for (int i = 0; i < 4; i++) {
    float n = pow(noise_3(p * frq), 2.0);
    ret += n * amp;
    frq *= f;
    amp *= a * (pow(n, 0.2));
  }
  return ret;
}

// lighting
float diffuse(vec3 n, vec3 l, float p)
{ 
  return pow(max(dot(n, l), 0.0), p);
}
float specular(vec3 n, vec3 l, vec3 e, float s)
{    
  float nrm = (s + 8.0) / (3.1415 * 4.0);
  return pow(max(dot(reflect(e, n), l), 0.0), s) * nrm;
}

// distance functions
float plane(vec3 gp, vec4 p) {
  return dot(p.xyz, gp+p.xyz*p.w);
}
float sphere(vec3 p, float r) {
  return length(p)-r;
}
float capsule(vec3 p, float r, float h) {
  p.y -= clamp(p.y, -h, h);
  return length(p)-r;
}
float cylinder(vec3 p, float r, float h) {
  return max(abs(p.y/h), capsule(p, r, h));
}
float box(vec3 p, vec3 s) {
  p = abs(p)-s;
  return max(max(p.x, p.y), p.z);
}
float rbox(vec3 p, vec3 s) {
  p = abs(p)-s;
  return length(p-min(p, 0.0));
}
float quad(vec3 p, vec2 s) {
  p = abs(p) - vec3(s.x, 0.0, s.y);
  return max(max(p.x, p.y), p.z);
}

// boolean operations
float boolUnion(float a, float b)     { return min(a, b); }
float boolIntersect(float a, float b) { return max(a, b); }
float boolSub(float a, float b)       { return max(a, -b); }

// smooth operations. thanks to iq
float boolSmoothIntersect(float a, float b, float k) 
{
  float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
  return mix(a, b, h) + k*h*(1.0-h);
}
float boolSmoothSub(float a, float b, float k)
{
  return boolSmoothIntersect(a, -b, k);
}  

// world
float rock(vec3 p)
{    
  float d = sphere(p, 1.0);    
  for (int i = 0; i < 9; i++)
  {
    float ii = float(i);
    float r = 2.0 + hash11(ii);
    vec3 v = normalize(hash31(ii) * 2.10 - 1.0);
    #ifdef SMOOTH
      d = boolSmoothSub(d, sphere(p+v*r, r * 0.8), 0.03);
    #else
      d = boolSub(d, sphere(p+v*r, r * 0.8));
    #endif
  }
  return d;
}

float map(vec3 p)
{
  float d = rock(p) + fbm3(p*4.0, 0.4, 2.96) * DISPLACEMENT;
  d = boolUnion(d, plane(p, vec4(0.0, 1.0, 0.0, 1.0)));
  return d;
}

float map_detailed(vec3 p)
{
  float d = rock(p) + fbm3_high(p*4.0, 0.4, 2.96) * DISPLACEMENT;
  d = boolUnion(d, plane(p, vec4(0.0, 1.0, 0.0, 1.0)));
  return d;
}

// tracing
vec3 getNormal(vec3 p, float dens)
{
  vec3 n;
  n.x = map_detailed(vec3(p.x+EPSILON, p.y, p.z));
  n.y = map_detailed(vec3(p.x, p.y+EPSILON, p.z));
  n.z = map_detailed(vec3(p.x, p.y, p.z+EPSILON));
  return normalize(n-map_detailed(p));
}

vec2 getOcclusion(vec3 p, vec3 n) 
{
  vec2 r = vec2(0.0);
  for (int i = 0; i < AO_SAMPLES; i++)
  {
    float f = float(i)*INV_AO_SAMPLES;
    float hao = 0.01+f*AO_PARAM.x;
    float hc = 0.01+f*CORNER_PARAM.x;
    float dao = map(p + n * hao) - TRESHOLD;
    float dc = map(p - n * hc) - TRESHOLD;
    r.x += clamp(hao-dao, 0.0, 1.0) * (1.0-f);
    r.y += clamp(hc+dc, 0.0, 1.0) * (1.0-f);
  }    
  r.x = pow(clamp(1.0-r.x*INV_AO_SAMPLES*AO_PARAM.y, 0.0, 1.0), 0.5);
  r.y = clamp(r.y*INV_AO_SAMPLES*CORNER_PARAM.y, 0.0, 1.0);
  return r;
}

vec2 spheretracing(vec3 ori, vec3 dir, out vec3 p) 
{
  vec2 td = vec2(0.0);
  for (int i = 0; i < NUM_STEPS; i++)
  {
    p = ori + dir * td.x;
    td.y = map(p);
    if (td.y < TRESHOLD) break;
    td.x += (td.y-TRESHOLD) * 0.9;
  }
  return td;
}

// stone
vec3 getStoneColor(vec3 p, float c, vec3 l, vec3 n, vec3 e) 
{
  c = min(c + pow(noise_3(vec3(p.x*20.0, 0.0, p.z*20.0)), 70.0) * 8.0, 1.0);
  float ic = pow(1.0-c, 0.5);
  vec3 base = vec3(0.42, 0.36, 0.14)*0.8;
  vec3 sand = vec3(0.44, 0.38, 0.2)*0.8;
  vec3 color = mix(base, sand, c);

  float f = pow(1.0 - max(dot(n, -e), 0.0), 1.5) * 0.75 * ic;
  color = mix(color, vec3(1.0), f);    
  color += vec3(diffuse(n, l, 0.5) * RED);
  color += vec3(specular(n, l, e, 8.0) * RED * 1.5 * ic);
  n = normalize(n - normalize(p) * 0.4);    
  color += vec3(specular(n, l, e, 8.0) * RED * 1.5 * ic);    
  return color;
}

// main
void main(void) 
{
  vec2 iuv = gl_FragCoord.xy / resolution.xy * 2.0 - 1.0;
  vec2 uv = iuv;
  uv.x *= resolution.x / resolution.y;    

  // ray
  vec3 ang = vec3(0.0, clamp(2.0-mouse.y*2.0, -PI, PI), mouse.x*4.0 + time*0.03);
  mat3 rot = fromEuler(ang);

  vec3 ori = vec3(0.0, 0.0, 2.8);
  vec3 dir = normalize(vec3(uv.xy, -2.0));    
  ori = ori * rot;
  dir = dir * rot;

  // tracing
  vec3 p;
  vec2 td = spheretracing(ori, dir, p);
  vec3 n = getNormal(p, td.y);
  vec2 occ = getOcclusion(p, n);
  vec3 light = normalize(vec3(0.0, 1.0, 0.0)); 

  // color
  vec3 color = vec3(0.5);    
  if (td.x < 3.5 && p.y > -0.89) 
    color = getStoneColor(p, occ.y, light, n, dir);
  color *= occ.x;

  // background
//  color = mix(vec3(1.0), color, step(td.y, 1.0));

  // post
  float vgn = smoothstep(1.2, 0.7, abs(iuv.y)) * smoothstep(1.1, 0.8, abs(iuv.x));
  color *= 1.0 - (1.0 - vgn) * 0.15;  
  gl_FragColor = vec4(color, 1.0);
}
