'use strict'
import Sketch from '@/class/Sketch'
import { vert, frag } from '@/assets/shader/shader-acoustic-kaleidoscope.js'
import p5 from 'p5'

class SketchAcousticKaleidoscope extends Sketch {
	shader: p5.Shader
	angle: number
	complexity: number

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: true,
			useMic: true, // マイク入力を有効化
		})
		this.angle = 0
		this.complexity = 1
	}

	preload(): void {
		super.preload()
		// シェーダーファイルの読み込み
	}

	setup(): void {
		super.setup()
		this.p.noStroke()
		this.p.colorMode(this.p.HSB)

		this.shader = this.p.createShader(vert, frag)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		// 音声解析データの取得
		const volume = this.getVolume()
		const hue = this.getHue()
		const bands = this.getVolumeEachBand()

		// 複雑さの更新（中域の音量に基づく）
		this.complexity = this.p.map(bands[2], 0, 255, 1, 8)

		// 回転速度を音量に連動
		this.angle += volume * 0.1

		// パターンの描画
		this.p.push()
		this.p.background(0, 10)
		this.p.translate(0, 0, 0)
		this.p.rotate(this.angle)

		// 幾何学パターンの描画
		for (let i = 0; i < this.complexity * 8; i++) {
			const radius = 100 + i * 20
			const saturation = this.p.map(bands[1], 0, 255, 30, 100)
			const brightness = this.p.map(volume, 0, 1, 30, 100)
			this.p.fill(hue % 360, saturation, brightness)
			this.p.rotate(this.p.TWO_PI / (this.complexity * 8))
			this.drawShape(radius * volume)
		}
		this.p.pop()

		// シェーダーの適用
		this.shader.setUniform('time', this.p.frameCount * 0.01)
		this.shader.setUniform('segments', Math.floor(this.complexity * 3))
		this.p.shader(this.shader)
		this.p.rect(
			-this.p.width / 2,
			-this.p.height / 2,
			this.p.width,
			this.p.height
		)
	}

	drawShape(radius: number): void {
		const points = Math.floor(this.complexity * 3)
		this.p.beginShape()
		for (let i = 0; i < points; i++) {
			const angle = (this.p.TWO_PI * i) / points
			const x = this.p.cos(angle) * radius
			const y = this.p.sin(angle) * radius
			this.p.vertex(x, y)
		}
		this.p.endShape(this.p.CLOSE)
	}

	dispose(): void {
		super.dispose()
	}
}

export default function (): void {
	const sketch = new SketchAcousticKaleidoscope()
	sketch.init()
}
