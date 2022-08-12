'use strict'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
	constructor () {
		super('WEBGL', false)
		// variables
	}

	preload () {
		super.preload()
	}

	setup () {
		super.setup()
	}

	draw () {
		super.draw()
	}

	mousePressed () {
		super.mousePressed()
	}

	keyTyped () {
		super.keyTyped()
	}

	keyPressed () {
		super.keyPressed()
	}

	doubleClicked () {
		super.doubleClicked()
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}