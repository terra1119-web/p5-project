'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	bg: p5.Graphics
	motes: Mote[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true
		})
		// initialize
		this.motes = []
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(1)
		this.bg = this.p.createGraphics(this.p.width, this.p.height)
		this.bg.pixelDensity(1)
		this.bg.background(0)
		for (let i: number = 0; i < 100; i++) {
			this.bg.noStroke()
			this.bg.fill(255, 2)
			let v1: p5.Vector = this.p.createVector(
				this.p.width + this.p.width * 0.5,
				this.p.random(-this.p.height * 0.4, 0)
			)
			let v2: p5.Vector = this.p.createVector(
				0,
				this.p.height +
					this.p.random(-this.p.height * 0.3, this.p.height * 0.3)
			)
			let beamWidth: number = this.p.random(
				this.p.height * 0.05,
				this.p.height
			)
			this.bg.triangle(
				v1.x,
				v1.y,
				v2.x,
				v2.y - beamWidth / 2,
				v2.x,
				v2.y + beamWidth / 2
			)
		}
		this.bg.filter(this.p.BLUR, 8)
		let m: number = (this.p.width + this.p.height) / 10
		for (let i: number = 0; i < m; i++) {
			this.motes.push(
				new Mote(
					this.p,
					this.bg,
					this.p.random(this.p.width),
					this.p.random(this.p.height)
				)
			)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.image(this.bg, 0, 0)

		for (let mote of this.motes) {
			mote.float()
			mote.replace()
			mote.waveaway()
			mote.show()
		}
	}
}

class Mote {
	p: p5
	pos: p5.Vector
	vel: p5.Vector
	depth: number
	wave: p5.Vector
	maxSize: number
	minSize: number
	bg: p5.Graphics

	constructor(p: p5, bg: p5.Graphics, x: number, y: number) {
		this.p = p
		this.bg = bg
		this.pos = this.p.createVector(x, y)
		this.vel = this.p.createVector(
			this.p.random(-0.01, -0.3),
			this.p.random(0.01, 0.3)
		)
		this.depth = this.p.random(-20, 20)
		this.wave = this.p.createVector(0, 0)
		this.maxSize = 10
		this.minSize = 1
	}

	float() {
		this.pos.add(this.vel)
		let waver: number = this.p.map(
			this.p.noise(
				this.pos.x / 100,
				this.pos.y / 100,
				this.p.frameCount / 200
			),
			0,
			1,
			-0.2,
			0.2
		)
		this.depth += waver
		this.depth = this.p.constrain(this.depth, -20, 20)
	}

	replace() {
		if (
			this.pos.x < -this.maxSize / 2 ||
			this.pos.y > this.p.height + this.maxSize / 2
		) {
			let newPlace: number = this.p.random(
				-this.p.width * 0.2,
				this.p.height * 0.2
			)
			if (newPlace < 0) {
				this.pos = this.p.createVector(
					this.p.width + newPlace,
					-this.maxSize / 2
				)
			} else {
				this.pos = this.p.createVector(
					this.p.width + this.maxSize / 2,
					newPlace
				)
			}
		}
	}

	waveaway() {
		// if (mouseMoving) {
		// 	let mpos = createVector(mouseX, mouseY)
		// 	let d = p5.Vector.dist(this.pos, mpos)
		// 	if (d < 200) {
		// 		let power = map(d, 0, 200, 3, 0)
		// 		let xnvel = map(
		// 			noise(this.pos.x / 100, frameCount / 100, this.depth),
		// 			0,
		// 			1,
		// 			-power,
		// 			power
		// 		)
		// 		let ynvel = map(
		// 			noise(this.pos.y / 100, frameCount / 100, this.depth),
		// 			0,
		// 			1,
		// 			-power,
		// 			power
		// 		)
		// 		this.wave = createVector(xnvel, ynvel)
		// 	}
		// }
		this.pos.add(this.wave)
		if (this.wave.mag() > 0) {
			this.wave.mult(0.99)
			if (this.wave.mag() < 0.01) {
				this.wave.setMag(0)
			}
		}
	}

	show() {
		this.p.push()
		let size: number = this.p.map(
			this.depth,
			-20,
			20,
			this.minSize,
			this.maxSize
		)
		let alpha: number = this.p.map(this.depth, 0, 20, 0, 150)
		const blur: number = this.p.map(
			this.p.abs(this.depth),
			0,
			20,
			0,
			this.maxSize
		)
		this.p.drawingContext.shadowOffsetX = -size / 4
		this.p.drawingContext.shadowOffsetY = size / 4
		this.p.drawingContext.shadowBlur = blur

		this.p.noStroke()
		let g: number[] = this.bg.get(this.pos.x, this.pos.y)
		let bger: number = (g[0] + g[1] + g[2]) / 3
		let b: number = this.p.map(bger, 0, 100, 0, 255)
		this.p.drawingContext.shadowColor = this.p.color(b)
		this.p.fill(20 + b, 255 - alpha)
		this.p.ellipse(this.pos.x, this.pos.y, size)
		this.p.pop()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
