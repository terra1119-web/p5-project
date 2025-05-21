'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false,
		})
		// initialize
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()
	}

	draw(): void {
		super.draw()
		if (!this.p) return
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
