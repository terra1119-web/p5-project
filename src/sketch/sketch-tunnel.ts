'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	numFigures: number
	figureRadius: number
	figureSeparation: number
	nVertex: number
	t: number
	dt: number
	rotSpeed: number
	direction: number
	pctToFade: number

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true
		})
		// initialize
		this.numFigures = 100
		this.nVertex = 5
		this.t = 0
		this.dt = 5
		this.rotSpeed = 0.002
		this.direction = 1 // 1 or -1
		this.pctToFade = 0.6
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(this.p.displayDensity())
		if (this.p.width < this.p.height) {
			this.figureRadius = this.p.width * 0.25
			this.figureSeparation = this.p.width * 0.089
		} else {
			this.figureRadius = this.p.height * 0.25
			this.figureSeparation = this.p.height * 0.089
		}
		this.p.rectMode(this.p.CENTER)
		this.p.noFill()
		this.p.colorMode(this.p.HSB, 255, 255, 255, 255)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.rotate((-this.t / this.dt) * this.rotSpeed)
		for (let i: number = 0; i < this.numFigures; i++) {
			this.p.stroke(
				255,
				this.p.map(
					i,
					this.numFigures * this.pctToFade,
					this.numFigures,
					255,
					0
				)
			)
			this.p.push()
			this.p.translate(0, 0, -this.figureSeparation * i + this.t)
			this.p.rotate((this.p.PI / 60) * i)
			this.drawFigure()
			this.p.pop()
		}
		this.t += this.dt * this.direction
		if (this.t > this.figureSeparation * this.numFigures)
			this.direction = -1
		else if (this.t < 0) this.direction = 1
	}

	drawFigure(): void {
		this.p.beginShape()
		for (let i: number = 0; i < this.nVertex; i++) {
			const x =
				this.figureRadius *
				this.p.cos((this.p.TWO_PI / this.nVertex) * i)
			const y =
				this.figureRadius *
				this.p.sin((this.p.TWO_PI / this.nVertex) * i)
			this.p.vertex(x, y)
		}
		this.p.endShape(this.p.CLOSE)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
