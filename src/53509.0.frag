/*
 * Original shader from: https://www.shadertoy.com/view/WsSXWz
 */

#ifdef GL_ES
precision mediump float;
#endif

// glslsandbox uniforms
uniform float time;
uniform vec2 resolution;

// shadertoy globals
#define iTime time
#define iResolution resolution

// --------[ Original ShaderToy begins here ]---------- //
//////////////////////////////////////////////////////////////////////////////////
// 1 Tweet Spiral Machine - By Frank Force - Copyright 2019
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//////////////////////////////////////////////////////////////////////////////////

#define S(v)step(.5,fract(v*a*t))
#define mainImage(c,p)vec2 r=iResolution.xy,u=99.*(p.xy-r/2.)/r.x;float P=6.28,t=.01*iTime,A=atan(u.y,u.x),a=A+P*floor(length(u)-A/P+.5),s=S(.5),v=S(1.);c=vec4(v-s*v*.5)+vec4(s*v)*cos(P*(.002*a+t+vec4(1.,.6,.3,1.)));
// --------[ Original ShaderToy ends here ]---------- //

void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
    gl_FragColor.a = 1.0;
}
