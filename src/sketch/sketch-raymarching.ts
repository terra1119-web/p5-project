'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class RaymarchingSketch extends Sketch {
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
			// use2D: true はWEBGLモードでrectを使うための座標補正ですが、
			// planeを使う場合は不要になるか、むしろ干渉する可能性があります。
			// 今回はplaneを使うので、WEBGLモードのデフォルト座標系で処理します。
			// もし他の2D描画を同時に行う場合は調整が必要ですが、シェーダー単独ならfalse推奨です。
			use2D: false, // ここをfalseに変更
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
		// Force 1:1 pixel density before canvas is created in super.setup()
		if (this.p && (this.p as any).pixelDensity) {
			this.p.pixelDensity(1)
		}
		super.setup()
		this.p.noStroke()

		const vertSrc = `
			attribute vec3 aPosition;
			attribute vec2 aTexCoord;
			varying vec2 vTexCoord;
			void main() {
				vTexCoord = aTexCoord;
				// p5.js provides aPosition in clip space for WEBGL geometry,
				// so we can directly use it as gl_Position.
				gl_Position = vec4(aPosition, 1.0);
			}
		`

		const fragSrc = `
			precision mediump float;
			varying vec2 vTexCoord;

			uniform vec2 uResolution;
			uniform float uTime;
			// mouse disabled: we don't use uMouse for this sketch

			uniform float uBass;
			uniform float uMid;
			uniform float uHigh;

			mat2 rot(float a) {
				float s = sin(a);
				float c = cos(a);
				return mat2(c, -s, s, c);
			}

			vec3 palette(float t) {
				vec3 a = vec3(0.5, 0.5, 0.5);
				vec3 b = vec3(0.5, 0.5, 0.5);
				vec3 c = vec3(1.0, 1.0, 1.0);
				vec3 d = vec3(0.263, 0.416, 0.557);
				return a + b * cos(6.28318 * (c * t + d + uMid));
			}

			float map(vec3 p) {
				vec3 q = p;

				q.z = mod(p.z, 4.0) - 2.0;

				float s = 1.0;
				for(int i = 0; i < 4; i++) {
					q = abs(q) - 0.5 - min(uBass, 0.5) * 0.2;

					if(q.x < q.y) q.xy = q.yx;
					if(q.x < q.z) q.xz = q.zx;
					if(q.y < q.z) q.yz = q.zy;

					q.xy *= rot(uTime * 0.1 + uHigh * 0.5);
				}

				float d = length(q) - 0.3;
				return d * 0.5;
			}

			void main() {
				// Use interpolated texture coordinates to compute centered UV in a
				// pixel-density-agnostic way. vTexCoord is in [0,1].
				vec2 centered = vTexCoord * 2.0 - 1.0; // [-1,1]
				vec2 scale = vec2(uResolution.x / min(uResolution.x, uResolution.y), uResolution.y / min(uResolution.x, uResolution.y));
				vec2 uv = centered * scale;

				// mouse disabled: use center
				vec2 m = vec2(0.0, 0.0);

				vec3 ro = vec3(0.0, 0.0, -3.0);
				ro.xy += m * 1.0;

				vec3 rd = normalize(vec3(uv, 1.5));

				rd.xy *= rot(uTime * 0.2);

				float t = 0.0;
				float d = 0.0;
				vec3 accColor = vec3(0.0);

				for(int i = 0; i < 80; i++) {
					vec3 p = ro + rd * t;

					p.xy *= rot(sin(p.z * 0.5 + uTime) * 0.2);

					d = map(p);

					// further reduce glow and per-sample multiplier to avoid clipping
					float glowAmt = min(0.002 / (0.01 + abs(d)), 0.1);

					vec3 pCol = palette(length(p) * 0.4 + uTime * 0.4 + float(i)*0.02);

					// soft-additive compositing: attenuate new contribution by remaining headroom
					// so once a channel approaches 1.0 it won't runaway brighter
					accColor = accColor + pCol * glowAmt * (0.25 + uHigh * 0.6) * (1.0 - accColor);

					t += d * 0.8;

					if(t > 20.0) break;
				}

				accColor *= 1.0 - length(uv) * 0.5;
				// exposure + reinhard tone mapping + gamma correction to tame highlights
				float exposure = 1.0;
				accColor *= exposure;
				// stronger reinhard denominator to reduce peaks
				accColor = accColor / (accColor + vec3(0.8));
				// clamp to avoid numerical runaway
				accColor = clamp(accColor, 0.0, 1.0);
				accColor = pow(accColor, vec3(1.0 / 2.2));
				gl_FragColor = vec4(accColor, 1.0);
			}
		`

		this.myShader = this.p.createShader(vertSrc, fragSrc)

		// Prepare raw WebGL program and full-screen-triangle buffer so we can
		// draw a guaranteed full-screen quad independent of p5 geometry issues.
		try {
			const dc = (this.p as any).drawingContext as WebGLRenderingContext
			this.gl = dc
			const gl = dc
			const vs = gl.createShader(gl.VERTEX_SHADER)!
			const fs = gl.createShader(gl.FRAGMENT_SHADER)!
			// Vertex shader: full-screen triangle using clip-space positions
			const vsSrc = `#version 100
attribute vec2 aPosition;
varying vec2 vTexCoord;
void main() {
  vTexCoord = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`
			const fsSrc = `#version 100
		precision mediump float;
		varying vec2 vTexCoord;
		uniform vec2 uResolution;
		uniform float uTime;
		uniform float uBass; uniform float uMid; uniform float uHigh;

		mat2 rot(float a) { float s = sin(a); float c = cos(a); return mat2(c, -s, s, c); }
		vec3 palette(float t){ vec3 a = vec3(0.5); vec3 b = vec3(0.5); vec3 c = vec3(1.0); vec3 d = vec3(0.263,0.416,0.557); return a + b * cos(6.28318 * (c * t + d + uMid)); }
		float map(vec3 p){ vec3 q = p; q.z = mod(p.z, 4.0) - 2.0; for(int i=0;i<4;i++){ q = abs(q) - 0.5 - min(uBass, 0.5) * 0.2; if(q.x<q.y) q.xy=q.yx; if(q.x<q.z) q.xz=q.zx; if(q.y<q.z) q.yz=q.zy; q.xy *= rot(uTime*0.1+uHigh*0.5); } float d = length(q)-0.3; return d*0.5; }

			void main(){ vec2 centered = vTexCoord*2.0 - 1.0; vec2 scale = vec2(uResolution.x/min(uResolution.x,uResolution.y), uResolution.y/min(uResolution.x,uResolution.y)); vec2 uv = centered * scale; vec2 m = vec2(0.0, 0.0); vec3 ro = vec3(0.0,0.0,-3.0); ro.xy += m; vec3 rd = normalize(vec3(uv,1.5)); rd.xy *= rot(uTime*0.2); float t=0.0; float d=0.0; vec3 accColor = vec3(0.0); for(int i=0;i<80;i++){ vec3 p = ro + rd * t; p.xy *= rot(sin(p.z*0.5+uTime)*0.2); d = map(p); float glowAmt = min(0.002/(0.01+abs(d)), 0.1); vec3 pCol = palette(length(p)*0.4 + uTime*0.4 + float(i)*0.02); /* soft-add: attenuate by remaining headroom (1 - accColor) */ accColor = accColor + pCol * glowAmt * (0.25 + uHigh * 0.6) * (1.0 - accColor); t += d * 0.8; if(t>20.0) break; } accColor *= 1.0 - length(uv)*0.5; float exposure = 1.0; accColor *= exposure; accColor = accColor / (accColor + vec3(0.8)); accColor = clamp(accColor, 0.0, 1.0); accColor = pow(accColor, vec3(1.0/2.2)); gl_FragColor = vec4(accColor,1.0); }
		`
			gl.shaderSource(vs, vsSrc)
			gl.shaderSource(fs, fsSrc)
			gl.compileShader(vs)
			gl.compileShader(fs)
			const prog = gl.createProgram()!
			gl.attachShader(prog, vs)
			gl.attachShader(prog, fs)
			gl.bindAttribLocation(prog, 0, 'aPosition')
			gl.linkProgram(prog)
			this.glProgram = prog
			// create a single-triangle buffer that covers the full screen
			this.posBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
			const verts = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0])
			gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
			// cache uniform locations
			this.uResolutionLoc = gl.getUniformLocation(prog, 'uResolution')
			this.uTimeLoc = gl.getUniformLocation(prog, 'uTime')
			this.uBassLoc = gl.getUniformLocation(prog, 'uBass')
			this.uMidLoc = gl.getUniformLocation(prog, 'uMid')
			this.uHighLoc = gl.getUniformLocation(prog, 'uHigh')
		} catch (e) {
			console.warn('WebGL raw program setup failed', e)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		// 音声解析
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

		// If we successfully created a raw GL program, use it to draw a full-screen triangle.
		if (this.gl && this.glProgram && this.posBuffer) {
			const gl = this.gl
			const prog = this.glProgram
			gl.useProgram(prog)
			// set viewport to canvas size
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
			// bind buffer and enable attribute 0 (aPosition)
			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
			gl.enableVertexAttribArray(0)
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
			// set uniforms
			if (this.uResolutionLoc)
				gl.uniform2f(this.uResolutionLoc, this.p.width, this.p.height)
			if (this.uTimeLoc)
				gl.uniform1f(this.uTimeLoc, this.p.millis() / 1000.0)
			// mouse input disabled for this sketch (no interactions)
			if (this.uBassLoc) gl.uniform1f(this.uBassLoc, this.smoothedBass)
			if (this.uMidLoc) gl.uniform1f(this.uMidLoc, this.smoothedMid)
			if (this.uHighLoc) gl.uniform1f(this.uHighLoc, this.smoothedHigh)
			// draw
			gl.drawArrays(gl.TRIANGLES, 0, 3)
			// unbind
			gl.disableVertexAttribArray(0)
			gl.bindBuffer(gl.ARRAY_BUFFER, null)
		} else {
			// fallback: draw a p5 rect as before
			this.p.push()
			this.p.noStroke()
			this.p.rectMode(this.p.CORNER)
			this.p.rect(
				-this.p.width / 2,
				-this.p.height / 2,
				this.p.width,
				this.p.height
			)
			this.p.pop()
		}
	}

	mousePressed(): void {
		super.mousePressed()
		// audio start is handled in base Sketch.mousePressed()
	}
}

export default function (): void {
	const sketch: RaymarchingSketch = new RaymarchingSketch()
	sketch.init()
}
