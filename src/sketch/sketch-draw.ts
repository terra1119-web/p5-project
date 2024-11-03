'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class Particle {
	p: p5
	mainGraphics: p5.Graphics
	overAllTexture: p5.Graphics
	colors: string[]
	point: p5.Vector
	v: p5.Vector
	a: p5.Vector
	r: number
	dp: number
	angMult: number
	color: string
	flg: boolean

	constructor(
		args: object,
		p: p5,
		mainGraphics: p5.Graphics,
		overAllTexture: p5.Graphics
	) {
		this.p = p
		this.mainGraphics = mainGraphics
		this.overAllTexture = overAllTexture
		this.colors =
			'e6e1c5-d4cb92-395c6b-80a4ed-bcd3f2-f24-fff-52489c-4062bb-59c3c3-ebebeb-f45b69-0c090d-e01a4f-f15946-f9c22e-53b3cb'
				.split('-')
				.map(a => '#' + a)
		const def: object = {
			point: this.p.createVector(0, 0),
			v: this.p.createVector(0, 0),
			a: this.p.createVector(0, 0),
			r: 10,
			dp: this.p.random(0.93, 0.99),
			angMult: this.p.random(10, 50),
			color: this.p.random(this.colors),
			flg: false
		}
		Object.assign(def, args)
		Object.assign(this, def)
	}

	draw(): void {
		// strokeWeight(3)
		this.mainGraphics.push()
		this.mainGraphics.translate(this.point.x, this.point.y)
		// const color = s.color(this.color)
		// color.setAlpha(125)
		this.mainGraphics.fill(this.color)
		this.mainGraphics.noStroke()
		//stroke(0,100)
		this.mainGraphics.ellipse(0, 0, this.r)
		this.mainGraphics.pop()
	}

	update(): void {
		this.point.add(this.v)
		this.v.add(this.a)
		let delta: p5.Vector = this.p.createVector(
			this.point.x - this.p.width / 2,
			this.point.y - this.p.height / 2
		)
		let ang: number = delta.heading()
		let rr: number = delta.mag()

		this.v.x +=
			-this.p.sin(ang * this.angMult + rr / 5) / 15 +
			this.p.cos(rr / 10) / 10
		this.v.y +=
			-this.p.cos(ang * this.angMult + rr / 5) / 15 +
			this.p.sin(rr / 10) / 10
		this.a.x = (this.p.noise(this.point.x, this.point.y, 5) - 0.5) * 1.1
		this.a.y = (this.p.noise(this.point.x, this.point.y, 5000) - 0.5) * 1.1

		this.v.mult(0.95)
		// this.r*= this.dp
		if (this.r > 120 || this.r < 10) this.flg = !this.flg
		if (this.flg) {
			this.r *= this.dp
		} else {
			this.r += this.dp * 0.9
		}
	}
}

class SketchTest extends Sketch {
	particles: Particle[]
	mainGraphics: p5.Graphics
	overAllTexture: p5.Graphics
	p: p5

	constructor() {
		super({})
		// variables
		this.particles = []
		this.mainGraphics
		this.overAllTexture
	}

	setup(): void {
		super.setup()
		this.overAllTexture = this.p.createGraphics(this.p.width, this.p.height)
		this.mainGraphics = this.p.createGraphics(this.p.width, this.p.height)
		// mainGraphics.blendMode(s.ADD)
		this.overAllTexture.loadPixels()

		// noStroke()
		for (let i: number = 0; i < this.p.width + 50; i++) {
			for (let o: number = 0; o < this.p.height + 50; o++) {
				this.overAllTexture.set(
					i,
					o,
					this.p.color(
						150,
						this.p.noise(i / 10, (i * o) / 300) *
							this.p.random([0, 50, 100])
					)
				)
			}
		}
		this.overAllTexture.updatePixels()

		this.p.background(0)
		for (let i: number = 0; i < this.p.width; i += 200) {
			for (let o: number = 0; o < this.p.height; o += 100) {
				this.particles.push(
					new Particle(
						{
							point: this.p.createVector(i, o),
							v: this.p.createVector(
								this.p.noise(i / 10) * 10 - 5,
								this.p.noise(o / 10) * 10 - 5
							),
							r: this.p.random(150)
						},
						this.p,
						this.mainGraphics,
						this.overAllTexture
					)
				)
			}
		}
		this.mainGraphics.background(0)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.particles.forEach(particle => particle.draw())
		this.particles.forEach(particle => particle.update())
		this.p.image(this.mainGraphics, 0, 0)

		this.p.push()
		this.p.blendMode(this.p.ADD)
		this.p.image(this.overAllTexture, 0, 0)
		this.p.pop()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
