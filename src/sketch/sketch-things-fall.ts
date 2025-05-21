'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	poem: string[]
	theFont: p5.Font

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: true,
			useMic: false,
		})
		// initialize
		this.poem = [
			'T',
			'u',
			'r',
			'n',
			'i',
			'n',
			'g',
			'space',
			'a',
			'n',
			'd',
			'space',
			't',
			'u',
			'r',
			'n',
			'i',
			'n',
			'g',
			'space',
			'i',
			'n',
			'space',
			't',
			'h',
			'e',
			'space',
			'w',
			'i',
			'd',
			'e',
			'n',
			'i',
			'n',
			'g',
			'space',
			'g',
			'y',
			'r',
			'e',
			'T',
			'h',
			'e',
			'space',
			'f',
			'a',
			'l',
			'c',
			'o',
			'n',
			'space',
			'c',
			'a',
			'n',
			'n',
			'o',
			't',
			'space',
			'h',
			'e',
			'a',
			'r',
			'space',
			't',
			'h',
			'e',
			'space',
			'f',
			'a',
			'l',
			'c',
			'o',
			'n',
			'e',
			'r',
			'space',
			'T',
			'h',
			'i',
			'n',
			'g',
			's',
			'space',
			'f',
			'a',
			'l',
			'l',
			'space',
			'a',
			'p',
			'a',
			'r',
			't',
			'space',
			't',
			'h',
			'e',
			'space',
			'c',
			'e',
			'n',
			't',
			'r',
			'e',
			'space',
			'c',
			'a',
			'n',
			'n',
			'o',
			't',
			'space',
			'h',
			'o',
			'l',
			'd',
			'space',
			'M',
			'e',
			'r',
			'e',
			'space',
			'a',
			'n',
			'a',
			'r',
			'c',
			'h',
			'y',
			'space',
			'i',
			's',
			'space',
			'l',
			'o',
			'o',
			's',
			'e',
			'd',
			'space',
			'u',
			'p',
			'o',
			'n',
			'space',
			't',
			'h',
			'e',
			'space',
			'w',
			'o',
			'r',
			'l',
			'd',
			'space',
			'T',
			'h',
			'e',
			'space',
			'b',
			'l',
			'o',
			'o',
			'd',
			'd',
			'i',
			'm',
			'm',
			'e',
			'd',
			'space',
			't',
			'i',
			'd',
			'e',
			'space',
			'i',
			's',
			'space',
			'l',
			'o',
			'o',
			's',
			'e',
			'd',
			'space',
			'a',
			'n',
			'd',
			'space',
			'e',
			'v',
			'e',
			'r',
			'y',
			'w',
			'h',
			'e',
			'r',
			'e',
			'space',
			'T',
			'h',
			'e',
			'space',
			'c',
			'e',
			'r',
			'e',
			'm',
			'o',
			'n',
			'y',
			'space',
			'o',
			'f',
			'space',
			'i',
			'n',
			'n',
			'o',
			'c',
			'e',
			'n',
			'c',
			'e',
			'space',
			'i',
			's',
			'space',
			'd',
			'r',
			'o',
			'w',
			'n',
			'e',
			'd',
			'space',
			'T',
			'h',
			'e',
			'space',
			'b',
			'e',
			's',
			't',
			'space',
			'l',
			'a',
			'c',
			'k',
			'space',
			'a',
			'l',
			'l',
			'space',
			'c',
			'o',
			'n',
			'v',
			'i',
			'c',
			't',
			'i',
			'o',
			'n',
			'space',
			'w',
			'h',
			'i',
			'l',
			'e',
			'space',
			't',
			'h',
			'e',
			'space',
			'w',
			'o',
			'r',
			's',
			't',
			'space',
			'A',
			'r',
			'e',
			'space',
			'f',
			'u',
			'l',
			'l',
			'space',
			'o',
			'f',
			'space',
			'p',
			'a',
			's',
			's',
			'i',
			'o',
			'n',
			'a',
			't',
			'e',
			'space',
			'i',
			'n',
			't',
			'e',
			'n',
			's',
			'i',
			't',
			'y',
			'space',
			'space',
		]
	}

	preload(): void {
		super.preload()

		this.theFont = this.p.loadFont('/font/CourierPrime-Bold.ttf')
	}

	setup(): void {
		super.setup()

		this.p.textFont(this.theFont)
		this.p.fill(180)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		let alphabetP = 0
		let fspeed = this.p.frameCount / 20
		let flaming = 0
		let bigT = this.p.width / 18
		let littleT = this.p.width / 36
		for (let y = 10; y < this.p.height - 10; y += 12) {
			flaming = this.p.map(y, this.p.height, 0, 0.2, 0.8)
			for (let x = 10; x < this.p.width - 10; x += 6) {
				let na = this.p.noise(x / 50, y / 100 + fspeed, fspeed)
				if (na < flaming) {
					this.p.textSize(na * littleT)
				} else {
					this.p.textSize(na * bigT)
				}
				let letter = this.poem[alphabetP % this.poem.length]
				if (letter != 'space') {
					this.p.text(letter, x, y)
				}
				alphabetP++
			}
		}
	}

	mousePressed(): void {
		super.mousePressed()
	}

	keyTyped(): void {
		super.keyTyped()
	}

	keyPressed(): void {
		super.keyPressed()
	}

	doubleClicked(): void {
		super.doubleClicked()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
