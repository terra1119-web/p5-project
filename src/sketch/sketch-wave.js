'use strict'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
	constructor () {
		super()
		// variables
		this.unit
		this.theta
		this.frames = 240
		this.num = 25
	}

	setup () {
		super.setup()

		this.p.background(0)
		this.unit = this.p.width / this.num
		this.theta = 0
	}

	draw () {
		super.draw()

		this.p.background(0)
		this.p.fill(0, 30)
		this.p.noStroke()
		this.p.rect(0, 0, this.p.width, this.p.height)
		this.p.fill(255)
		for (let y = 0; y <= this.num; y++) {
			for (let x = 0; x <= this.num; x++) {
				const distance = this.p.dist(this.p.width / 2, this.p.height / 2, x * this.unit, y * this.unit)
				const offSet = this.p.map(distance, 0, this.p.sqrt(this.p.sq(this.p.width / 2) + this.p.sq(this.p.height / 2)), 0, this.p.TWO_PI)
				const sz = this.p.map(this.p.sin(this.theta + offSet), -1, 1, this.unit * .2, this.unit * .1)
				const angle = this.p.atan2(y * this.unit - this.p.height / 2, x * this.unit - this.p.width / 2)
				this.p.push()
				this.p.translate(x * this.unit, y * this.unit)
				this.p.rotate(angle)
				const px = this.p.map(this.p.sin(this.theta + offSet), -1, 1, 0, 50)
				this.p.ellipse(px, 0, sz, sz)
				this.p.pop()
			}
		}
		// this.p.stroke(255)
		this.theta -= this.p.TWO_PI / this.frames
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}
