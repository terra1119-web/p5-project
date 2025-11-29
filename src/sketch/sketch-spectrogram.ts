'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

const vert = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
  vTexCoord = aTexCoord;
}
`

const frag = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
uniform sampler2D u_tex;
uniform float u_time;

// Color palette function
vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  // Get the frequency data from the texture
  // The texture contains the history of FFT analysis
  // vTexCoord.y corresponds to time (scrolling), vTexCoord.x to frequency

  // Flip Y to match p5 coordinates if needed, but usually standard
  vec2 uv = vTexCoord;

  // Sample the texture
  // We assume the data is stored in the red channel (or grayscale)
  vec4 texColor = texture2D(u_tex, uv);
  float intensity = texColor.r;

  // Enhance low values to make silence/noise visible or just contrast
  intensity = pow(intensity, 0.8);

  // Map intensity to color
  // Use a beautiful gradient based on intensity and frequency (uv.x)
  vec3 col = palette(intensity + uv.x * 0.2 + u_time * 0.1);

  // Mix with the intensity so silence is dark
  col *= intensity;

  // Add some "weaving" effect using sine waves based on position
  float weave = 0.05 * sin(uv.y * 100.0 + u_time) * sin(uv.x * 50.0);
  col += weave * intensity;

  gl_FragColor = vec4(col, 1.0);
}
`

class SketchSpectrogram extends Sketch {
  mic: p5.AudioIn
  fft: p5.FFT
  pg: p5.Graphics
  theShader: p5.Shader
  bins: number = 512 // Resolution of frequency

  constructor() {
    super({
      renderer: 'WEBGL',
      use2D: false,
      useMic: true, // Enable microphone
    })
  }

  preload(): void {
    super.preload()
    this.theShader = this.p.createShader(vert, frag)
  }

  setup(): void {
    super.setup()

    // Initialize Audio
    this.mic = new p5.AudioIn()
    this.mic.start()
    this.fft = new p5.FFT(0.8, this.bins)
    this.fft.setInput(this.mic)

    // Create a graphics buffer to hold the spectrogram history
    // Width = number of frequency bins, Height = screen height (or history length)
    this.pg = this.p.createGraphics(this.bins, this.p.height)
    this.pg.pixelDensity(1)
    this.pg.background(0)
    this.pg.noSmooth()
  }

  draw(): void {
    super.draw()
    if (!this.p) return

    // 1. Analyze Audio
    const spectrum = this.fft.analyze()

    // 2. Update Spectrogram History (Scroll)
    // Draw the current image shifted down by 1 pixel
    this.pg.image(this.pg, 0, 1)

    // Draw the new line of data at the top (y=0)
    this.pg.loadPixels()
    // spectrum is an array of 0-255 values
    for (let i = 0; i < this.bins; i++) {
        // Map spectrum index to pixel index
        // We only need to set the top row (y=0)
        // pixels is a flat array: [r, g, b, a, r, g, b, a, ...]
        const index = i * 4
        const val = spectrum[i]

        this.pg.pixels[index] = val     // R
        this.pg.pixels[index + 1] = val // G
        this.pg.pixels[index + 2] = val // B
        this.pg.pixels[index + 3] = 255 // A
    }
    this.pg.updatePixels()

    // 3. Render with Shader
    this.p.shader(this.theShader)

    this.theShader.setUniform('u_tex', this.pg)
    this.theShader.setUniform('u_time', this.p.millis() / 1000.0)
    this.theShader.setUniform('u_resolution', [this.p.width, this.p.height])

    // Draw a rect to cover the screen, which the shader will paint
    this.p.rect(0, 0, this.p.width, this.p.height)
  }
}

export default function (): void {
  const sketch = new SketchSpectrogram()
  sketch.init()
}
