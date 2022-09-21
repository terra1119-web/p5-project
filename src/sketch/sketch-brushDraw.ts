'use strict'
import Sketch from '@/class/Sketch'
import { Color } from 'p5'

class SketchTest extends Sketch {
	// property
	imgs: p5.Image[]
	balls: Ball[]
	time_max: number
	img: p5.Image
	rand_arr: p5.Image[]
	temp_arr: p5.Image[]
	play_max: number
	play_count: number
	time_count: number
	alpha: number
	image_name_array: string[]

	constructor() {
		super({})
		// initialize
		this.imgs = []
		this.balls = []
		this.time_max = 8000
		this.rand_arr = []
		this.temp_arr = []
		this.play_count = 0
		this.time_count = 0
		this.alpha = 0
		this.image_name_array = [
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
	}

	preload(): void {
		super.preload()

		this.image_name_array.forEach(image => {
			const img: p5.Image = this.p.loadImage(`images/brushDraw/${image}`)
			this.imgs.push(img)
		})
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.textAlign(this.p.CENTER)

		this.play_max = this.image_name_array.length
		this.initArray()
		this.initImage()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.time_count++
		if (this.time_max < this.time_count) {
			this.p.fill(0, this.alpha)
			this.p.rect(0, 0, this.p.width, this.p.height)
			this.alpha += 1;
			if (this.alpha > 255) {
				this.play_count++

				if (this.play_max <= this.play_count) {
					this.play_count = 0
					this.initArray()
				}
				this.time_count = 0

				this.alpha = 0
				this.clearScreen()
				this.initImage()
			}
		} else {
			for (let i: number = 0; i < this.balls.length; i++) {
				this.balls[i].draw()
				this.balls[i].update()
				this.balls[i].changeColour()
			}

			for (let i: number = 0; i < this.balls.length; i++) {
				if (this.balls[i].radius < 0) {
					this.balls.splice(i, 1)
				}
			}

			const rnd: number = this.p.random(100)
			if (rnd > 30) return

			for (let i: number = 0; i < 5; i++) {
				const x: number = this.p.floor(this.p.random(this.p.width))
				const y: number = this.p.floor(this.p.random(this.p.height))
				this.balls.push(new Ball(x, y, this.p.color(this.img.get(x + this.p.random(2), y + this.p.random(2))), this.p, this.img))
			}
		}
	}

	initArray(): void {
		let clone: p5.Image[] = [...this.imgs]
		this.rand_arr = new Array(clone.length)
		this.temp_arr = null
		let rand_num: number = 0
		for (let i: number = 0; i < this.rand_arr.length; i++) {
			this.temp_arr = new Array(1)
			rand_num = Math.floor(this.p.random(clone.length))

			this.temp_arr = this.p.subset(clone, rand_num, 1)
			this.rand_arr[i] = this.temp_arr[0]

			this.temp_arr = new Array(clone.length - 1)

			let count: number = 0
			for (let j = 0; j < clone.length; j++) {
				if (j != rand_num) {
					this.temp_arr[count] = clone[j]
					count += 1
				}
			}
			clone = this.temp_arr
		}
	}

	initImage(): void {
		this.img = null
		this.img = this.rand_arr[this.play_count]
		this.img.resize(this.p.width, this.p.height)
	}

	clearScreen(): void {
		this.p.background(0)
	}
}

class Ball {
	p: p5
	img: p5.Image
	location: p5.Vector
	radius: number
	r: number
	g: number
	b: number
	xOff: number
	yOff: number
	radiusLow: number
	radiusHigh: number
	rangeLow: number
	rangeHigh: number
	nX: number
	nY: number
	c: p5.Color

	constructor(mX: number, mY: number, c: p5.Color, p: p5, img: p5.Image) {
		this.p = p
		this.img = img
		this.location = this.p.createVector(mX, mY)
		this.radius = this.p.random(.01)
		this.r = this.p.red(c)
		this.g = this.p.green(c)
		this.b = this.p.blue(c)

		this.xOff = 0.0
		this.yOff = 0.0
	}

	update(): void {
		this.radius -= this.p.random(0.0001)

		this.xOff = this.xOff + this.p.random(-0.5, 0.5)
		this.nX = this.p.noise(this.location.x) * this.xOff

		this.yOff = this.yOff + this.p.random(-0.5, 0.5)
		this.nY = this.p.noise(this.location.y) * this.yOff

		this.location.x += this.nX
		this.location.y += this.nY
	}

	changeColour(): void {
		this.c = this.p.color(this.img.get(this.location.x, this.location.y))
		this.r = this.p.red(this.c)
		this.g = this.p.green(this.c)
		this.b = this.p.blue(this.c)
	}

	draw(): void {
		this.p.noStroke()
		this.p.stroke(this.r, this.g, this.b)
		this.p.ellipse(this.location.x, this.location.y, this.radius * 50, this.radius * 50)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}