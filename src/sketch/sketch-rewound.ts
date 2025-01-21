'use strict'
import Sketch from '@/class/Sketch'
import spectral from 'spectral.js'
import { openSimplexNoise } from '@/library/simplexNoise.js'

class SketchTest extends Sketch {
	// property
	palettes: string[][]
	steps: number
	switchTime: number
	simplex: any
	colors: string[]
	count: number
	num: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
		this.palettes = [
			[
				'#502844',
				'#182333',
				'#4d6520',
				'#274544',
				'#c9b66b',
				'#cca215',
				'#9d5f1b'
			],
			[
				'#566c65',
				'#6d9067',
				'#a94d3c',
				'#b26c71',
				'#8a8f68',
				'#bd8822',
				'#427886',
				'#3c5056',
				'#dcd1b7'
			],
			[
				'#c8a69a',
				'#781a00',
				'#9d4500',
				'#c97018',
				'#9b6626',
				'#ededf1',
				'#423e39',
				'#b68200'
			],
			['#271f17', '#014e68', '#8497a8', '#c5cecf', '#b8ad38', '#978c0e'],
			['#af4c24', '#8e6438', '#c58b31', '#768860', '#396872', '#1b344e']
		]
		this.steps = 0
		this.switchTime = 800
		this.simplex
		this.count = 0
		this.num = 1
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()
		this.initSketch()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.count += this.num
		if (this.count < this.switchTime) {
			this.steps += this.num
		} else if (this.count > this.switchTime * 2) {
			this.p.blendMode(this.p.DODGE)
			this.steps -= this.num
		}
		if (this.count > this.switchTime) {
			this.count = 0
			this.steps = 0
		}

		if (this.p.frameCount > this.switchTime * 2) {
			this.p.blendMode(this.p.NORMAL)
			this.p.frameCount = 0
			this.count = 0
			this.steps = 0
			this.initSketch()
		}

		this.p.noFill()
		this.p.beginShape()
		this.p.vertex(-5, -5)
		for (let x = -5; x < this.p.width + 5; x += 1) {
			let baseY = this.p.map(
				this.steps,
				0,
				this.switchTime,
				-this.p.height / 5,
				this.p.height + this.p.height / 5
			)
			let yOff =
				(this.simplex.noise2D(
					x / 60,
					this.steps / (this.switchTime / 2)
				) *
					this.p.height) /
				5
			let xOff =
				(this.simplex.noise2D(x / 40, this.steps / this.switchTime) *
					this.p.width) /
				50
			this.p.vertex(x + xOff, baseY + yOff)
			this.p.stroke(this.colorMixer(baseY, this.colors))
		}
		this.p.vertex(this.p.width + 5, -5)
		this.p.endShape(this.p.CLOSE)
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

	colorMixer(ind, colorArray) {
		let c = this.p.noise(ind / 20, this.count / 500) * colorArray.length
		let c1 = this.p.floor(c)
		let c2 = this.p.floor(c + 1) % colorArray.length
		let color1 = colorArray[c1]
		let color2 = colorArray[c2]
		let mix = this.p.fract(c)
		let coloring = this.p.color(spectral.mix(color1, color2, mix))
		let alpha = 30 + this.p.noise(ind / 20) * 75
		coloring.setAlpha(alpha)
		return coloring
	}

	initSketch() {
		this.simplex = openSimplexNoise(Date.now())
		this.colors = this.p.random(this.palettes)
		this.p.background(0)
		this.p.noStroke()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
