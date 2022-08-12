'use strict'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
	constructor () {
		super()
		// variables
		this.t
		this.textsize = 14
		this.blackfield = '#000000'
		this.whitefield = '#FFFFFF'
		this.blackNotWhite = false
		this.imgs = []
		this.img
		this.font
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
			'012.jpg',
		]

		this.rand_arr = []
		this.temp_arr = []
		this.play_max
		this.play_count = 0
		this.time_count = 0
		this.time_max = 8000
		this.is_complete = false
		this.alpha = 0
	}

	preload () {
		super.preload()

		this.image_name_array.forEach(image => {
			const img = this.p.loadImage(`images/text-draw/${image}`)
			this.imgs.push(img)
		})

		this.font = this.p.loadFont('images/text-draw/Roboto-Bold.ttf')
	}

	setup () {
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

	draw () {
		super.draw()

		// s.background(0)

		this.time_count ++
		if (this.time_max < this.time_count) {
			this.is_complete = true

			this.p.fill(0, this.alpha)
			this.p.rect(0, 0 , this.p.width, this.p.height)
			this.alpha += 1
			if (this.alpha > 255){
				this.play_count ++

				if(this.play_max <= this.play_count){
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
			if(!this.is_complete && this.p) this.autoPaintRegion(0, 0, this.p.width, this.p.height)
		}
	}

	initArray () {
		let clone = [...this.imgs]
		this.rand_arr = new Array(clone.length)
		this.temp_arr = null
		let rand_num = 0
		for (let i = 0; i < this.rand_arr.length; i++) {
			this.temp_arr = new Array(1)
			rand_num = Math.floor(this.p.random(clone.length))

			this.temp_arr = this.p.subset(clone, rand_num, 1)
			this.rand_arr[i] = this.temp_arr[0]

			this.temp_arr = new Array(clone.length - 1)

			let count = 0
			for (let j = 0; j < clone.length; j++) {
				if (j != rand_num) {
					this.temp_arr[count] = clone[j]
					count += 1
				}
			}
			clone = this.temp_arr
		}
	}

	initImage () {
		this.img = null
		this.img = this.rand_arr[this.play_count]
		this.img.resize(this.p.width, this.p.height)
	}

	clearScreen () {
		const field = this.blackNotWhite ? this.whitefield : this.blackfield
		this.p.background(field)
	}

	autoPaintRegion (minX, minY, maxX, maxY) {
		const locX = Math.floor(this.p.random(minX, maxX))
		const locY = Math.floor(this.p.random(minY, maxY))
		this.paintWordAtPoint(locX, locY)
	}

	paintWordAtPoint (locX, locY) {
		// absolute positioning
		const offX = this.getJitter()
		const offY = this.getJitter()
		this.setFill(locX + Math.floor(offX), locY + Math.floor(offY))
		this.p.text(this.t.getWord(), locX + offX, locY + offY)
	}

	getJitter () {
		const rnd = this.p.random(-20, 20)
		return rnd
	}

	setFill (locX, locY) {
		if (locX < 0) locX = 0
		if (locX >= this.p.width) locX = this.p.width-1
		if (locY < 0) locY = 0
		if (locY >= this.p.height) locY = this.p.height-1

		// const loc = locX + (locY * this.s.width)
		// console.log((loc + "/" + img.pixels.length + " locX: " + locX + " locY: " + locY))
		// console.log(img.pixels[loc])
		const c = this.img.get(locX, locY)
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
	constructor (p, wInput = 'Wander ') {
		this.word = wInput
		this.SPLIT_TOKENS = ' ?,;:[]<>()"'
		this.charIndex = 0
		this.wordIndex = 0
		this.words = p.splitTokens(this.word, this.SPLIT_TOKENS)
	}

	getChar () {
		const c = this.word.charAt(this.charIndex)
		this.charIndex = (this.charIndex + 1) % this.word.length()
		return c
	}

	getWord () {
		const word = this.words[this.wordIndex]
		this.wordIndex = (this.wordIndex + 1) % this.words.length
		return word
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}
