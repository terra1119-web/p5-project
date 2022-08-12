'use strict'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
	constructor () {
		super()
		// variables
		this.a = 0
		this.r = 0
	}

	setup () {
		super.setup()

		this.p.background(0)
		this.p.stroke(255)
		this.p.noFill()
		this.p.strokeWeight(0.05)
	}

	draw () {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.translate(this.p.width * 0.5, this.p.height * 0.5)
		for(let i = -3; i <= 3; i++){
			this.conchoid(this.a + i)
			this.conchoid(this.a + i)
		}
		this.a = 100 * this.p.sin(this.p.frameCount / 360)
	}

	conchoid (a) {
		this.p.beginShape()
		for(let i = 0; i< 356; i++){
			this.p.y = this.p.width / 60 * (1 / this.p.cos(i) + a * this.p.cos(i)) * this.p.cos(i)
			this.p.x = this.p.width / 60 * (1 / this.p.cos(i) + a * this.p.cos(i)) * this.p.sin(i)
			this.p.vertex(this.p.x, this.p.y)
		}
		this.p.endShape()
		this.p.rotate(this.r)
		this.r++
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}