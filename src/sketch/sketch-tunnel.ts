'use strict'
import Sketch from '@/class/Sketch'

class TunnelSketch extends Sketch {
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

	// Constants for magic numbers
	private readonly ROTATION_FACTOR: number = 60

	constructor(
		numFigures: number = 100,
		nVertex: number = 5,
		dt: number = 5,
		rotSpeed: number = 0.002,
		pctToFade: number = 0.6
	) {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true
		})
		// initialize
		this.numFigures = numFigures
		this.nVertex = nVertex
		this.t = 0
		this.dt = dt
		this.rotSpeed = rotSpeed
		this.direction = 1 // 1 or -1
		this.pctToFade = pctToFade
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
			this.p.rotate((this.p.PI / this.ROTATION_FACTOR) * i)
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
			const angle = (this.p.TWO_PI / this.nVertex) * i
			const x = this.figureRadius * this.p.cos(angle)
			const y = this.figureRadius * this.p.sin(angle)
			this.p.vertex(x, y)
		}
		this.p.endShape(this.p.CLOSE)
	}
}

export default function (): void {
	const sketch: TunnelSketch = new TunnelSketch()
	sketch.init()
}
