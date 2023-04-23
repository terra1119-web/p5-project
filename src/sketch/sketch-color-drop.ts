'use strict'
import Sketch from '@/class/Sketch'
import Microphone from '@/class/Microphone'

class SketchTest extends Sketch {
	// property
	colors: string[]
	ripples: Ripple[]
	drops: Drop[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true
		})
		// initialize
		this.ripples = []
		this.drops = []
	}

	setup(): void {
		super.setup()
		this.p.colorMode(this.p.HSB)
		this.p.strokeWeight(1)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		Microphone.getAudio()

		this.p.background(0)
		if (this.p.frameCount % 40 == 1) {
			this.drops.push(new Drop(this.p, Microphone.getHue))
		}

		for (let ripple of this.ripples) {
			ripple.update()
			ripple.display()

			if (ripple.d > this.p.height * 5) {
				let index = this.ripples.indexOf(ripple)
				this.ripples.splice(index, 1)
			}
		}

		for (let drop of this.drops) {
			drop.update()
			drop.display()

			if (drop.y >= this.p.height / 2) {
				this.ripples.push(
					new Ripple(
						this.p,
						this.p.width / 2,
						this.p.height / 2,
						drop.color
					)
				)
				let index = this.drops.indexOf(drop)
				this.drops.splice(index, 1)
			}
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}

class Ripple {
	p: p5
	x: number
	y: number
	d: number
	color: number

	constructor(p: p5, x: number, y: number, color: number) {
		this.p = p
		this.x = x
		this.y = y
		this.d = 10
		this.color = color
	}

	update() {
		this.d += 4
	}

	display() {
		this.p.noFill()
		this.p.stroke(this.color, 100, 90, 100)
		this.p.fill(this.color, 80, 90, 0.8)
		this.p.push()
		this.p.translate(this.x, this.y)
		this.p.ellipse(0, 0, this.d, this.d / 4)
		this.p.pop()
	}
}

class Drop {
	p: p5
	x: number
	y: number
	yacc: number
	yvel: number
	color: number

	constructor(p: p5, color: number) {
		this.p = p
		this.x = this.p.width / 2
		this.y = -5
		this.yacc = 0.2
		this.yvel = 0
		this.color = color
	}
	update() {
		this.yvel += this.yacc
		this.y += this.yvel
	}

	display() {
		this.p.stroke(this.color, 90, 100, 100)
		this.p.fill(this.color, 90, 100, 100)
		this.p.ellipse(this.x, this.y, 18, 20)
	}
}
