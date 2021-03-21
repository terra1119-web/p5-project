'use strict'
import Sketch from '@/class/Sketch.js'
import { CONSTANT } from '@/util/constant'

let x = 0,
	y = 0,
	toX = 0,
	toY = 0
let stepSize = 5.0
const letters = 'Hallo Welt, ich kann gerade nicht... vielleicht morgen?'
const fontSizeMin = 3
let angleDistortion = 0.0
let counter = 0
let pointCount = 0

class SketchTest extends Sketch {
	setup (s) {
		super.setup()

		s.background(0)
		s.smooth()
		s.cursor(s.CROSS)

		x = s.random(s.width)
		y = s.random(s.height)

		s.textAlign(s.LEFT)
		s.fill(255)

		toX = s.random(s.width)
		toY = s.random(s.height)
	}

	draw (s) {
		super.draw()

		pointCount++
		if (pointCount > 10) {
			this.initPoint(s)
			pointCount = 0
		}
		s.fill(s.random(255))

		let d = s.dist(x, y, toX, toY)

		s.textFont('Georgia')
		s.textSize(fontSizeMin + d / 2)
		const newLetter = letters.charAt(counter)
		stepSize = s.textWidth(newLetter)

		if (d > stepSize) {
			const angle = s.atan2(toY - y, toX - x)

			s.push()
			s.translate(x, y)
			s.rotate(angle + s.random(angleDistortion))
			s.text(newLetter, 0, 0)
			s.pop()

			counter++
			if (counter > letters.length - 1) counter = 0

			x = x + s.cos(angle) * stepSize
			y = y + s.sin(angle) * stepSize
		}
	}

	mousePressed (s) {
		super.mousePressed()
		x = s.mouseX
		y = s.mouseY
	}

	keyTyped (s) {
		super.keyTyped()
		if (key == 's' || key == 'S') s.save('P_2_3_3_01.png')
	}

	keyPressed (s) {
		super.keyPressed()
		// angleDistortion ctrls arrowkeys up/down
		if (s.keyCode == s.DELETE || s.keyCode == s.BACKSPACE) s.background(255)
		if (s.keyCode == s.UP_ARROW) angleDistortion += 0.1
		if (s.keyCode == s.DOWN_ARROW) angleDistortion -= 0.1
	}

	doubleClicked (s) {
		super.doubleClicked()
		s.remove()
	}

	initPoint(s) {
		toX = s.random(s.width)
		toY = s.random(s.height)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}
