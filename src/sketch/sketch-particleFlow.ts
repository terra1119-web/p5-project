'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	count: number
	particles_a: Particle[]
	particles_b: Particle[]
	particles_c: Particle[]
	fade: number
	radius: number

	constructor() {
		super({
			// renderer: 'WEBGL'
		})
		// initialize
		this.count = 400
		this.particles_a = []
		this.particles_b = []
		this.particles_c = []
		this.fade = 255
		this.radius = 3
	}

	setup(): void {
		super.setup()

		this.p.noStroke()
		for (let i: number = 0; i < this.count; i++) {
			const loc_a: p5.Vector = this.p.createVector(
				this.p.random(this.p.width) +
					this.p.width * 0.5 -
					this.p.width * 0.5,
				this.p.random(this.p.height) +
					this.p.height * 0.5 -
					this.p.height * 0.5,
				2
			)
			const angle_a: number = this.p.random(this.p.TWO_PI)
			const dir_a: p5.Vector = this.p.createVector(
				this.p.cos(angle_a),
				this.p.sin(angle_a)
			)

			const loc_b: p5.Vector = this.p.createVector(
				this.p.random(this.p.width) +
					this.p.width * 0.5 -
					this.p.width * 0.5,
				this.p.random(this.p.height) +
					this.p.height * 0.5 -
					this.p.height * 0.5,
				2
			)
			const angle_b: number = this.p.random(this.p.TWO_PI)
			const dir_b: p5.Vector = this.p.createVector(
				this.p.cos(angle_b),
				this.p.sin(angle_b)
			)

			const loc_c: p5.Vector = this.p.createVector(
				this.p.random(this.p.width) +
					this.p.width * 0.5 -
					this.p.width * 0.5,
				this.p.random(this.p.height) +
					this.p.height * 0.5 -
					this.p.height * 0.5,
				2
			)
			const angle_c: number = this.p.random(this.p.TWO_PI)
			const dir_c: p5.Vector = this.p.createVector(
				this.p.cos(angle_c),
				this.p.sin(angle_c)
			)

			this.particles_a[i] = new Particle(this.p, loc_a, dir_a, 0.5)
			this.particles_b[i] = new Particle(this.p, loc_b, dir_b, 0.6)
			this.particles_c[i] = new Particle(this.p, loc_c, dir_c, 0.75)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.fill(0, 10)
		this.p.noStroke()
		this.p.rect(0, 0, this.p.width, this.p.height)

		for (let i: number = 0; i < this.count; i++) {
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
	p: p5
	loc: p5.Vector
	dir: p5.Vector
	speed: number
	d: number
	noiseScale: number
	angle: number
	vel: p5.Vector

	constructor(p: p5, loc_: p5.Vector, dir_: p5.Vector, speed_: number) {
		this.p = p
		this.loc = loc_
		this.dir = dir_
		this.speed = speed_
		this.d = 1
		this.noiseScale = 1000
	}

	update(r: number): void {
		this.p.ellipse(this.loc.x, this.loc.y, r)
	}

	checkEdges(): void {
		if (
			this.loc.x < 0 ||
			this.loc.x > this.p.width ||
			this.loc.y < 0 ||
			this.loc.y > this.p.height
		) {
			this.loc.x =
				this.p.random(this.p.width) +
				this.p.width * 0.5 -
				this.p.width * 0.5
			this.loc.y =
				this.p.random(this.p.height) +
				this.p.height * 0.5 -
				this.p.height * 0.5
		}
	}

	move(): void {
		this.angle =
			this.p.noise(
				this.loc.x / this.noiseScale,
				this.loc.y / this.noiseScale,
				this.p.frameCount / this.noiseScale
			) *
			this.p.TWO_PI *
			this.noiseScale
		this.dir.x =
			this.p.cos(this.angle) +
			this.p.sin(this.angle) -
			this.p.sin(this.angle)
		this.dir.y =
			this.p.sin(this.angle) -
			this.p.cos(this.angle) * this.p.sin(this.angle)
		this.vel = this.dir.copy()
		this.vel.mult(this.speed * this.d)
		this.loc.add(this.vel)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
