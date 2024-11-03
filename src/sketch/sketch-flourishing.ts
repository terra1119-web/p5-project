'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	particles: Particle[]
	particleCount: number
	timer: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true
		})
		// initialize
		this.particles = []
		this.particleCount = 40
		this.timer = 0
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(3)
		this.p.background(0)

		this.p.push()
		this.p.blendMode(this.p.MULTIPLY)
		this.p.pop()

		this.createParticle()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		if (this.p.frameCount) {
			this.p.push()
		}

		this.timer++
		if (this.timer > 500) {
			this.timer = 0
			this.particles = []
			this.p.background(0)
			this.createParticle()
		}

		this.particles.forEach(particle => {
			particle.update()
			particle.draw()
		})
		this.particles = this.particles.filter(particle => particle.alive)
	}

	createParticle() {
		for (let i: number = 0; i < this.particleCount; i++) {
			const particle = new Particle(this.p, {
				point: this.p.createVector(
					this.p.random(this.p.width * 0.01, this.p.width * 0.99),
					this.p.height * 0.9 + this.p.random(20, 40)
				),
				r: this.p.random(80) * this.p.random(),
				v: this.p.createVector(
					this.p.random(-2, 2),
					-this.p.random(2, 7)
				)
			})
			this.particles.push(particle)
		}
	}
}

type argsType = {
	point: p5.Vector
	v: p5.Vector
	a: p5.Vector
	r: number
	color: p5.Color
	lastP: p5.Vector
	alive: boolean
	shrinkRatio: number
	randomId: number
}

class Particle {
	p: p5
	point: p5.Vector
	v: p5.Vector
	a: p5.Vector
	r: number
	color: p5.Color
	lastP: p5.Vector
	alive: boolean
	shrinkRatio: number
	randomId: number

	constructor(p: p5, args: object) {
		this.p = p
		const def: argsType = {
			point: this.p.createVector(0, 0),
			v: this.p.createVector(0, 0),
			a: this.p.createVector(0, -0.01),
			r: 8,
			color: this.p.random([this.p.color(255, 255, 255)]),
			lastP: this.p.createVector(0, 0),
			alive: true,
			shrinkRatio: this.p.random(0.97, 0.99),
			randomId: this.p.int(this.p.random(100000))
		}
		Object.assign(def, args)
		Object.assign(this, def)
	}

	draw() {
		this.p.push()
		this.brush(
			this.point.x + this.p.random(-1, 1),
			this.point.y + this.p.random(-1, 1),
			this.r,
			this.color
		)

		if (this.randomId % 5 < 4 && this.r < 4 && this.p.frameCount > 100) {
			this.p.colorMode(this.p.HSB)
			this.p.translate(
				this.p.random(-1, 1) * 20,
				this.p.random(-1, 1) * 20
			)
			this.p.translate(this.point.x, this.point.y)
			this.p.scale(this.p.random(1, 2))
			this.brush(
				this.p.random(-1, 1),
				this.p.random(-1, 1),
				this.r * this.p.random(2),
				this.p.color(
					this.p.random(0, 40),
					this.p.random(50, 100),
					this.p.random(50, 100),
					this.p.random(0.5)
				)
			)
		}
		this.p.pop()
	}

	update() {
		this.lastP = this.point.copy()
		this.point.add(this.v)
		this.v.mult(0.99995)
		let angle = this.point
			.copy()
			.sub(
				this.p.createVector(
					this.p.random(this.p.width),
					this.p.random(this.p.height)
				)
			)
			.heading()

		this.v.rotate(
			(this.p.noise(
				this.randomId + this.r,
				this.point.x / 50 + this.point.y / 50
			) -
				0.5) /
				10
		)
		this.v.add(this.a)
		this.v.limit(this.r * 0.9)
		this.r *= this.shrinkRatio
		if (this.r < 0.1) {
			this.alive = false
		}
	}

	brush(x: number, y: number, brushR: number = 200, color: p5.Color) {
		this.p.push()
		let angDelta = this.p.atan2(
			y - this.p.random(this.p.height),
			x - this.p.random(this.p.width)
		)
		let dd = this.p.min(
			this.p.dist(
				x,
				y,
				this.p.random(this.p.width),
				this.p.random(this.p.height)
			),
			50
		)
		let rDistributeFunc = (r = 1) =>
			r * (1 - this.p.random(this.p.random(this.p.random())))
		let angDistributeFunc = () => this.p.random(2 * this.p.PI)
		let brushDensity =
			this.p.pow(brushR, 1.8) * 1.3 +
			this.p.map(brushR, 5, 0.3, 30, 0, true)
		this.p.translate(x, y)
		this.p.rotate(angDelta)
		for (let i: number = 0; i < brushDensity; i++) {
			let rr = rDistributeFunc(brushR),
				ang = angDistributeFunc()
			let xx = rr * this.p.cos(ang),
				yy = rr * this.p.sin(ang)
			// yy = (0.5 - ((1 - rDistributeFunc()) + (1 - rDistributeFunc()))) * brushR;
			color.setAlpha(this.p.random(255))
			this.p.stroke(color)
			this.p.strokeWeight(this.p.random(0.5, 1.2))
			this.p.point(xx, yy)
		}
		this.p.pop()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
