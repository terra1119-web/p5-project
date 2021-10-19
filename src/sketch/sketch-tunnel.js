'use strict'
import Sketch from '@/class/Sketch.js'

const numFigures = 100
let figureRadius
let figureSeparation

const nVertex = 3

let t = 0
const dt = 5

const rotSpeed = 0.002

let direction = 1 // 1 or -1
const pctToFade = 0.6

class SketchTest extends Sketch {
	setup(s) {
		super.setup()

		s.pixelDensity(s.displayDensity())
		if (s.width < s.height) {
			figureRadius = s.width * 0.25
			figureSeparation = s.width * 0.089
		} else {
			figureRadius = s.height * 0.25
			figureSeparation = s.height * 0.089
		}
		s.rectMode(s.CENTER)
		s.noFill()
		s.colorMode(s.HSB, 255, 255, 255, 255)
	}

	draw(s) {
		super.draw()

		s.background(0)
		s.rotate(-t / dt * rotSpeed)
		for (let i = 0; i < numFigures; i++) {
			s.stroke(255, s.map(i, numFigures * pctToFade, numFigures, 255, 0))
			s.push()
			s.translate(0, 0, -figureSeparation * i + t)
			s.rotate(s.PI / 60 * i)
			this.drawFigure(s)
			s.pop()
		}
		t += dt * direction
		if (t > figureSeparation * numFigures)
			direction = -1
		else if (t < 0)
			direction = 1
	}

	drawFigure (s) {
		s.beginShape()
		for (let i = 0; i < nVertex; i++) {
			const x = figureRadius * s.cos(s.TWO_PI / nVertex * i)
			const y = figureRadius * s.sin(s.TWO_PI / nVertex * i)
			s.vertex(x, y)
		}
		s.endShape(s.CLOSE)
	}
}

export default function () {
	const sketch = new SketchTest('WEBGL')
	sketch.init()
}