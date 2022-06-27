'use strict'
import Sketch from '@/class/Sketch.js'

// variables
let a = 0
let r = 0
const conchoid = (s, a) => {
	s.beginShape()
	for(let i = 0; i< 356; i++){
		s.y = s.width / 60 * (1 / s.cos(i) + a * s.cos(i)) * s.cos(i)
		s.x = s.width / 60 * (1 / s.cos(i) + a * s.cos(i)) * s.sin(i)
		s.vertex(s.x, s.y)
	}
	s.endShape()
	s.rotate(r)
	r++
}

class SketchTest extends Sketch {
	preload (s) {
		super.preload(s)
	}

	setup (s) {
		super.setup(s)

		s.background(0)
		s.stroke(255)
		s.noFill()
		s.strokeWeight(0.05)
	}

	draw (s) {
		super.draw(s)

		s.background(0)
		s.translate(s.width * 0.5, s.height * 0.5)
		for(let i = -3; i <= 3; i++){
			conchoid(s, a + i)
			conchoid(s, a + i)
		}
		a = 100 * s.sin(s.frameCount / 360)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}