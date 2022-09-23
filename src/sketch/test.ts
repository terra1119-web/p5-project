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

		this.p.noFill()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.strokeWeight(this.p.random(1, 5))
		this.p.stroke(this.p.random(180, 250))
		this.p.circle(this.p.mouseX, this.p.mouseY, this.p.mouseX)
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