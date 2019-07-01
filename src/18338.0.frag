//Could do with some severe performance improvements. It's a real duty on the fan atm :)

#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

mat2 m = mat2( 0.90,  0.110, -0.70,  1.00 );
float numfreq = 2.0;

float hash( float n )
{
    return fract(sin(n)*758.5453);
}

float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);
    //f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0 + p.z*800.0;
    float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x), mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                    mix(mix( hash(n+800.0), hash(n+801.0),f.x), mix( hash(n+857.0), hash(n+858.0),f.x),f.y),f.z);
    return res;
}

float fbm( vec3 p )
{
    float f = 0.0;
    f += 0.50000*noise( p ); p = p*numfreq+0.02;
    f += 0.25000*noise( p ); p = p*numfreq+0.03;
    f += 0.12500*noise( p ); p = p*numfreq+0.01;
    f += 0.06250*noise( p ); p = p*numfreq+0.04;
    f += 0.03125*noise( p );
    return f/0.984375;
}

float cloud(vec3 p)
{
	p+=fbm(vec3(p.x,p.y,0.0)*0.5)*2.9;
	
	
	float a =0.0;
	a+=fbm(p*3.0)*2.2-0.9;
	if (a<0.0) a=0.0;
	//a=a*a;
	return a;
}

vec3 f2(vec3 c)
{
	c+=hash(time+gl_FragCoord.x+gl_FragCoord.y*9.9)*0.01;
	
	
	c*=0.7-length(gl_FragCoord.xy / resolution.xy -0.5)*0.7;
	float w=length(c);
	c=mix(c*vec3(1.0,1.2,1.6),vec3(w,w,w)*vec3(1.4,1.2,1.0),w*1.1-0.2);
	return c;
}


float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43768.5453);
}

void main( void ) {
    
	vec2 position = ( gl_FragCoord.xy / resolution.xy ) ;
	position.y+=0.2;
    
	vec2 coord= vec2((position.x-0.5)/position.y,1.0/(position.y+0.2))*vec2(-0.5,0.5);
	coord+=time*0.01;
	
	
	float q = cloud(vec3(coord*1.0,time*0.0222));
	float qx= cloud(vec3(coord+vec2(0.156,0.0),time*0.0222));
	float qy= cloud(vec3(coord+vec2(0.0,0.156),time*0.0222));
	q+=qx+qy; q*=0.33333;
	qx=q-qx;
	qy=q-qy;
	
	float s =(-qx*2.0-qy*0.3); if (s<-0.05) s=-0.05;
	
    vec3 d=s*vec3(0.9,0.6,0.3);
    //d=max(vec3(0.0),d);
	//d+=0.1;
	d*=0.3;
	d=mix(vec3(1.0,1.0,1.0)*0.1+d*1.0,vec3(1.0,1.0,1.0)*0.9,1.0-pow(q,0.03)*1.1);
    d*=8.0;
    //d+=cos(time*0.01-0.5);
        
    //Stars
	float scale = 8.0;
	vec2 position2 = ((((gl_FragCoord.xy / resolution ))) * scale);
	float gradient = 0.0;
	float fade = 0.0;
	float z = 0.0;
 	vec2 centered_coord = position2*rand(position)+(s*0.1)/2.0;
	vec3 color;
	for (float i=1.0; i<=30.0; i++)
	{
		vec2 star_pos = vec2(rand(vec2(i)) * 250.0, rand(vec2(i*i)) * 250.0);
		float z = mod(sin(i*i*i)*s + 200.0, 256.0);
		float fade = (256.0 - z) /256.0;
		vec2 blob_coord = star_pos / z;
		gradient += ((fade / 384.0) / pow(length(centered_coord - blob_coord), 1.5)) * (fade);
	}
	
    vec3 col =mix(vec3(sin(time*0.1-3.6)-2.0/(position.y*2.5+0.2),sin(time*0.1+0.5)/(position.y*9.5),0.2)*cos(time*0.1+sin(time*0.1-1.0))+gradient*cos(time*0.1),d,clamp(0.0,q*2.9,1.0));
    
    //vec3 col =mix(vec3(0.1,0.5,0.8)/(position.y*0.5+0.7)*gradient*0.1,d,q);
    color = vec3(gradient, gradient, gradient / 1.0);
	col += (color*0.6);
    
	gl_FragColor = vec4( f2(col), 1.0 );
}
