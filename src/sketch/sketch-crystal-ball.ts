'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	t: number
	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true,
		})
		// initialize
		this.t = 0
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()
		this.p.background(0)
		this.p.noStroke()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.clear() // 背景をクリア
		this.t += 2 // 時間を進める

		let w = this.p.max(this.p.width, this.p.height) // キャンバスの短い方の長さを変数wに代入
		let count = this.p.int((w * 2) / 4) // オブジェクトの数を決定

		// 周波数データの取得
		// 周波数帯域ごとのボリュームを取得
		const freqData = this.audioAnalyzer?.getVolumeEachBand() || []

		for (let i = 0; i < count; i++) {
			// オブジェクトの数だけ繰り返す
			let n = this.p.noise(i - this.t) // ノイズ値を取得（時間とインデックスに基づく）
			let d = n * this.p.PI * 4 // ノイズ値を角度に変換

			let x = this.p.cos(d) * i // X座標を計算（円形に配置）
			let y = this.p.sin(d) * i // Y座標を計算（円形に配置）

			this.p.push() // 現在の描画スタイルと変換を保存

			// 周波数データを色にマッピング
			const freqIndex = Math.floor(
				this.p.map(i, 0, count, 0, freqData.length)
			)
			const frequency = freqData[freqIndex] || 0
			const r = this.p.map(frequency, 0, 255, 0, 255)
			const g = this.p.map(this.p.sin(d), -1, 1, 0, 255)
			const b = this.p.map(this.p.cos(d), -1, 1, 0, 255)

			this.p.fill(r, g, b) // 周波数に基づいた色を設定
			this.p.translate(x, y) // オブジェクトの位置を設定
			this.p.torus(w / 6, 10) // トーラスを描画（ドーナツ型の形）
			this.p.pop() // 保存したスタイルと変換を復元
		}
	}

	mousePressed(): void {
		super.mousePressed()
	}

	keyTyped(): void {
		super.keyTyped()
	}

	keyPressed(): void {
		super.keyPressed()
	}

	doubleClicked(): void {
		super.doubleClicked()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
