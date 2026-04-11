'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class QuantumInterferenceSketch extends Sketch {
	myShader: p5.Shader | null = null
	gl: WebGLRenderingContext | null = null
	glProgram: WebGLProgram | null = null
	posBuffer: WebGLBuffer | null = null
	uResolutionLoc: WebGLUniformLocation | null = null
	uTimeLoc: WebGLUniformLocation | null = null
	uBassLoc: WebGLUniformLocation | null = null
	uMidLoc: WebGLUniformLocation | null = null
	uHighLoc: WebGLUniformLocation | null = null
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
	}

	setup(): void {
		if (this.p && (this.p as any).pixelDensity) {
			this.p.pixelDensity(1)
		}
		super.setup()
		this.p.noStroke()

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

			const fsSrc = `#version 100
				precision mediump float;
				varying vec2 vTexCoord;
				uniform vec2 uResolution;
				uniform float uTime;
				uniform float uBass;
				uniform float uMid;
				uniform float uHigh;

				// Palette function from Inigo Quilez
				vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
					return a + b * cos(6.28318 * (c * t + d));
				}

				void main() {
					// Normalize coordinates and center them
					vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
					vec2 uv0 = uv;

					// Base colors for the palette (Deep Space/Quantum vibe: cyan, purple, dark blue)
					vec3 a = vec3(0.5, 0.5, 0.5);
					vec3 b = vec3(0.5, 0.5, 0.5);
					vec3 c = vec3(1.0, 1.0, 1.0);
					vec3 d = vec3(0.263, 0.416, 0.557);

					vec3 finalColor = vec3(0.0);

					// Dynamic parameters driven by audio
					// Bass drives the speed and the strength of the distortion
					// Highs drive the frequency (sharpness) of the ripples
					float speed = uTime * (0.5 + uBass * 1.5);
					float freq = 8.0 + uHigh * 15.0; // Higher freq = finer ripples

					for(float i = 0.0; i < 4.0; i++) {
						uv = fract(uv * 1.5) - 0.5; // Fold space
						
						float d0 = length(uv) * exp(-length(uv0)); // Dist from center

						// Add ripple interference
						// Adding a bit of mid-range dependency on the phase
						d0 = sin(d0 * freq + speed + (i * uMid * 2.0)) / freq;
						d0 = abs(d0); // Make it a glow
						
						d0 = pow(0.01 / d0, 1.2); // Intensify glow

						// Calculate color based on distance and time
						// Shift color dynamically with bass
						float colorShift = length(uv0) + (i * 0.4) + speed * 0.4 + uBass * 0.5;
						vec3 col = palette(colorShift, a, b, c, d);
						
						finalColor += col * d0;
					}

					// Adds a vignette/darkening to the edges for a premium look
					float vignette = smoothstep(1.5, 0.0, length(uv0));
					finalColor *= vignette;

					gl_FragColor = vec4(finalColor, 1.0);
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

			this.posBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
			// Draw a full-screen triangle
			const verts = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0])
			gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

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

		// Get audio bands from AudioAnalyzer
		const bands = this.getVolumeEachBand()

		// bands: 0: treble, 1: highMid, 2: mid, 3: lowMid, 4: bass
		const rawBass = (bands[3] + bands[4]) / 2
		const targetBass = this.p.map(rawBass, 0, 255, 0, 1.0)
		this.smoothedBass = this.p.lerp(this.smoothedBass, targetBass, 0.1)

		const rawMid = bands[2]
		const targetMid = this.p.map(rawMid, 0, 200, 0, 1.0)
		this.smoothedMid = this.p.lerp(this.smoothedMid, targetMid, 0.1)

		const rawHigh = (bands[0] + bands[1]) / 2
		const targetHigh = this.p.map(rawHigh, 0, 150, 0, 1.0)
		this.smoothedHigh = this.p.lerp(this.smoothedHigh, targetHigh, 0.1)

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

			// Feed audio data
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
	const sketch: QuantumInterferenceSketch = new QuantumInterferenceSketch()
	sketch.init()
}
