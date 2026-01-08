'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class LightningSketch extends Sketch {
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

				// ---------------------------------------------
				// Noise Functions
				// ---------------------------------------------
				float random(vec2 st) {
					return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
				}

				float noise(vec2 st) {
					vec2 i = floor(st);
					vec2 f = fract(st);
					float a = random(i);
					float b = random(i + vec2(1.0, 0.0));
					float c = random(i + vec2(0.0, 1.0));
					float d = random(i + vec2(1.0, 1.0));
					vec2 u = f * f * (3.0 - 2.0 * f);
					return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
				}

				#define OCTAVES 6
				float fbm(vec2 st) {
					float value = 0.0;
					float amplitude = .5;
					float persistence = 0.5;
					for (int i = 0; i < OCTAVES; i++) {
						value += amplitude * noise(st);
						st *= 2.;
						amplitude *= persistence;
					}
					return value;
				}

				// ---------------------------------------------
				// Lightning Function
				// ---------------------------------------------
				float lightning(vec2 uv, float t) {
					// Distort UV for jagged look
					vec2 noiseVal = vec2(fbm(uv * 3.0 + t * 5.0), fbm(uv * 3.0 + t * 5.0 + 100.0));
					vec2 distortedUV = uv + (noiseVal - 0.5) * 0.2; // Strength of jaggedness

					// Core line distance
					// Vertical lightning for now, centered at random x
					float d = abs(distortedUV.x - 0.5);

					// Intensity with glow
					float k = 0.02 / d; // 0.02 is thickness
					return k;
				}

				// ---------------------------------------------
				// Main
				// ---------------------------------------------
				void main() {
					vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
					vec2 st = gl_FragCoord.xy / uResolution.xy; // 0-1 coords

					// Audio Mods
					float bass = uBass;
					float mid = uMid;
					float high = uHigh;

					// 1. Clouds background (Dark & Stormy)
					float cloudTime = uTime * 0.1 + bass * 0.1;
					float n = fbm(uv * 3.0 + cloudTime);

					vec3 cloudColor = mix(
						vec3(0.05, 0.05, 0.1), // Dark Blue Grey
						vec3(0.2, 0.2, 0.3),   // Lighter Grey
						n
					);
					// Bass makes clouds flash slightly
					cloudColor += vec3(0.1) * bass * n;

					// 2. Lightning
					// Flash randomly based on high freq + noise
					float flashNoise = random(vec2(uTime * 10.0, 0.0));
					float flashTrigger = step(0.98 - (high * 0.05), flashNoise); // High bands increase probability

					// Position lightning randomly
					float lightningPos = random(vec2(floor(uTime * 10.0), 1.0));
					// Shift uv for lightning
					vec2 luv = st;
					luv.x = fract(luv.x - lightningPos + 0.5); // Center around 0.5

					// Procedural Lightning pattern
					// Create branching effect by superimposing noise
					float branchNoise = fbm(uv * vec2(10.0, 50.0) + uTime * 20.0);
					float mainBolt = 0.0;

					if (flashTrigger > 0.5) {
						// Main vertical bolt
						float boltDist = abs(uv.x - (lightningPos - 0.5) * 2.0 + (branchNoise - 0.5) * 0.2);
						mainBolt = 0.01 / (boltDist + 0.001);

						// Fade edges
						mainBolt *= smoothstep(1.0, 0.0, abs(uv.y));
					}

					vec3 boltColor = vec3(0.8, 0.9, 1.0) * mainBolt * (2.0 + high * 2.0);

					// Combine
					vec3 col = cloudColor + boltColor;

					// Global flash on big beats
					if (flashTrigger > 0.5) {
						col += vec3(0.2, 0.2, 0.3) * (high + 0.2);
					}

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

			this.posBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
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

		const bands = this.getVolumeEachBand()

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
	const sketch: LightningSketch = new LightningSketch()
	sketch.init()
}
