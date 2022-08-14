'use strict'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
	constructor() {
		super({
			renderer: 'WEBGL'
		})
		// variables
		this.count = 300
		this.particles_a = []
		this.particles_b = []
		this.particles_c = []
		this.fade = 255
		this.radius = 3
		this.noiseStrength = 1.2
	}

	setup() {
		super.setup()

		this.p.noStroke()
		for (let i = 0; i < this.count; i++) {
			const loc_a = this.p.createVector(this.p.random(this.p.width) + this.p.width * 0.5 - this.p.width * 0.5, this.p.random(this.p.height) + this.p.height * 0.5 - this.p.height * 0.5, 2)
			const angle_a = this.p.random(this.p.TWO_PI)
			const dir_a = this.p.createVector(this.p.cos(angle_a), this.p.sin(angle_a))

			const loc_b = this.p.createVector(this.p.random(this.p.width) + this.p.width * 0.5 - this.p.width * 0.5, this.p.random(this.p.height) + this.p.height * 0.5 - this.p.height * 0.5, 2)
			const angle_b = this.p.random(this.p.TWO_PI)
			const dir_b = this.p.createVector(this.p.cos(angle_b), this.p.sin(angle_b))

			const loc_c = this.p.createVector(this.p.random(this.p.width) + this.p.width * 0.5 - this.p.width * 0.5, this.p.random(this.p.height) + this.p.height * 0.5 - this.p.height * 0.5, 2)
			const angle_c = this.p.random(this.p.TWO_PI)
			const dir_c = this.p.createVector(this.p.cos(angle_c), this.p.sin(angle_c))

			this.particles_a[i] = new Particle(this.p, loc_a, dir_a, 0.5)
			this.particles_b[i] = new Particle(this.p, loc_b, dir_b, 0.6)
			this.particles_c[i] = new Particle(this.p, loc_c, dir_c, 0.75)
		}
	}

	draw() {
		super.draw()
		if (!this.p) return

		this.p.fill(0, 10)
		this.p.noStroke()
		this.p.rect(0, 0, this.p.width, this.p.height)

		for (let i = 0; i < this.count; i++) {
			this.p.fill(191, 19, 99, this.fade)
			this.particles_a[i].move()
			this.particles_a[i].update(this.radius)
			this.particles_a[i].checkEdges()

			this.p.fill(57, 166, 163, this.fade)
			this.particles_b[i].move()
			this.particles_b[i].update(this.radius)
			this.particles_b[i].checkEdges()

			this.p.fill(222, 238, 234, this.fade)
			this.particles_c[i].move()
			this.particles_c[i].update(this.radius)
			this.particles_c[i].checkEdges()
		}
	}
}

class Particle {
	constructor(p, loc_, dir_, speed_) {
		this.p = p
		this.loc = loc_
		this.dir = dir_
		this.speed = speed_
		this.d = 1
		this.noiseScale = 1000
	}

	update(r) {
		this.p.ellipse(this.loc.x, this.loc.y, r)
	}

	checkEdges() {
		if (this.loc.x < 0 || this.loc.x > this.p.width || this.loc.y < 0 || this.loc.y > this.p.height) {
			this.loc.x = this.p.random(this.p.width) + this.p.width * 0.5 - this.p.width * 0.5
			this.loc.y = this.p.random(this.p.height) + this.p.height * 0.5 - this.p.height * 0.5
		}
	}

	move() {
		this.angle = this.p.noise(this.loc.x / this.noiseScale, this.loc.y / this.noiseScale, this.p.frameCount / this.noiseScale) * this.p.TWO_PI * this.noiseScale
		this.dir.x = this.p.cos(this.angle) + this.p.sin(this.angle) - this.p.sin(this.angle)
		this.dir.y = this.p.sin(this.angle) - this.p.cos(this.angle) * this.p.sin(this.angle)
		this.vel = this.dir.copy()
		this.vel.mult(this.speed * this.d)
		this.loc.add(this.vel)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}