'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	j: number
	plus_j: number
	plus_radnt: number
	scolor: p5.Color
	ydiv: number
	xNumber: number
	yNumber: number
	num: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
		this.j = 0
		this.plus_j = 0
		this.plus_radnt = 0
		this.ydiv = 10000
		this.num = -1
	}

	setup(): void {
		super.setup()

		this.scolor = this.p.color(
			this.p.random(155, 255),
			this.p.random(155, 255),
			this.p.random(155, 255)
		)
		this.j = 2.3
		this.xNumber = this.p.width
		this.yNumber = this.p.height
		this.p.background(0)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.plus_radnt = this.p.lerp(
			this.plus_radnt,
			this.p.map(this.xNumber, 0, this.p.width, 0.00001, 0.000001),
			0.1
		)
		this.plus_j = this.p.lerp(
			this.plus_j,
			this.p.map(this.yNumber, 0, this.p.height, -0.00003, 0.00003),
			0.1
		)
		this.ydiv = this.p.lerp(
			this.ydiv,
			this.p.map(this.xNumber, 0, this.p.width, 1000, 1000000),
			0.1
		)
		this.p.fill(0, 15)
		this.p.noStroke()
		this.p.rect(0, 0, this.p.width, this.p.height)
		this.p.stroke(this.scolor)
		this.p.strokeWeight(this.p.height / 300)
		this.p.push()
		this.p.translate(this.p.width / 2, this.p.height / 2)
		let radnt = 0
		let ini = -this.p.width / 2
		this.j += this.plus_j
		for (let stp = ini; stp < 0; stp += 1) {
			radnt += this.plus_radnt
			let x = stp + stp * this.p.sin(radnt)
			if (this.j * x != this.p.HALF_PI) {
				let y = this.p.pow(x, 3) * this.p.tan(this.j * x)
				let x_for_canvas = x
				let y_for_canvas = y / this.ydiv
				this.p.point(x_for_canvas, y_for_canvas)
				this.p.point(-x_for_canvas, y_for_canvas)
			}
		}
		this.p.pop()

		this.xNumber += this.num
		if (this.xNumber > this.p.width || this.xNumber < 0) {
			this.num *= -1
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
