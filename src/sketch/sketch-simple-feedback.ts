'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.background(0)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		let g = this.p.get()
		this.p.image(g, 0, 0, this.p.width, this.p.height * 0.99)
		this.p.noFill()
		this.p.stroke(250)
		this.p.beginShape()
		for (let a = 0; a < this.p.TAU; a += this.p.TAU / 200) {
			let r =
				this.p.noise(
					this.p.sin(a),
					this.p.cos(a),
					this.p.frameCount / 100
				) *
				this.p.height *
				0.333
			this.p.vertex(
				this.p.width / 2 +
					(this.p.sin(this.p.frameCount / 100) * this.p.width) / 5 +
					this.p.sin(a) * r,
				this.p.height * 0.666 + this.p.cos(a) * r
			)
		}

		this.p.endShape()
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
