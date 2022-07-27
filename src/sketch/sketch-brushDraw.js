'use strict'
import Sketch from '@/class/Sketch.js'

// variables
const imgs = []
const balls = []
const time_max = 8000
let img
let rand_arr = []
let temp_arr = []
let play_max
let play_count = 0
let time_count = 0
let alpha = 0

const image_name_array = [
	'001.jpg',
	'002.jpg',
	'003.jpg',
	'004.jpg',
	'005.jpg',
	'006.jpg',
	'007.jpg',
	'008.jpg',
	'009.jpg',
	'010.jpg',
	'011.jpg',
	'012.jpg',
]

class SketchTest extends Sketch {
	preload (s) {
		super.preload(s)

		image_name_array.forEach(image => {
			const img = s.loadImage(`images/brushDraw/${image}`)
			imgs.push(img)
		})
	}

	setup (s) {
		super.setup(s)

		s.background(0)
		s.textAlign(s.CENTER)

		play_max = image_name_array.length
		this.initArray()
		this.initImage()
	}

	draw (s) {
		super.draw(s)

		time_count ++
		if (time_max < time_count) {
			s.fill(0, alpha)
			s.rect(0, 0 , s.width, s.height);
			alpha += 1;
			if (alpha > 255) {
				play_count ++

				if (play_max <= play_count) {
					play_count = 0
					this.initArray()
				}
				time_count = 0

				alpha = 0
				this.clearScreen()
				this.initImage()
			}
		} else {
			for (let i = 0; i < balls.length; i++) {
				balls[i].draw()
				balls[i].update()
				balls[i].changeColour()
			}

			for (let i = 0; i < balls.length; i++) {
				if (balls[i].radius < 0){
					balls.splice(i, 1)
				}
			}

			const rnd = s.random(100)
			if(rnd > 30) return

			for (let i = 0; i < 5; i++) {
				const x = s.floor(s.random(s.width))
				const y = s.floor(s.random(s.height))
				balls.push(new Ball(x, y, s.color(img.get(x + s.random(2), y + s.random(2))), s, img))
			}
		}
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

	initArray () {
		let clone = [...imgs]
		rand_arr = new Array(clone.length)
		temp_arr = null
		let rand_num = 0
		for (let i = 0; i < rand_arr.length; i++) {
			temp_arr = new Array(1)
			rand_num = Math.floor(this.s.random(clone.length))

			temp_arr = this.s.subset(clone, rand_num, 1)
			rand_arr[i] = temp_arr[0]

			temp_arr = new Array(clone.length - 1)

			let count = 0
			for (let j = 0; j < clone.length; j++) {
				if (j != rand_num) {
					temp_arr[count] = clone[j]
					count += 1
				}
			}
			clone = temp_arr
		}
	}

	initImage () {
		img = null
		img = rand_arr[play_count]
		img.resize(this.s.width, this.s.height)
	}

	clearScreen() {
		this.s.background(0)
	}
}

class Ball {
	constructor (mX, mY, c, s, img) {
		this.s = s
		this.img = img
		this.location = this.s.createVector(mX, mY)
		this.radius = this.s.random(.01)
		this.r = this.s.red(c)
		this.g = this.s.green(c)
		this.b = this.s.blue(c)

		this.xOff = 0.0
		this.yOff = 0.0

		this.radiusLow
		this.radiusHigh

		this.rangeLow
		this.rangeHigh
	}

	update () {
		this.radius -= this.s.random(0.0001)

		this.xOff = this.xOff + this.s.random(-0.5, 0.5)
		this.nX = this.s.noise(this.location.x) * this.xOff

		this.yOff = this.yOff + this.s.random(-0.5, 0.5)
		this.nY = this.s.noise(this.location.y) * this.yOff

		this.location.x += this.nX
		this.location.y += this.nY
	}

	changeColour () {
		this.c = this.s.color(this.img.get(this.location.x, this.location.y))
		this.r = this.s.red(this.c)
		this.g = this.s.green(this.c)
		this.b = this.s.blue(this.c)
	}

	draw () {
		this.s.noStroke()
		this.s.stroke(this.r, this.g, this.b)
		this.s.ellipse(this.location.x, this.location.y, this.radius * 50, this.radius * 50)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}