'use strict'
import Sketch from '@/class/Sketch'

class Particle {
	p: p5
	location: p5.Vector
	velocity: p5.Vector
	acceleration: p5.Vector
	alpha: number
	palpha: number
	amp: number
	rate: number

	constructor(p: p5, x: number, y: number, r: number, a: number) {
		this.p = p
		this.location = this.p.createVector(x, y)
		this.velocity = this.p.createVector(this.p.random(-1, 1), this.p.random(-1, 1))
		this.acceleration = this.p.createVector()
		this.alpha = this.palpha = a
		this.amp = 3; // size of the particle
		this.rate = r
	}

	//update the velociy and location of particle
	update(particles: Particle[]): void {
		this.acceleration.add(this.p.createVector((this.p.noise(this.location.x) * 2 - 1), (this.p.noise(this.location.y) * 2 - 1)))
		this.velocity.add(this.acceleration)
		this.acceleration.set(0, 0)
		this.location.add(this.velocity)
		this.alpha -= this.rate
		// this.amp -= this.rate;
		// here is the recursion condition
		if (this.alpha <= this.palpha * 0.25 && this.palpha > 10) {
			particles.push(new Particle(this.p, this.location.x, this.location.y, this.rate * 0.25, this.palpha * 0.5))
		}
	}

	//show the particles
	show(): void {
		this.p.noStroke()
		this.p.fill(this.p.random(360), this.p.random(100), this.p.random(100), this.alpha)
		this.p.ellipse(this.location.x, this.location.y, this.amp)
	}

}

class SketchTest extends Sketch {
	// property
	particles: Particle[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})

		// initialize
		this.particles = []
	}


	setup(): void {
		super.setup()
		this.p.colorMode(this.p.HSB, 360, 100, 100, 100)
		this.p.blendMode(this.p.SCREEN)
		this.p.background(0)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0, 0, 0, 10)
		if (this.p.random(100) > 80) {
			this.particles.push(new Particle(this.p, this.p.random(this.p.width), this.p.random(this.p.height), 5, 150))
		}
		// update and show the particles
		for (let i: number = this.particles.length - 2; i >= 0; i--) {
			this.particles[i].update(this.particles)
			this.particles[i].show()
			if (this.particles[i].alpha <= 10) this.particles.splice(i, 10)
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}