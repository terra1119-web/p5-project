'use strict'
import Sketch from '@/class/Sketch'

/**
 * Resonant Chimes
 * 半音ずつ調律されたガラス棒が、固有周波数に近い音にだけ共鳴して揺れ・発光する。
 * 各棒は「強制振動つき減衰振動子」としてシミュレーションし、
 * 描画はフルスクリーンのフラグメントシェーダーで行う（発光・床面反射込み）。
 */

// 棒の本数（A2〜A7 の 5 オクターブを半音刻み = 61 本）
const ROD_COUNT = 61
const F_MIN = 110
const F_MAX = 3520

// 物理パラメータ
const DAMPING = 0.1 // 減衰比 ζ
const TARGET_AMP = 0.08 // drive = 1 で共鳴したときの定常振幅 [rad]
const MAX_ANGLE = 0.12 // 描画時のソフトクリップ上限 [rad]
const BREEZE = 0.01 // 無音時のそよ風の強さ
const IDLE_GLOW = 0.08 // 無音時のほのかな発光

// 音声解析パラメータ
const NOISE_GATE = 70 // FFT 値(0-255) のノイズゲート
const SELECTIVITY = 1.15 // 全体平均より何倍突出した帯域だけを共鳴させるか
const DRIVE_RANGE = 90

type Rod = {
	freq: number // 担当周波数 [Hz]
	omega: number // 振り子としての固有角振動数（見た目用）
	angle: number
	velocity: number
	envelope: number // 発光エンベロープ
	shimmer: number // 発光の揺らぎ位相オフセット
}

const VERTEX_SHADER = `#version 100
attribute vec2 aPosition;
void main() {
	gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `#version 100
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#define N ${ROD_COUNT}

uniform vec2 uResolution;
uniform float uTime;
uniform float uSpacing;
uniform float uLevel;
uniform vec4 uRods[N]; // x: angle, y: glow, z: shimmer phase

const float PIVOT_Y = 0.62;
const float FLOOR_Y = -0.32;
const float RADIUS = 0.0052;

float hash(vec2 p) {
	p = fract(p * vec2(123.34, 456.21));
	p += dot(p, p + 45.32);
	return fract(p.x * p.y);
}

// 低音 = シアン → 中音 = ブルー → 高音 = バイオレット
vec3 rodColor(float t) {
	vec3 a = vec3(0.10, 0.85, 1.00);
	vec3 b = vec3(0.35, 0.55, 1.00);
	vec3 c = vec3(0.78, 0.45, 1.00);
	return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, t * 2.0 - 1.0);
}

vec3 scene(vec2 p, float px) {
	vec3 col = vec3(0.009, 0.011, 0.020) + vec3(0.012, 0.017, 0.032) * (p.y + 0.5);
	vec3 bloom = vec3(0.0);
	float x0 = -uSpacing * float(N - 1) * 0.5;

	for (int i = 0; i < N; i++) {
		vec2 pivot = vec2(x0 + uSpacing * float(i), PIVOT_Y);
		vec2 d0 = p - pivot;
		if (abs(d0.x) > 0.3) continue;

		vec4 rod = uRods[i];
		float t = float(i) / float(N - 1);
		float len = mix(0.60, 0.20, t);
		// 下端を床のすぐ上のゆるい斜線に揃え、糸の長さで高さを調整する
		float botY = mix(-0.30, -0.25, t) - PIVOT_Y;
		float topY = botY + len;
		float glow = rod.y;
		vec3 rc = rodColor(t);

		// 支点まわりに回転したローカル座標
		float s = sin(rod.x);
		float c = cos(rod.x);
		vec2 q = vec2(c * d0.x + s * d0.y, -s * d0.x + c * d0.y);

		// 吊り糸
		if (q.y > topY) {
			col += vec3(0.05, 0.06, 0.08) * smoothstep(px * 1.2, 0.0, abs(q.x));
		}

		// ガラス棒（カプセル SDF）
		float cy = clamp(q.y, botY + RADIUS, topY - RADIUS);
		float dist = length(vec2(q.x, q.y - cy)) - RADIUS;
		float cov = smoothstep(px, -px, dist);
		if (cov > 0.0) {
			float nx = clamp(q.x / RADIUS, -1.0, 1.0);
			vec3 glass = col * 0.6 + vec3(0.035, 0.045, 0.06);
			glass += vec3(0.55, 0.65, 0.75) * pow(abs(nx), 8.0) * 0.5; // 縁の反射
			glass += vec3(0.9, 0.95, 1.0) * exp(-pow((nx + 0.45) / 0.14, 2.0)) * 0.3; // ハイライト
			float shimmer = 0.75 + 0.25 * sin(q.y * 140.0 - uTime * 24.0 + rod.z);
			glass += rc * glow * (1.0 - 0.6 * nx * nx) * 1.8 * shimmer; // 内部発光
			glass += vec3(1.0) * glow * glow * exp(-pow(nx / 0.25, 2.0)) * 0.8; // ホットコア
			col = mix(col, glass, cov);
		}

		// ブルーム
		float od = max(dist, 0.0);
		bloom += rc * glow * (exp(-od * 90.0) * 0.45 + exp(-od * 18.0) * 0.18);

		// 共鳴時に広がる光の波紋
		vec2 center = vec2(0.0, (topY + botY) * 0.5);
		float rd = length((q - center) * vec2(1.0, 0.55));
		bloom += rc * glow * glow * exp(-rd * 9.0) * (0.5 + 0.5 * sin(rd * 70.0 - uTime * 6.0)) * 0.05;
	}
	return col + bloom;
}

