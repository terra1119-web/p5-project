'use strict'
import Sketch from '@/class/Sketch'

class CyberCircuitSketch extends Sketch {
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
		if (!this.p) return
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

				float hash(vec2 p) {
					p = fract(p * vec2(123.34, 456.21));
					p += dot(p, p + 45.32);
					return fract(p.x * p.y);
				}

				void main() {
					vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
					
					uv *= (1.0 - uBass * 0.12);
					
					vec3 col = vec3(0.01, 0.02, 0.05);
					
					float scale1 = 10.0;
					vec2 g1 = floor(uv * scale1);
					vec2 f1 = fract(uv * scale1);
					
					float h1 = hash(g1);
					float line1 = 0.0;
					if (h1 < 0.5) {
						line1 = smoothstep(0.08, 0.03, abs(f1.x - 0.5));
					} else {
						line1 = smoothstep(0.08, 0.03, abs(f1.y - 0.5));
					}
					
					float speed = uTime * (1.5 + uMid * 3.0);
					float pulse1 = 0.0;
					if (h1 < 0.5) {
						float dir = (hash(g1 + 1.0) > 0.5) ? 1.0 : -1.0;
						pulse1 = smoothstep(0.3, 0.0, abs(fract(f1.y + speed * dir) - 0.5));
					} else {
						float dir = (hash(g1 + 2.0) > 0.5) ? 1.0 : -1.0;
						pulse1 = smoothstep(0.3, 0.0, abs(fract(f1.x + speed * dir) - 0.5));
					}
					
					vec3 traceColor = mix(vec3(0.0, 0.4, 0.6), vec3(0.0, 0.9, 0.7), uMid);
					col += traceColor * line1 * 0.4;
					
					vec3 pulseColor = mix(vec3(0.0, 0.8, 1.0), vec3(1.0, 0.8, 0.2), uBass);
					col += pulseColor * line1 * pulse1 * (1.5 + uBass * 3.0);
					
					float node = smoothstep(0.14, 0.09, length(f1 - 0.5));
					if (hash(g1 + 5.0) > 0.6) {
						col += vec3(1.0, 0.9, 0.4) * node * (0.4 + uHigh * 2.5);
					}
					
					float scale2 = 30.0;
					vec2 g2 = floor(uv * scale2);
					vec2 f2 = fract(uv * scale2);
					float h2 = hash(g2);
					float line2 = (h2 < 0.5) ? smoothstep(0.05, 0.02, abs(f2.x - 0.5)) : smoothstep(0.05, 0.02, abs(f2.y - 0.5));
					col += vec3(0.0, 0.5, 0.8) * line2 * 0.12 * (1.0 + uHigh);
					
					float vig = 1.0 - dot(uv, uv) * 0.6;
					col *= clamp(vig, 0.0, 1.0);
					
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
	const sketch: CyberCircuitSketch = new CyberCircuitSketch()
	sketch.init()
}
