'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	curlSpan: number
	particles: Particle[]
	timer: number
	threadMax: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
		this.curlSpan = 0
		this.particles = []
		this.timer = 0
		this.threadMax = 140
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(2)
		this.p.background(0)

		this.createParticle()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.timer++
		if (this.timer > 500) {
			this.timer = 0
			this.particles = []
			this.p.background(0)
			this.createParticle()
		}

		this.particles = this.particles.filter(p => p.alive)
		this.particles.forEach(obj => {
			obj.update()
			if (
				this.p.frameCount % obj.copySpan == 0 &&
				obj.r > 0.5 &&
				this.p.random() < 0.6 &&
				obj.z < 5
			) {
				this.particles.push(
					new Particle({
						p5: this.p,
						p: obj.p.copy(),
						v: obj.v.copy().rotate(-0.1),
						r: obj.r,
						z: obj.z + 1,
						color: obj.color
					})
				)
				this.particles.push(
					new Particle({
						p5: this.p,
						p: obj.p.copy(),
						v: obj.v.copy().rotate(0.1),
						r: obj.r,
						z: obj.z + 1,
						color: obj.color
					})
				)
				obj.alive = false
			}
			obj.draw()
		})
	}

	createParticle() {
		for (let i = 0; i < this.threadMax; i++) {
			this.particles.push(
				new Particle({
					p5: this.p,
					p: this.p
						.createVector(this.p.width / 2, this.p.height / 2)
						.add(this.p.createVector(-5, 5)),
					v: this.p
						.createVector(0, 3.5)
						.rotate((i / this.threadMax) * this.p.PI * 2)
				})
			)
		}
	}
}

class Particle {
	p5: p5
	p: p5.Vector
	v: p5.Vector
	a: p5.Vector
	r: number
	rFac: number
	copySpan: number
	z: number
	color: string
	randomId: number
	alive: boolean
	lastP: p5.Vector
	curlSpan: number
	colors: string[]

	constructor(args) {
		this.p5 = args.p5
		this.colors =
			'f24-0081a7-00afb9-fdfcdc-fed9b7-f07167-aa1155-880044-dd1155-ffee88-00cc99-fff-1c91ff-fb3640-605f5e-247ba0-e2e2e2'
				.split('-')
				.map(a => '#' + a)
		this.curlSpan = this.p5.random(50, 100)
		const def = {
			p: this.p5.createVector(0, 0),
			v: this.p5.createVector(0, 0),
			a: this.p5.createVector(0, 0),
			r: this.p5.random(1, 1.5),
			rFac: this.p5.random(0.994, 0.995),
			copySpan: this.p5.int(this.p5.random(20, 90)),
			z: 0,
			color: this.p5.random(this.colors),
			randomId: this.p5.random(1000000),
			alive: true
		}
		Object.assign(def, args)
		Object.assign(this, def)
	}
	update() {
		this.lastP = this.p.copy()
		this.p.add(this.v)
		this.v.add(this.a)

		this.v.x +=
			this.p5.sin(this.p.x / 20 + this.p.x / this.curlSpan) /
			10 /
			(this.r + 0.1) /
			2
		this.v.y +=
			this.p5.cos(this.p.y / 10 + this.p.x / 80) / 10 / (this.r + 0.1) / 2

		this.v.y +=
			this.p5.sin(this.p.x / 20 + this.p.x / this.curlSpan) /
			-10 /
			(this.r + 0.1) /
			40
		this.v.x +=
			this.p5.cos(this.p.y / 10 + this.p.x / 5) /
			-10 /
			(this.r + 0.1) /
			40
		this.r *= this.rFac
		this.v.mult(0.995)

		// this.v.rotate(sin(frameCount/100)/(this.r*this.r+0.01)/500)

		this.v.rotate(
			this.p5.sin(
				this.p5.frameCount / 10 + this.p.x / 50 + this.p.y / 10
			) /
				(this.r * this.r + 0.01) /
				500
		)
	}
	draw() {
		this.p5.push()
		// stroke(255)
		this.p5.stroke(this.color)
		this.p5.noFill()
		this.p5.strokeWeight(this.r * this.p5.random(0.8, 1.6))

		this.p5.line(this.lastP.x, this.lastP.y, this.p.x, this.p.y)
		// translate(this.p.x,this.p.y)
		// circle(0,0,this.r*2)

		// circle(0,0,this.r*2)
		this.p5.pop()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
