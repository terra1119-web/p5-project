'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class RaymarchingSketch extends Sketch {
	myShader: p5.Shader
	// 各帯域の値を滑らかにするための変数
	smoothedBass: number
	smoothedMid: number
	smoothedHigh: number

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: true,
			useMic: true,
		})
		this.smoothedBass = 0
		this.smoothedMid = 0
		this.smoothedHigh = 0
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()
		this.p.noStroke()

		// -----------------------------------------------------------
		// Vertex Shader
		// -----------------------------------------------------------
		const vertSrc = `
			attribute vec3 aPosition;
			attribute vec2 aTexCoord;
			varying vec2 vTexCoord;
			void main() {
				vTexCoord = aTexCoord;
				vec4 positionVec4 = vec4(aPosition, 1.0);
				positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
				gl_Position = positionVec4;
			}
		`

		// -----------------------------------------------------------
		// Fragment Shader (拡張版)
		// -----------------------------------------------------------
		const fragSrc = `
			precision mediump float;
			varying vec2 vTexCoord;

			uniform vec2 uResolution;
			uniform float uTime;

			// 3つの帯域のUniform変数
			uniform float uBass; // 低音
			uniform float uMid;  // 中音
			uniform float uHigh; // 高音

			mat2 rot(float a) {
				float s = sin(a);
				float c = cos(a);
				return mat2(c, -s, s, c);
			}

			float sdBox(vec3 p, vec3 b) {
				vec3 q = abs(p) - b;
				return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
			}

			float map(vec3 p) {
				// 【中音】: 空間のねじれ(Twist)に影響
				// メロディが流れると空間が強くねじれる
				float twistAmt = 0.1 + uMid * 0.3;
				p.xy *= rot(p.z * twistAmt);

				vec3 q = p;

				// 【高音】: 進行スピードに少し微振動を加える（ジッター）
				float speed = uTime * 2.0 + uHigh * 0.5;
				q.z = mod(p.z + speed, 2.0) - 1.0;
				q.xy = mod(p.xy, 4.0) - 2.0;

				// 【低音】: オブジェクトの太さに影響
				// キックが鳴ると太くなる
				float boxSize = 0.2 + uBass * 0.3;
				return sdBox(q, vec3(boxSize, boxSize, 1.0));
			}

			void main() {
				vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
				vec3 ro = vec3(0.0, 0.0, -3.0 + uTime * 2.0);
				vec3 rd = normalize(vec3(uv, 1.0));

				float t = 0.0;
				float d = 0.0;
				float glow = 0.0;

				for(int j = 0; j < 64; j++) {
					vec3 p = ro + rd * t;
					d = map(p);

					// グロー計算
					// 【高音】: 光の鋭さに影響 (高音が強いと遠くまで光る)
					float glowIntensity = 0.015 + uHigh * 0.02;
					glow += glowIntensity / (0.01 + abs(d));

					t += d;
					if(d < 0.001 || t > 100.0) break;
				}

				// 色のミキシング
				vec3 col = vec3(0.0);

				// ベースカラー（深い青紫）
				vec3 baseColor = vec3(0.1, 0.05, 0.3);

				// 【低音】: 赤/ピンク系のエネルギー
				vec3 bassColor = vec3(0.8, 0.1, 0.4) * uBass * 2.0;

				// 【中音】: シアン/緑系のエネルギー
				vec3 midColor  = vec3(0.1, 0.8, 0.7) * uMid * 2.0;

				// 【高音】: 白/黄色系の閃光
				vec3 highColor = vec3(0.9, 0.9, 0.5) * uHigh * 4.0;

				// 全ての色を合成してグローに乗せる
				col += (baseColor + bassColor + midColor + highColor) * glow * 0.5;

				// 距離減衰
				col *= 1.0 / (1.0 + t * t * 0.1);

				gl_FragColor = vec4(col, 1.0);
			}
		`

		this.myShader = this.p.createShader(vertSrc, fragSrc)
	}

	draw(): void {
		super.draw()
		if (!this.p || !this.myShader) return

		// 音声データの取得
		// [treble, highMid, mid, lowMid, bass]
		const bands = this.getVolumeEachBand()
		console.log(bands)

		// バンドルして扱いやすくする
		const rawHigh = (bands[0] + bands[1]) / 2 // 高音 (Treble + HighMid)
		const rawMid = bands[2] // 中音 (Mid)
		const rawBass = (bands[3] + bands[4]) / 2 // 低音 (LowMid + Bass)

		// 各帯域を正規化(0.0~1.0)してスムージング
		// 音域ごとに感度(mapの第3引数)を微調整しています

		// 低音は感度低めでOK（音が大きいため）
		const targetBass = this.p.map(rawBass, 0, 255, 0, 1.0)
		this.smoothedBass = this.p.lerp(this.smoothedBass, targetBass, 0.15)

		// 中音は少し感度を上げる
		const targetMid = this.p.map(rawMid, 0, 200, 0, 1.0)
		this.smoothedMid = this.p.lerp(this.smoothedMid, targetMid, 0.15)

		// 高音は音が小さいことが多いので感度を高く設定
		const targetHigh = this.p.map(rawHigh, 0, 150, 0, 1.0)
		this.smoothedHigh = this.p.lerp(this.smoothedHigh, targetHigh, 0.15)

		this.p.shader(this.myShader)

		// Uniform送信
		this.myShader.setUniform('uResolution', [this.p.width, this.p.height])
		this.myShader.setUniform('uTime', this.p.millis() / 1000.0)

		this.myShader.setUniform('uBass', this.smoothedBass)
		this.myShader.setUniform('uMid', this.smoothedMid)
		this.myShader.setUniform('uHigh', this.smoothedHigh)

		this.p.rect(0, 0, this.p.width, this.p.height)
	}

	// mousePressed(): void {
	// 	super.mousePressed()
	// 	this.p.userStartAudio()
	// }
}

export default function (): void {
	const sketch: RaymarchingSketch = new RaymarchingSketch()
	sketch.init()
}
