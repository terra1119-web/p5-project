'use strict'
import Sketch from '@/class/Sketch.js'

// variables
class SketchTest extends Sketch {
	preload (s) {
		super.preload(s)
	}

	setup (s) {
		super.setup(s)
	}

	draw (s) {
		super.draw(s)
	}

	mousePressed (s) {
		super.mousePressed(s)
	}

	keyTyped (s) {
		super.keyTyped(s)
	}

	keyPressed (s) {
		super.keyPressed(s)
	}

	doubleClicked (s) {
		super.doubleClicked(s)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}