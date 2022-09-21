'use strict'
import * as p5 from 'p5'
import Sketch from '@/class/Sketch'

class Particle {
	p: p5
	mass: number
	friction: number
	g: number
	location: p5.Vector
	velocity: p5.Vector
	accelaration: p5.Vector
	img: p5.Image

	constructor(p: p5, vx: number, vy: number) {
		this.p = p
		this.mass = 1.0
		this.friction = 0.03
		this.g = 10
		this.location = this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height))
		this.velocity = this.p.createVector(0.0, 0.0)
		this.accelaration = this.p.createVector(vx, vy)
	}

	update(): void {
		this.velocity.add(this.accelaration)
		this.velocity.mult(1.0 - this.friction)
		this.location.add(this.velocity)
		this.accelaration.set(0.0, 0.0)
	}

	display(): void {
		this.p.image(this.img, this.location.x, this.location.y)
	}

	attract(particle: Particle): p5.Vector {
		const force: p5.Vector = p5.Vector.sub(particle.location, this.location)
		let distance: number = force.mag()
		distance = this.p.constrain(distance, 4.0, 1000.0)
		force.normalize()
		const strength: number = (this.g * this.mass * particle.mass) / this.p.pow(distance, 2.0)
		force.mult(strength)
		return force
	}

	applyForce(force: p5.Vector): void {
		const f: p5.Vector = p5.Vector.div(force, this.mass)
		this.accelaration.add(f)
	}

	wallThrough(): void {
		if (this.location.x > this.p.width) {
			this.location.x = 0
		}
		if (this.location.x < 0) {
			this.location.x = this.p.width
		}
		if (this.location.y > this.p.height) {
			this.location.y = 0
		}
		if (this.location.y < 0) {
			this.location.y = this.p.height
		}
	}

	createParticleImage(): p5.Image {
		const side: number = 400
		const center: number = 200

		this.img = this.p.createImage(side, side)

		const num: number = this.p.pow(10, 1.9)

		const Cr: number = this.p.random(100, 255)
		const Cg: number = this.p.random(100, 255)
		const Cb: number = this.p.random(100, 255)

		//while ((Cr/Cg > 0.8 && Cr/Cg < 1.2) && (Cr/Cb > 0.8 && Cr/Cb < 1.2)) {
		//  var Cr =random(50, 255);
		//  var Cg =random(50, 255);
		//  var Cb =random(50, 255);
		//}

		this.img.loadPixels()
		for (let y: number = 0; y < side; y++) {
			for (let x: number = 0; x < side; x++) {
				const d: number = (this.p.sq(center - x) + this.p.sq(center - y)) / num
				const col: p5.Color = this.p.color(Cr / d, Cg / d, Cb / d)
				this.img.set(x, y, col)
			}
		}
		this.img.updatePixels()
		return this.img
	}
}

class SketchTest extends Sketch {
	private count: number
	private particles: Particle[]
	// private p: p5

	constructor() {
		super({})
		// variables
		this.count = 100
		this.particles = []
	}

	setup(): void {
		super.setup()

		this.p.blendMode(this.p.ADD)
		this.p.imageMode(this.p.CENTER)
		this.p.frameRate(30)
		this.p.background(0)
		for (let i: number = 0; i < this.count; i++) {
			this.particles[i] = new Particle(this.p, 0, 0)
			this.particles[i].createParticleImage()
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.clear(0, 0, 0, 0)
		this.p.background(0)
		this.p.noStroke()
		// s.translate(-w / 2, -h / 2, 0);
		for (let i: number = 0; i < this.count; i++) {
			for (let j: number = 0; j < this.count; j++) {
				if (i != j) {
					const force: p5.Vector = this.particles[i].attract(this.particles[j])
					this.particles[i].applyForce(force)
				}
			}
		}
		for (let i: number = 0; i < this.count; i++) {
			this.particles[i].update()
			this.particles[i].wallThrough()
			this.particles[i].display()
		}
	}

	mousePressed(): void {
		super.mousePressed()

		this.particles.push(new Particle(this.p, 0, 0))
		this.particles[this.count].createParticleImage()
		this.count++
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}