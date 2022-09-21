'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	unit: number
	theta: number
	frames: number
	num: number

	constructor() {
		super({})

		// initialize
		this.frames = 240
		this.num = 25
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.unit = this.p.width / this.num
		this.theta = 0
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.fill(0, 30)
		this.p.noStroke()
		this.p.rect(0, 0, this.p.width, this.p.height)
		this.p.fill(255)
		for (let y: number = 0; y <= this.num; y++) {
			for (let x: number = 0; x <= this.num; x++) {
				const distance: number = this.p.dist(this.p.width / 2, this.p.height / 2, x * this.unit, y * this.unit)
				const offSet: number = this.p.map(distance, 0, this.p.sqrt(this.p.sq(this.p.width / 2) + this.p.sq(this.p.height / 2)), 0, this.p.TWO_PI)
				const sz = this.p.map(this.p.sin(this.theta + offSet), -1, 1, this.unit * .2, this.unit * .1)
				const angle: number = this.p.atan2(y * this.unit - this.p.height / 2, x * this.unit - this.p.width / 2)
				this.p.push()
				this.p.translate(x * this.unit, y * this.unit)
				this.p.rotate(angle)
				const px: number = this.p.map(this.p.sin(this.theta + offSet), -1, 1, 0, 50)
				this.p.ellipse(px, 0, sz, sz)
				this.p.pop()
			}
		}
		// this.p.stroke(255)
		this.theta -= this.p.TWO_PI / this.frames
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}