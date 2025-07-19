import Sketch from '@/class/Sketch'
import type p5 from 'p5'

class CrystalWaveSketch extends Sketch {
	private crystalShader!: p5.Shader
	private time: number
	private growth: number
	private freqBands: number[]
	private bassWeight: number
	private trebleWeight: number

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true, // 音声入力を有効化
		})

		this.time = 0
		this.growth = 0
		this.freqBands = new Array(8).fill(0)
		this.bassWeight = 0
		this.trebleWeight = 0
	}

	preload(): void {
		super.preload()
		// シェーダーを読み込む
		this.crystalShader = this.p.createShader(
			this.vertShader(),
			this.crystalFrag()
		)
	}

	private vertShader(): string {
		return `
			precision highp float;

			attribute vec3 aPosition;
			attribute vec2 aTexCoord;

			varying vec2 vTexCoord;

			void main() {
				vTexCoord = aTexCoord;
				vec4 positionVec4 = vec4(aPosition, 1.0);
				gl_Position = positionVec4;
			}
		`
	}

	setup(): void {
		super.setup()
		if (!this.p) return

		// WebGL設定
		this.p.noStroke()
		this.p.pixelDensity(1)

		// シェーダーを作成
		this.crystalShader = this.p.createShader(
			this.vertShader(),
			this.crystalFrag()
		)
	}

	private updateShaderUniforms(): void {
		if (!this.crystalShader) return

		this.crystalShader.setUniform('uTime', this.time)
		this.crystalShader.setUniform('uResolution', [
			this.p.width,
			this.p.height,
		])
		this.crystalShader.setUniform('uBassWeight', this.bassWeight)
		this.crystalShader.setUniform('uTrebleWeight', this.trebleWeight)
		this.crystalShader.setUniform('uGrowth', this.growth)
		this.crystalShader.setUniform('uFreqBands', this.freqBands)
	}

	private updateAudioParameters(): void {
		const freqData = this.audioAnalyzer?.getVolumeEachBand() || []
		this.freqBands = freqData

		// 低音と高音の重みを更新
		this.bassWeight = this.p.lerp(
			this.bassWeight,
			(freqData[0] || 0) * 3.0,
			0.1
		)
		this.trebleWeight = this.p.lerp(
			this.trebleWeight,
			(freqData[7] || 0) * 3.0,
			0.1
		)

		// 成長度を音量に応じて更新
		const volume = this.audioAnalyzer?.getVolume() || 0
		this.growth = this.p.lerp(this.growth, Math.max(0.5, volume * 3), 0.05)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		// オーディオパラメータを更新
		this.updateAudioParameters()

		// キャンバスをクリア
		this.p.clear()

		// シェーダーを適用
		this.p.shader(this.crystalShader)

		// シェーダーのユニフォーム変数を更新
		this.updateShaderUniforms()

		// 全画面を覆う四角形を描画
		this.p.quad(-1, -1, 1, -1, 1, 1, -1, 1)

		// アニメーション時間を更新
		this.time += 0.01
	}

	private crystalFrag(): string {
		return `
      precision highp float;

      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uBassWeight;
      uniform float uTrebleWeight;
      uniform float uGrowth;
      uniform float uFreqBands[8];

      varying vec2 vTexCoord;

      // 3D Simplex Noise
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // 色相から RGB への変換
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // 周波数に応じた色の生成（虹色ベースに音声の影響を加える）
      vec3 freqColor(float t, float bass, float mid, float treble) {
        // 基本の虹色パターン（時間に基づく）
        float baseHue = t;

        // 周波数による色相のシフト（より控えめに）
        float freqShift = (bass * 0.1 + mid * 0.05 + treble * 0.075) * 0.3;
        float hue = mod(baseHue + freqShift, 1.0);

        // 彩度: 基本を高めに設定し、音量で微調整
        float saturation = mix(0.8, 1.0, max(max(bass, mid), treble));

        // 明度: 音量による変化を抑えめに
        float brightness = mix(0.9, 1.0, (bass + mid + treble) / 3.0 * 0.3);

        return hsv2rgb(vec3(hue, saturation, brightness));
      }

      void main() {
        // 中心を0,0にした座標系に変換
        vec2 p = vTexCoord * 2.0 - 1.0;
        p.x *= uResolution.x/uResolution.y;  // アスペクト比を補正

        // 中心からの距離を計算
        float dist = length(p);

        // 基本的なクリスタルの形状
        float crystal = 1.0 - smoothstep(0.0, 1.0, dist);
        crystal = pow(crystal, 2.0); // よりシャープな形状に

        // 基本的なノイズによる変形
        float baseNoise = snoise(vec3(p * 2.0, uTime)) * 0.1;

        // 周波数依存のノイズ
        float bassNoise = snoise(vec3(p * 1.5, uTime * 0.3)) * uBassWeight * 0.15;
        float trebleNoise = snoise(vec3(p * 3.0, uTime * 0.4)) * uTrebleWeight * 0.1;

        // 変形を組み合わせる
        crystal += baseNoise + bassNoise + trebleNoise;
        crystal *= mix(1.0, uGrowth, 0.7); // 全体的な大きさを調整

        // 周波数帯域の平均を計算
        float bassAvg = (uFreqBands[0] + uFreqBands[1]) / 2.0;    // 低音域
        float midAvg = (uFreqBands[3] + uFreqBands[4]) / 2.0;     // 中音域
        float trebleAvg = (uFreqBands[6] + uFreqBands[7]) / 2.0;  // 高音域

        // 各帯域の強さを正規化
        bassAvg = smoothstep(0.0, 1.0, bassAvg);
        midAvg = smoothstep(0.0, 1.0, midAvg);
        trebleAvg = smoothstep(0.0, 1.0, trebleAvg);

        // クリスタルのパターンと時間に基づく色の生成
        float colorTime = fract(crystal * 2.0 + uTime * 0.05);
        vec3 color = freqColor(colorTime, bassAvg, midAvg, trebleAvg);

        // エッジの強調（より繊細に）
        float edge = smoothstep(0.0, 0.15, crystal) * (1.0 - smoothstep(0.2, 0.4, crystal));
        vec3 edgeColor = mix(color, vec3(1.0), 0.8); // エッジをより明るく
        color = mix(color, edgeColor, edge * 0.7);

        // 外側をフェードアウト
        float alpha = smoothstep(1.0, 0.0, dist);

        gl_FragColor = vec4(color * alpha, alpha);
      }
    `
	}
}

export default (): void => {
	const sketch: CrystalWaveSketch = new CrystalWaveSketch()
	sketch.init()
}
