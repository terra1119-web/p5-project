'use strict'
import Sketch from '@/class/Sketch.js'

// variables
let unit, theta
const frames = 240
const num = 25

class SketchTest extends Sketch {
	preload(s) {
		super.preload(s)
	}

	setup(s) {
		super.setup(s)

		s.background(0)
		unit = s.width / num
		theta = 0
	}

	draw(s) {
		super.draw(s)
		s.background(0)

		s.fill(0, 30)
		s.noStroke()
		s.rect(0, 0, s.width, s.height)
		s.fill(255)
		for (let y = 0; y <= num; y++) {
			for (let x = 0; x <= num; x++) {
				const distance = s.dist(s.width / 2, s.height / 2, x * unit, y * unit)
				const offSet = s.map(distance, 0, s.sqrt(s.sq(s.width / 2) + s.sq(s.height / 2)), 0, s.TWO_PI)
				const sz = s.map(s.sin(theta + offSet), -1, 1, unit * .2, unit * .1)
				const angle = s.atan2(y * unit - s.height / 2, x * unit - s.width / 2)
				s.push()
				s.translate(x * unit, y * unit)
				s.rotate(angle)
				const px = s.map(s.sin(theta + offSet), -1, 1, 0, 50)
				s.ellipse(px, 0, sz, sz)
				s.pop()
			}
		}
		s.stroke(255)
		theta -= s.TWO_PI / frames
	}

	mousePressed(s) {
		super.mousePressed(s)
	}

	keyTyped(s) {
		super.keyTyped(s)
	}

	keyPressed(s) {
		super.keyPressed(s)
	}

	doubleClicked(s) {
		super.doubleClicked(s)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}
