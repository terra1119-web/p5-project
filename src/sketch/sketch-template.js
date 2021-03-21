'use strict'
import Sketch from '@/class/Sketch.js'
import { CONSTANT } from '@/util/constant'

class SketchTest extends Sketch {
	setup (s) {
		super.setup()
	}

	draw (s) {
		super.draw()
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.start()
}