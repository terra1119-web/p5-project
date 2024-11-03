'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	t: TextManager
	textsize: number
	blackfield: string
	whitefield: string
	blackNotWhite: boolean
	imgs: p5.Image[]
	img: p5.Image
	font: p5.Font
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
		super({})
		// initialize
		this.textsize = 12
		this.blackfield = '#000000'
		this.whitefield = '#FFFFFF'
		this.blackNotWhite = false
		this.imgs = []
		this.image_name_array = [
			'001.png',
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
			'012.jpg'
			// '2022_04_11_Oil__Acrylic_034.jpg'
		]

		this.rand_arr = []
		this.temp_arr = []
		this.play_count = 0
		this.time_count = 0
		this.time_max = 10000
		this.is_complete = false
		this.alpha = 0
	}

	preload(): void {
		super.preload()

		this.image_name_array.forEach(image => {
			const img: p5.Image = this.p.loadImage(`images/text-draw/${image}`)
			this.imgs.push(img)
		})

		this.font = this.p.loadFont('images/text-draw/Roboto-Bold.ttf')
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.textFont(this.font)

		this.clearScreen()
		this.t = new TextManager(this.p)
		this.p.textSize(this.textsize)
		this.p.textAlign(this.p.CENTER, this.p.CENTER)
		// s.frameRate(60) // change if paint events seem to be too rapid

		this.play_max = this.image_name_array.length

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
			if (!this.is_complete && this.p)
				this.autoPaintRegion(0, 0, this.p.width, this.p.height)
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
		this.img.resize(this.p.width, this.p.height)
	}

	clearScreen(): void {
		const field: string = this.blackNotWhite
			? this.whitefield
			: this.blackfield
		this.p.background(field)
	}

	autoPaintRegion(
		minX: number,
		minY: number,
		maxX: number,
		maxY: number
	): void {
		const locX: number = Math.floor(this.p.random(minX, maxX))
		const locY: number = Math.floor(this.p.random(minY, maxY))
		this.paintWordAtPoint(locX, locY)
	}

	paintWordAtPoint(locX: number, locY: number): void {
		// absolute positioning
		const offX: number = this.getJitter()
		const offY: number = this.getJitter()
		this.setFill(locX + Math.floor(offX), locY + Math.floor(offY))
		this.p.text(this.t.getWord(), locX + offX, locY + offY)
	}

	getJitter(): number {
		const rnd: number = this.p.random(-20, 20)
		return rnd
	}

	setFill(locX: number, locY: number): void {
		if (locX < 0) locX = 0
		if (locX >= this.p.width) locX = this.p.width - 1
		if (locY < 0) locY = 0
		if (locY >= this.p.height) locY = this.p.height - 1

		// const loc = locX + (locY * this.s.width)
		// console.log((loc + "/" + img.pixels.length + " locX: " + locX + " locY: " + locY))
		// console.log(img.pixels[loc])
		const c: number[] = this.img.get(locX, locY)
		c[3] = 225
		// console.log(c)
		// const h = this.s.hue(c)
		// const s = this.s.saturation(c)
		// const b = this.s.brightness(c)
		// console.log(`${h} ${s} ${b}`)
		// this.s.fill(h, s, b, 178)
		this.p.fill(c)
	}
}

class TextManager {
	word: string
	SPLIT_TOKENS: string
	charIndex: number
	wordIndex: number
	words: string[]

	constructor(p: p5, wInput: string = 'Wander × Acoustic') {
		this.word = wInput
		this.SPLIT_TOKENS = ' ?,;:[]<>()"'
		this.charIndex = 0
		this.wordIndex = 0
		this.words = p.splitTokens(this.word, this.SPLIT_TOKENS)
	}

	getChar(): string {
		const c: string = this.word.charAt(this.charIndex)
		this.charIndex = (this.charIndex + 1) % this.word.length
		return c
	}

	getWord(): string {
		const word: string = this.words[this.wordIndex]
		this.wordIndex = (this.wordIndex + 1) % this.words.length
		return word
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
