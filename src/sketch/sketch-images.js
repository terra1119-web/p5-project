
'use strict'
import Sketch from '@/class/Sketch.js'

// variables
let t
let textsize = 14
const blackfield = '#000000'
const whitefield = '#FFFFFF'
const blackNotWhite = false
const imgs = []
let img
let font

const image_name_array = [
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

let rand_arr = []
let temp_arr = []

let play_max
let play_count = 0

let time_count = 0
const time_max = 8000

let is_complete = false
let alpha = 0

class SketchTest extends Sketch {
	preload (s) {
		super.preload(s)

		image_name_array.forEach(image => {
			const img = s.loadImage(`images/text-draw/${image}`)
			imgs.push(img)
		})

		font = s.loadFont('images/text-draw/Roboto-Bold.ttf')
	}

	setup (s) {
		super.setup(s)

		s.background(0)
		s.textFont(font)

		this.clearScreen()
		t = new TextManager(s)
		s.textSize(textsize)
		s.textAlign(s.CENTER, s.CENTER)
		// s.frameRate(60) // change if paint events seem to be too rapid

		play_max = image_name_array.length

		this.initArray()
		this.initImage()
	}

	draw (s) {
		super.draw(s)

		// s.background(0)

		time_count ++
		if (time_max < time_count) {
			is_complete = true

			s.fill(0, alpha)
			s.rect(0, 0 , s.width, s.height);
			alpha += 1;
			if (alpha > 255){
				play_count ++

				if(play_max <= play_count){
					play_count = 0
					this.initArray()
				}
				time_count = 0

				alpha = 0
				is_complete = false
				this.clearScreen()
				this.initImage()
			}

		} else {
			if(!is_complete && this.s) this.autoPaintRegion(0, 0, s.width, s.height)
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
		const field = blackNotWhite ? whitefield : blackfield
		this.s.background(field)
	}

	autoPaintRegion(minX, minY, maxX, maxY) {
		const locX = Math.floor(this.s.random(minX, maxX))
		const locY = Math.floor(this.s.random(minY, maxY))
		this.paintWordAtPoint(locX, locY);
	}

	paintWordAtPoint(locX, locY) {
		// absolute positioning
		const offX = this.getJitter()
		const offY = this.getJitter()
		this.setFill(locX + Math.floor(offX), locY + Math.floor(offY))
		this.s.text(t.getWord(), locX + offX, locY + offY);
	}

	getJitter() {
		const rnd = this.s.random(-20, 20)
		return rnd
	}

	setFill(locX, locY) {
		if (locX < 0) locX = 0
		if (locX >= this.s.width) locX = this.s.width-1
		if (locY < 0) locY = 0
		if (locY >= this.s.height) locY = this.s.height-1

		// const loc = locX + (locY * this.s.width)
		// console.log((loc + "/" + img.pixels.length + " locX: " + locX + " locY: " + locY))
		// console.log(img.pixels[loc])
		const c = img.get(locX, locY)
		c[3] = 225
		// console.log(c)
		// const h = this.s.hue(c)
		// const s = this.s.saturation(c)
		// const b = this.s.brightness(c)
		// console.log(`${h} ${s} ${b}`)
		// this.s.fill(h, s, b, 178)
		this.s.fill(c)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}

class TextManager {
	constructor (s, wInput = 'Wander ') {
		this.w = wInput
		this.s = s
		this.SPLIT_TOKENS = ' ?,;:[]<>()"'
		this.charIndex = 0
		this.wordIndex = 0
		this.words = this.s.splitTokens(this.w, this.SPLIT_TOKENS)
	}

	getChar() {
		const c = this.w.charAt(this.charIndex)
		this.charIndex = (this.charIndex + 1) % this.w.length()
		return c
	}

	getWord() {
		const word = this.words[this.wordIndex]
		this.wordIndex = (this.wordIndex + 1) % this.words.length
		return word
	}
}
