'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	f: number
	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false
		})
		// initialize
		this.f = 0
	}

	setup(): void {
		super.setup()

		this.p.noStroke()
	}

	draw(): void {
		super.draw()
		if (!this.p) return
		this.p.background(0)

		const h = 120
		const P = this.p.PI
		const i = P / 32
		for (let x = -P; x < P; x += i) {
			for (let z = -P; z < P; z += i) {
				this.p.push()
				let y = this.p.tan(
					this.p.width -
						this.p.mag(this.p.noise(x), this.p.noise(z)) * this.f
				)
				this.p.scale(0.75)
				this.p.translate(x * h, z * h, -y * h * 3)
				this.p.sphere(this.p.mag(this.p.noise(x), this.p.noise(z)) * 2)
				this.p.pop()
			}
		}
		this.f += i / 8

		// const frequency = this.p.map(this.p.mouseX, 0, this.p.width, 100, 1000)
		// const volume = this.p.map(this.p.mouseY, 0, this.p.height, 0, 0.5)

		// // 音声の再生
		// this.playSound(frequency, volume)
	}

	playSound(frequency: number, volume: number): void {
		const oscillator = new p5.Oscillator()
		oscillator.setType('sine') // 振幅の形状を指定
		oscillator.freq(frequency) // 周波数を設定
		oscillator.amp(volume) // 振幅を設定
		oscillator.start()
		oscillator.stop(0.1) // 0.1秒後に停止
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
