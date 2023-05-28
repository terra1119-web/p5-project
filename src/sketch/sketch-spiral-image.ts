'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	imgs: p5.Image[]
	img: p5.Image
	image_name_array: string[]
	rand_arr: p5.Image[]
	temp_arr: p5.Image[]
	play_max: number
	play_count: number
	time_count: number
	time_max: number
	is_complete: boolean
	alpha: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true
		})
		// initialize
		this.imgs = []
		this.image_name_array = [
			'529d3f07eb5abeafbfd14b08f5d1a1fb66c27dbc959de56c3fadef826fef14db.jpg',
			'640.jpg',
			'1200.jpg',
			'20210524_05_img_01.png',
			'20220829_06_img_01.png',
			'b1ed7ae0.jpg',
			'barbare-kacharava-6KeS4mmWlCA-unsplash.jpg',
			'markus-spiske-qmt6Vc8H3PI-unsplash.jpg',
			'maxresdefault.jpg',
			'SID0021115_fwxga.jpg'
		]
		this.rand_arr = []
		this.temp_arr = []
		this.play_count = 0
		this.time_count = 0
		this.time_max = 8000
		this.is_complete = false
		this.alpha = 0
	}

	preload(): void {
		super.preload()

		this.image_name_array.forEach(image => {
			const img: p5.Image = this.p.loadImage(
				`images/spiral-image/${image}`
			)
			this.imgs.push(img)
		})
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.angleMode(this.p.DEGREES)
		this.p.noStroke() //I paint without pen in this place

		this.play_max = this.image_name_array.length

		this.p.blendMode(this.p.HARD_LIGHT)
		this.initArray()
		this.initImage()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.time_count++
		if (this.time_max < this.time_count) {
			this.is_complete = true

			this.p.fill(0, this.alpha)
			this.p.rect(0, 0, this.p.width, this.p.height)
			this.alpha += 1
			if (this.alpha > 255) {
				this.play_count++

				if (this.play_max <= this.play_count) {
					this.play_count = 0
					this.initArray()
				}
				this.time_count = 0

				this.alpha = 0
				this.is_complete = false
				this.clearScreen()
				this.initImage()
			}
		} else {
			if (!this.is_complete && this.p) this.autoPaint()
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
			for (let j: number = 0; j < clone.length; j++) {
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
	}

	clearScreen(): void {
		this.p.background(0)
	}

	autoPaint(): void {
		const t = (this.p.frameCount / 5) % 360 //how many breaths mod 360 do we have?
		this.p.background(0, 0, 0, 1) //a gesso unique to each of us
		for (let i = 1; i < 7800; i += 10) {
			//and only in daily loops do I become defined.
			this.p.fill(this.p.random(20, 100)) //pixels of self
			const x =
				this.p.width / 2 +
				10 +
				this.p.sqrt(i * 60) *
					this.p.sin(t * 10 + i / 2 + this.p.random(5)) //placed on a horizon
			const y =
				this.p.width / 4 +
				50 +
				this.p.sqrt(i * 20) *
					this.p.cos(t * 10 + i / 2 + this.p.random(5)) //placed up and down - and within
			const pix: p5.Color = this.p.color(
				this.img.get(
					this.img.width / (this.p.width / x),
					this.img.height / (this.p.height / y)
				)
			) //do we all have a negative in which to derive from?
			pix.setAlpha(this.p.random(200)) //to let light pass through us
			this.p.fill(pix) //and yet fill this vessel
			this.p.circle(x, y, this.p.random(0, 10 + 5 * this.p.sin(t))) //where I live
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
