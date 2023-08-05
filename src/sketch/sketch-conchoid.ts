'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	a: number
	r: number

	constructor() {
		super({})
		// initialize
		this.a = 0
		this.r = 0
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.stroke(255)
		this.p.noFill()
		this.p.strokeWeight(0.05)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.translate(this.p.width * 0.5, this.p.height * 0.5)
		for (let i: number = -3; i <= 3; i++) {
			this.p.stroke(255, 255, 255, 100)
			this.conchoid(this.a + i)
			this.conchoid(this.a + i)
		}
		this.a = 100 * this.p.sin(this.p.frameCount / 360)

		for (let i: number = -2; i <= 2; i++) {
			this.conchoid(this.a + i)
		}

		const volume: number = this.mic.getLevel() * 1000
		this.a = 100 * this.p.sin(volume / 360)
		this.conchoid(this.a)
	}

	conchoid(a: number): void {
		this.p.beginShape()
		for (let i: number = 0; i < 360; i++) {
			const y: number =
				(this.p.width / 60) *
				(1 / this.p.cos(i) + a * this.p.cos(i)) *
				this.p.cos(i)
			const x: number =
				(this.p.width / 60) *
				(1 / this.p.cos(i) + a * this.p.cos(i)) *
				this.p.sin(i)
			this.p.vertex(x, y)
		}
		this.p.endShape()
		this.p.rotate(this.r)
		this.r++
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
