'use strict'
import Sketch from '@/class/Sketch'
import Microphone from '@/class/Microphone'

class SketchTest extends Sketch {
	// property
	cols: number
	rows: number
	scl: number
	flying: number
	terrain: number[][]
	speed: number

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: true
		})
		// initialize
		this.scl = 16
		this.flying = 0
		this.terrain = []
		this.speed = 0.01
	}

	setup(): void {
		super.setup()

		this.p.strokeWeight(0.3)
		this.p.stroke(255)
		this.p.noFill()

		this.cols = this.p.width / this.scl
		this.rows = this.p.height / this.scl

		for (let x: number = 0; x < this.cols; x++) {
			this.terrain[x] = []
			for (let y: number = 0; y < this.rows; y++) {
				this.terrain[x][y] = 0
			}
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		Microphone.getAudio()
		// this.speed = Microphone.getVolume * 0.001

		this.flying -= this.speed
		let yoff = this.flying
		for (let y = 0; y < this.rows; y++) {
			let xoff = 0
			for (let x = 0; x < this.cols; x++) {
				this.terrain[x][y] = this.p.map(
					this.p.noise(xoff, yoff),
					0,
					1,
					-100,
					Microphone.getVolume
				)
				xoff += 0.1
			}
			yoff += 0.1
		}

		this.p.background(0)

		this.p.push()
		this.p.translate(0, 0)
		this.p.rotateX(this.p.PI / 4)

		for (let y = 0; y < this.rows - 1; y++) {
			this.p.beginShape(this.p.TRIANGLE_STRIP)
			for (let x = 0; x < this.cols; x++) {
				this.p.vertex(x * this.scl, y * this.scl, this.terrain[x][y])
				this.p.vertex(
					x * this.scl,
					(y + 1) * this.scl,
					this.terrain[x][y + 1]
				)
			}
			this.p.endShape()
		}
		this.p.pop()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
