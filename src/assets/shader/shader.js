// noprotect

// https://github.com/ZRNOF/Shox
import * as Shox from 'shox'

export const frag = `#version 300 es
  precision mediump float;

  uniform sampler2D tex0;
  uniform vec2 texelSize;
  uniform vec2 canvasSize;
  uniform vec2 mouse;
  uniform float time;

  ${Shox.iqPalette}

  // ref: https://piterpasma.nl/articles/wobbly
  float wobbly(vec2 uv, float t) {
    float w0 = sin(.3*uv.x+2.*t+1.+2.3*sin(.4*uv.y-2.*t+.5));
    float w1 = sin(.2*uv.y+3.*t+2.+2.2*sin(.5*uv.x-3.*t+.4));
    return .5+.25*(w0+w1);
  }

  float fbm(vec2 uv, float t) {
    float n = 0.;
    n +=    1.*wobbly(  1.*uv+vec2(100., 200.), t*.25 );
    n +=    .5*wobbly(  2.*uv+vec2(300., 400.), t*.25 );
    n +=   .25*wobbly(  4.*uv+vec2(500., 600.), t*.25 );
    n +=  .125*wobbly(  8.*uv+vec2(700., 800.), t*.25 );
    n += .0625*wobbly( 16.*uv+vec2(900., 0.00), t*.25 );
    return n/1.9375;
  }

  in vec2 vTexCoord;
  out vec4 fragColor;
  void main() {
    vec2 uv = vTexCoord*2.-1.;
    if (canvasSize.x>canvasSize.y) uv.x *= canvasSize.x/canvasSize.y;
    else uv.y *= canvasSize.y/canvasSize.x;
    uv *= 6.;

    float n = fbm(uv, time);
    vec2 a = vec2( fbm(uv+1.*n+vec2(1.2, 2.3), time), fbm(uv+1.*n+vec2(3.4, 4.5), time) );
    vec2 b = vec2( fbm(uv+2.*a+vec2(5.6, 6.7), time), fbm(uv+2.*a+vec2(7.8, 8.9), time) );
    float r = fbm(uv+50.*b, time);
    r = n*fbm(uv+5.*r, time);

    vec3 col = palette(r,
      vec3(1.0, 1.0, 1.0),
      vec3(1.5, 1.0, 1.5),
      vec3(1.0, 1.0, 1.0),
      vec3(0.2, 0.1, 0.0)
    );

    fragColor = vec4(col, 1.);
  }
`

export const vert = `#version 300 es

  in vec4 aPosition;
  in vec2 aTexCoord;

  out vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    gl_Position = aPosition;
  }
`