void main() {
	vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
	float px = 1.0 / uResolution.y;
	vec3 col;

	if (p.y >= FLOOR_Y) {
		col = scene(p, px);
		col += vec3(0.04, 0.06, 0.10) * exp(-(p.y - FLOOR_Y) * 40.0) * (0.3 + uLevel);
	} else {
		// 光沢のある黒い床への映り込み
		float depth = FLOOR_Y - p.y;
		vec2 rp = vec2(p.x, 2.0 * FLOOR_Y - p.y);
		rp.x += sin(p.y * 120.0 + uTime * 1.2) * 0.004 * depth;
		rp.x += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * depth * 0.003;
		vec3 refl = scene(rp, px * (1.0 + depth * 3.0));
		col = vec3(0.004, 0.005, 0.010) + refl * exp(-depth * 4.0) * 0.6;
		col += vec3(0.04, 0.06, 0.10) * exp(-depth * 60.0) * 0.5;
	}

	col *= 1.0 - 0.35 * dot(p, p);
	col = 1.0 - exp(-col * 1.4);
	col = pow(col, vec3(0.92));
	gl_FragColor = vec4(col, 1.0);
}
`

class ResonantChimesSketch extends Sketch {
	gl: WebGLRenderingContext | null
	glProgram: WebGLProgram | null
	posBuffer: WebGLBuffer | null
	uResolutionLoc: WebGLUniformLocation | null
	uTimeLoc: WebGLUniformLocation | null
	uSpacingLoc: WebGLUniformLocation | null
	uLevelLoc: WebGLUniformLocation | null
	uRodsLoc: WebGLUniformLocation | null
	rods: Rod[]
	rodData: Float32Array
	drives: Float32Array
	time: number
	level: number

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true,
		})
		this.gl = null
		this.glProgram = null
		this.posBuffer = null
		this.uResolutionLoc = null
		this.uTimeLoc = null
		this.uSpacingLoc = null
		this.uLevelLoc = null
		this.uRodsLoc = null
		this.rods = []
		this.rodData = new Float32Array(ROD_COUNT * 4)
		this.drives = new Float32Array(ROD_COUNT)
		this.time = 0
		this.level = 0
	}

	setup(): void {
		if (this.p && (this.p as any).pixelDensity) {
			this.p.pixelDensity(1)
		}
		super.setup()
		if (!this.p) return
		this.p.noStroke()

		this.initRods()
		this.initShader()
	}

	initRods(): void {
		for (let i = 0; i < ROD_COUNT; i++) {
			const t = i / (ROD_COUNT - 1)
			this.rods.push({
				freq: F_MIN * Math.pow(F_MAX / F_MIN, t),
				// 長い棒ほどゆっくり揺れる
				omega: Math.PI * 2 * (0.55 + 0.9 * t),
				angle: 0,
				velocity: 0,
				envelope: 0,
				shimmer: Math.random() * Math.PI * 2,
			})
		}
	}

	initShader(): void {
		try {
			const gl = (this.p as any).drawingContext as WebGLRenderingContext
			this.gl = gl

			const vs = this.compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
			const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)

			const prog = gl.createProgram()!
			gl.attachShader(prog, vs)
			gl.attachShader(prog, fs)
			gl.bindAttribLocation(prog, 0, 'aPosition')
			gl.linkProgram(prog)
			if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
				console.error('Shader Link Error:', gl.getProgramInfoLog(prog))
			}
			this.glProgram = prog

			// 画面全体を覆う 1 枚の三角形
			this.posBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]),
				gl.STATIC_DRAW
			)

			this.uResolutionLoc = gl.getUniformLocation(prog, 'uResolution')
			this.uTimeLoc = gl.getUniformLocation(prog, 'uTime')
			this.uSpacingLoc = gl.getUniformLocation(prog, 'uSpacing')
			this.uLevelLoc = gl.getUniformLocation(prog, 'uLevel')
			this.uRodsLoc = gl.getUniformLocation(prog, 'uRods[0]')
		} catch (e) {
			console.warn('WebGL setup failed', e)
		}
	}

	compileShader(
		gl: WebGLRenderingContext,
		type: number,
		src: string
	): WebGLShader {
		const shader = gl.createShader(type)!
		gl.shaderSource(shader, src)
		gl.compileShader(shader)
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('Shader Compile Error:', gl.getShaderInfoLog(shader))
		}
		return shader
	}

	/**
	 * FFT スペクトルから各棒の駆動力 (0〜1) を算出する。
	 * 全体平均より突出した帯域だけを通すことで「共鳴の選択性」を表現。
	 */
	updateDrives(): void {
		const fft = this.audioAnalyzer ? this.audioAnalyzer.fft : null
		if (!fft) {
			this.drives.fill(0)
			return
		}

		const spectrum: number[] = fft.analyze()
		const sampleRate: number =
			typeof (this.p as any).sampleRate === 'function'
				? (this.p as any).sampleRate()
				: 44100
		const binWidth = sampleRate / 2 / spectrum.length

		// 周波数 f の値を線形補間で取得（低域のビン解像度不足を補う）
		const sample = (f: number): number => {
			const pos = f / binWidth
			const i0 = Math.floor(pos)
			const i1 = Math.min(i0 + 1, spectrum.length - 1)
			const frac = pos - i0
			return spectrum[i0] * (1 - frac) + spectrum[i1] * frac
		}

		let sum = 0
		for (let i = 0; i < ROD_COUNT; i++) {
			const e = sample(this.rods[i].freq)
			this.drives[i] = e
			sum += e
		}
		const threshold = Math.max(NOISE_GATE, (sum / ROD_COUNT) * SELECTIVITY)

		for (let i = 0; i < ROD_COUNT; i++) {
			const d = Math.min(Math.max((this.drives[i] - threshold) / DRIVE_RANGE, 0), 1)
			this.drives[i] = Math.pow(d, 1.3)
		}
	}

	/**
	 * 強制振動つき減衰振動子:
	 *   θ'' = -ω²θ - 2ζωθ' + A·drive·cos(ωt) + breeze
	 * 固有振動数で駆動するため、音が続くほど振幅が成長する。
	 */
	updatePhysics(dt: number): void {
		const SUB_STEPS = 2
		const h = dt / SUB_STEPS

		for (let s = 0; s < SUB_STEPS; s++) {
			this.time += h
			for (let i = 0; i < ROD_COUNT; i++) {
				const rod = this.rods[i]
				const w = rod.omega
				const w2 = w * w
				const force = TARGET_AMP * 2 * DAMPING * w2 * this.drives[i]
				const breeze = (this.p.noise(i * 0.15, this.time * 0.25) - 0.5) * w2 * BREEZE

				const acc =
					-w2 * rod.angle -
					2 * DAMPING * w * rod.velocity +
					force * Math.cos(w * this.time) +
					breeze
				rod.velocity += acc * h
				rod.angle += rod.velocity * h
			}
		}

		// 発光エンベロープ（速いアタック・遅いリリースで余韻を残す）
		for (let i = 0; i < ROD_COUNT; i++) {
			const rod = this.rods[i]
			const target = this.drives[i]
			const k = target > rod.envelope ? 0.35 : 0.025
			rod.envelope += (target - rod.envelope) * k
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		const dt = Math.min(this.p.deltaTime / 1000, 1 / 20)

		this.updateDrives()
		this.updatePhysics(dt)

		const vol = this.getVolume()
		this.level += (Math.min(vol * 4, 1) - this.level) * 0.1

		for (let i = 0; i < ROD_COUNT; i++) {
			const rod = this.rods[i]
			// 見た目上は振れ幅をソフトクリップして隣の棒との重なりを抑える
			const angle = MAX_ANGLE * Math.tanh(rod.angle / MAX_ANGLE)
			const swing = Math.abs(rod.angle) / TARGET_AMP
			const glow = Math.min(IDLE_GLOW + rod.envelope + swing * 0.5, 1.5)
			this.rodData[i * 4] = angle
			this.rodData[i * 4 + 1] = glow
			this.rodData[i * 4 + 2] = rod.shimmer
			this.rodData[i * 4 + 3] = 0
		}

		if (!this.gl || !this.glProgram || !this.posBuffer) return
		const gl = this.gl

		gl.useProgram(this.glProgram)
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
		gl.enableVertexAttribArray(0)
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

		const aspect = this.p.width / this.p.height
		const spacing = (aspect * 0.86) / (ROD_COUNT - 1)

		gl.uniform2f(this.uResolutionLoc, gl.drawingBufferWidth, gl.drawingBufferHeight)
		gl.uniform1f(this.uTimeLoc, this.p.millis() / 1000)
		gl.uniform1f(this.uSpacingLoc, spacing)
		gl.uniform1f(this.uLevelLoc, this.level)
		gl.uniform4fv(this.uRodsLoc, this.rodData)

		gl.drawArrays(gl.TRIANGLES, 0, 3)

		gl.disableVertexAttribArray(0)
		gl.bindBuffer(gl.ARRAY_BUFFER, null)
	}
}

export default function (): void {
	const sketch: ResonantChimesSketch = new ResonantChimesSketch()
	sketch.init()
}
