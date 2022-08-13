'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// variables
	}

	preload() {
		super.preload()
	}

	setup() {
		super.setup()
	}

	draw() {
		super.draw()
		if (!this.p) return
	}

	mousePressed() {
		super.mousePressed()
	}

	keyTyped() {
		super.keyTyped()
	}

	keyPressed() {
		super.keyPressed()
	}

	doubleClicked() {
		super.doubleClicked()
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}