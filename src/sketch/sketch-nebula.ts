'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class NebulaSketch extends Sketch {
	myShader: p5.Shader
	gl: WebGLRenderingContext | null
	glProgram: WebGLProgram | null
	posBuffer: WebGLBuffer | null
	uResolutionLoc: WebGLUniformLocation | null
	uTimeLoc: WebGLUniformLocation | null
	uBassLoc: WebGLUniformLocation | null
	uMidLoc: WebGLUniformLocation | null
	uHighLoc: WebGLUniformLocation | null
	smoothedBass: number
	smoothedMid: number
	smoothedHigh: number

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true,
		})
		this.smoothedBass = 0
		this.smoothedMid = 0
		this.smoothedHigh = 0
		this.gl = null
		this.glProgram = null
		this.posBuffer = null
		this.uResolutionLoc = null
		this.uTimeLoc = null
		this.uBassLoc = null
		this.uMidLoc = null
		this.uHighLoc = null
	}

	setup(): void {
		if (this.p && (this.p as any).pixelDensity) {
			this.p.pixelDensity(1)
		}
		super.setup()
		this.p.noStroke()

		// Initialize WebGL stuff directly for performance/control
		try {
			const dc = (this.p as any).drawingContext as WebGLRenderingContext
			this.gl = dc
			const gl = dc

			const vsSrc = `#version 100
				attribute vec2 aPosition;
				varying vec2 vTexCoord;
				void main() {
					vTexCoord = aPosition * 0.5 + 0.5;
					gl_Position = vec4(aPosition, 0.0, 1.0);
				}
			`

			// Fragment shader with FBM and Domain Warping
			const fsSrc = `#version 100
				precision mediump float;
				varying vec2 vTexCoord;
				uniform vec2 uResolution;
				uniform float uTime;
				uniform float uBass;
				uniform float uMid;
				uniform float uHigh;

				// Random function
				float random (in vec2 st) {
					return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
				}

				// Noise function
				float noise (in vec2 st) {
					vec2 i = floor(st);
					vec2 f = fract(st);

					// Cubic Hermite Curve
					float a = random(i);
					float b = random(i + vec2(1.0, 0.0));
					float c = random(i + vec2(0.0, 1.0));
					float d = random(i + vec2(1.0, 1.0));

					vec2 u = f * f * (3.0 - 2.0 * f);

					return mix(a, b, u.x) +
						(c - a)* u.y * (1.0 - u.x) +
						(d - b) * u.x * u.y;
				}

				// Fractal Brownian Motion
				#define OCTAVES 6
				float fbm (in vec2 st) {
					float value = 0.0;
					float amplitude = .5;
					float frequency = 0.;

					for (int i = 0; i < OCTAVES; i++) {
						value += amplitude * noise(st);
						st *= 2.;
						amplitude *= .5;
					}
					return value;
				}

				// Palette function (Quilez)
				vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
					return a + b*cos( 6.28318*(c*t+d) );
				}

				void main() {
					vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

					// Audio reactivity modifiers
					float bassVal = uBass * 0.5; // pulsing
					float midVal = uMid * 0.2;   // speed/morph
					float highVal = uHigh * 3.0; // sparkles

					// Time flow
					float t = uTime * 0.2 + midVal;

					// Domain Warping
					vec2 q = vec2(0.);
					q.x = fbm(uv + 0.00 * t);
					q.y = fbm(uv + vec2(1.0));

					vec2 r = vec2(0.);
					r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
					r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

					float f = fbm(uv + r + bassVal * 0.2);

					// Color Mix
					// Base color mixing based on domain warping value 'f'
					vec3 col = mix(
						vec3(0.1, 0.1, 0.2), // Dark space
						vec3(0.6, 0.2, 0.4), // Reddish nebula
						clamp((f*f)*4.0, 0.0, 1.0)
					);

					// Secondary color layer influenced by another warping stage
					col = mix(
						col,
						vec3(0.1, 0.4, 0.6), // Cyan/Blue
						clamp(length(q), 0.0, 1.0)
					);

					// Add flow and time-based color shifting
					col = mix(
						col,
						vec3(0.2, 0.0, 0.3), // Deep Purple
						clamp(length(r.x), 0.0, 1.0)
					);

					// Enhance brightness with audio
					col = (f * f * f + 0.6 * f * f + 0.5 * f) * col * (1.5 + bassVal);

					// Star field (simple noise threshold)
					float starNoise = noise(uv * 50.0 + sin(uTime));
					if (starNoise > 0.98 - (highVal * 0.01)) {
						col += vec3(1.0) * (highVal + 0.5) * (starNoise - 0.98) * 50.0;
					}

					// Vignette
					col *= 1.2 - length(uv*0.8);

					gl_FragColor = vec4(col, 1.0);
				}
			`

			const vs = gl.createShader(gl.VERTEX_SHADER)!
			const fs = gl.createShader(gl.FRAGMENT_SHADER)!

			gl.shaderSource(vs, vsSrc)
			gl.shaderSource(fs, fsSrc)

			gl.compileShader(vs)
			if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
				console.error('Vertex Shader Error:', gl.getShaderInfoLog(vs))
			}

			gl.compileShader(fs)
			if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
				console.error('Fragment Shader Error:', gl.getShaderInfoLog(fs))
			}

			const prog = gl.createProgram()!
			gl.attachShader(prog, vs)
			gl.attachShader(prog, fs)
			gl.bindAttribLocation(prog, 0, 'aPosition')
			gl.linkProgram(prog)

			if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
				 console.error('Shader Link Error:', gl.getProgramInfoLog(prog))
			}

			this.glProgram = prog

			// Fullscreen triangle buffer
			this.posBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
			const verts = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0])
			gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

			// Uniform locations
			this.uResolutionLoc = gl.getUniformLocation(prog, 'uResolution')
			this.uTimeLoc = gl.getUniformLocation(prog, 'uTime')
			this.uBassLoc = gl.getUniformLocation(prog, 'uBass')
			this.uMidLoc = gl.getUniformLocation(prog, 'uMid')
			this.uHighLoc = gl.getUniformLocation(prog, 'uHigh')

		} catch (e) {
			console.warn('WebGL setup failed', e)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		// Audio Analysis
		const bands = this.getVolumeEachBand()

		// Map and smooth audio values
		const rawBass = (bands[3] + bands[4]) / 2
		const targetBass = this.p.map(rawBass, 0, 255, 0, 1.0)
		this.smoothedBass = this.p.lerp(this.smoothedBass, targetBass, 0.1)

		const rawMid = bands[2]
		const targetMid = this.p.map(rawMid, 0, 200, 0, 1.0)
		this.smoothedMid = this.p.lerp(this.smoothedMid, targetMid, 0.1)

		const rawHigh = (bands[0] + bands[1]) / 2
		const targetHigh = this.p.map(rawHigh, 0, 150, 0, 1.0)
		this.smoothedHigh = this.p.lerp(this.smoothedHigh, targetHigh, 0.1)

		// Draw using raw WebGL
		if (this.gl && this.glProgram && this.posBuffer) {
			const gl = this.gl
			const prog = this.glProgram

			gl.useProgram(prog)
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
			gl.enableVertexAttribArray(0)
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

			if (this.uResolutionLoc)
				gl.uniform2f(this.uResolutionLoc, this.p.width, this.p.height)
			if (this.uTimeLoc)
				gl.uniform1f(this.uTimeLoc, this.p.millis() / 1000.0)

			if (this.uBassLoc) gl.uniform1f(this.uBassLoc, this.smoothedBass)
			if (this.uMidLoc) gl.uniform1f(this.uMidLoc, this.smoothedMid)
			if (this.uHighLoc) gl.uniform1f(this.uHighLoc, this.smoothedHigh)

			gl.drawArrays(gl.TRIANGLES, 0, 3)

			gl.disableVertexAttribArray(0)
			gl.bindBuffer(gl.ARRAY_BUFFER, null)
		}
	}
}

export default function (): void {
	const sketch: NebulaSketch = new NebulaSketch()
	sketch.init()
}
