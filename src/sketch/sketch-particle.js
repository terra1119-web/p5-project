import P5 from 'p5'
import Sketch from '@/class/Sketch.js'
import { CONSTANT } from '@/util/constant'
// import Mic from '../class/Mic'

// const mic = new Mic()

let g, friction
let n = 100
let particles = []

class Particle {
	constructor(s, vx, vy) {
		this.mass = 1.0
		this.location = s.createVector(s.random(s.width), s.random(s.height))
		this.velocity = s.createVector(0.0, 0.0)
		this.accelaration = s.createVector(vx, vy)
		this.img
		this.s = s
	}

	update () {
		this.velocity.add(this.accelaration)
		this.velocity.mult(1.0 - friction)
		this.location.add(this.velocity)
		this.accelaration.set(0.0, 0.0)
	}

	display (s) {
		s.image(this.img, this.location.x, this.location.y)
	}

	attract (particle, s) {
		const force = new P5.Vector.sub(particle.location, this.location)
		let distance = force.mag()
		distance = s.constrain(distance, 4.0, 1000.0)
		force.normalize()
		const strength = (g * this.mass * particle.mass) / s.pow(distance, 2.0)
		force.mult(strength)
		return force
	}

	applyForce (force) {
		const f = new P5.Vector.div(force, this.mass)
		this.accelaration.add(f)
	}

	wallThrough (s) {
		if (this.location.x > s.width) {
			this.location.x = 0
		}
		if (this.location.x < 0) {
			this.location.x = s.width
		}
		if (this.location.y > s.height) {
			this.location.y = 0
		}
		if (this.location.y < 0) {
			this.location.y = s.height
		}
	}

	createParticleImage (s) {
		const side = 400
		const center = 200

		this.img = s.createImage(side, side)

		const num = s.pow(10, 1.9)

		const Cr = s.random(100, 255)
		const Cg = s.random(100, 255)
		const Cb = s.random(100, 255)

		//while ((Cr/Cg > 0.8 && Cr/Cg < 1.2) && (Cr/Cb > 0.8 && Cr/Cb < 1.2)) {
		//  var Cr =random(50, 255);
		//  var Cg =random(50, 255);
		//  var Cb =random(50, 255);
		//}

		this.img.loadPixels()
		for (let y = 0; y < side; y++) {
			for (let x = 0; x < side; x++) {
				const d = (s.sq(center - x) + s.sq(center - y)) / num
				const col = s.color(Cr / d, Cg / d, Cb / d)
				this.img.set(x, y, col)
			}
		}
		this.img.updatePixels()
		return this.img
	}
}

class SketchTest extends Sketch {
	setup (s) {
		super.setup()

		s.blendMode(s.ADD)
		s.imageMode(s.CENTER)
		s.frameRate(60)
		s.background(0)
		for (let i = 0; i < n; i++) {
			particles[i] = new Particle(s)
			particles[i].createParticleImage(s)
		}

		g = 10
		friction = 0.01
	}

	draw (s) {
		super.draw()

		s.clear()
		s.background(0)
		s.noStroke()
		// s.translate(-w / 2, -h / 2, 0);
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (i != j) {
					var force = particles[i].attract(particles[j], s)
					particles[i].applyForce(force)
				}
			}
		}
		for (let i = 0; i < n; i++) {
			particles[i].update()
			particles[i].wallThrough(s)
			particles[i].display(s)
		}
	}

	mouseClicked (s) {
		particles.push(new Particle(s.mouseX, s.mouseY, 0, 0))
		particles[n].createParticleImage(s)
		n++
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}

