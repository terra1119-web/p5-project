'use strict'
import Sketch from '@/class/Sketch.js'

// variables
let count = 1000

var particles_a = []
var particles_b = []
var particles_c = []
var fade = 200
var radius = 3

let w = 300
let h = 300

let noiseScale = 300
let noiseStrength = 1.2

class SketchTest extends Sketch {
	preload (s) {
		super.preload(s)
	}

	setup (s) {
		super.setup(s)

		w = s.width
		h = s.height

		s.noStroke()

		for (let i = 0; i < count; i++) {
			let loc_a = s.createVector(s.random(w) + s.width * 0.5 - w * 0.5, s.random(h) + s.height * 0.5 - h * 0.5, 2)
			let angle_a = s.random(s.TWO_PI)
			let dir_a = s.createVector(s.cos(angle_a), s.sin(angle_a))

			let loc_b = s.createVector(s.random(w) + s.width * 0.5 - w * 0.5, s.random(h) + s.height * 0.5 - h * 0.5, 2)
			let angle_b = s.random(s.TWO_PI)
			let dir_b = s.createVector(s.cos(angle_b), s.sin(angle_b))

			let loc_c = s.createVector(s.random(w) + s.width * 0.5 - w * 0.5, s.random(h) + s.height * 0.5 - h * 0.5, 2)
			let angle_c = s.random(s.TWO_PI)
			let dir_c = s.createVector(s.cos(angle_c), s.sin(angle_c))

			particles_a[i] = new Particle(s, loc_a, dir_a, 0.5)
			particles_b[i] = new Particle(s, loc_b, dir_b,0.6)
			particles_c[i] = new Particle(s, loc_c, dir_c, 0.75)
		}
	}

	draw (s) {
		super.draw(s)

		s.fill(0,7)
		s.noStroke()
		s.rect(0, 0, s.width, s.height)

		for (let i = 0; i < count; i++) {
			s.fill(191, 19, 99, fade)
			particles_a[i].move()
			particles_a[i].update(radius)
			particles_a[i].checkEdges()

			s.fill (57,166,163, fade)
			particles_b[i].move()
			particles_b[i].update(radius)
			particles_b[i].checkEdges()

			s.fill(222,238,234,fade)
			particles_c[i].move()
			particles_c[i].update(radius)
			particles_c[i].checkEdges()
		}
	}

	mousePressed (s) {
		super.mousePressed(s)
	}

	keyTyped (s) {
		super.keyTyped(s)
	}

	keyPressed (s) {
		super.keyPressed(s)
	}

	doubleClicked (s) {
		super.doubleClicked(s)
	}
}

class Particle {
	constructor (s, loc_, dir_, speed_) {
		this.loc = loc_
		this.dir = dir_
		this.speed = speed_
		this.d = 1
		this.s = s
	}

	// run (s) {
	// 	this.move();
	// 	this.checkEdges(s);
	// 	this.update(s);
	// }

	update (r) {
		this.s.ellipse(this.loc.x, this.loc.y, r)
	}

	checkEdges () {
		if (this.loc.x < 0 || this.loc.x > this.s.width || this.loc.y < 0 || this.loc.y > this.s.height) {
			this.loc.x = this.s.random(w) + this.s.width * 0.5 - w * 0.5
			this.loc.y = this.s.random(h) + this.s.height * 0.5 - h * 0.5
		}
	}

	move () {
		this.angle = this.s.noise(this.loc.x / noiseScale, this.loc.y / noiseScale, this.s.frameCount / noiseScale) * this.s.TWO_PI * noiseStrength;
		this.dir.x = this.s.cos(this.angle) + this.s.sin(this.angle) - this.s.sin(this.angle);
		this.dir.y = this.s.sin(this.angle) - this.s.cos(this.angle) * this.s.sin(this.angle);
		this.vel = this.dir.copy();
		this.vel.mult(this.speed * this.d);
		this.loc.add(this.vel);
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}