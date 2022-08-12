import P5 from 'p5'
import Sketch from '@/class/Sketch.js'

class Particle {
	constructor(p, vx, vy) {
		this.p = p
		this.mass = 1.0
		this.friction = 0.01
		this.g = 10
		this.location = this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height))
		this.velocity = this.p.createVector(0.0, 0.0)
		this.accelaration = this.p.createVector(vx, vy)
		this.img
	}

	update () {
		this.velocity.add(this.accelaration)
		this.velocity.mult(1.0 - this.friction)
		this.location.add(this.velocity)
		this.accelaration.set(0.0, 0.0)
	}

	display () {
		this.p.image(this.img, this.location.x, this.location.y)
	}

	attract (particle) {
		const force = new P5.Vector.sub(particle.location, this.location)
		let distance = force.mag()
		distance = this.p.constrain(distance, 4.0, 1000.0)
		force.normalize()
		const strength = (this.g * this.mass * particle.mass) / this.p.pow(distance, 2.0)
		force.mult(strength)
		return force
	}

	applyForce (force) {
		const f = new P5.Vector.div(force, this.mass)
		this.accelaration.add(f)
	}

	wallThrough () {
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

	createParticleImage () {
		const side = 400
		const center = 200

		this.img = this.p.createImage(side, side)

		const num = this.p.pow(10, 1.9)

		const Cr = this.p.random(100, 255)
		const Cg = this.p.random(100, 255)
		const Cb = this.p.random(100, 255)

		//while ((Cr/Cg > 0.8 && Cr/Cg < 1.2) && (Cr/Cb > 0.8 && Cr/Cb < 1.2)) {
		//  var Cr =random(50, 255);
		//  var Cg =random(50, 255);
		//  var Cb =random(50, 255);
		//}

		this.img.loadPixels()
		for (let y = 0; y < side; y++) {
			for (let x = 0; x < side; x++) {
				const d = (this.p.sq(center - x) + this.p.sq(center - y)) / num
				const col = this.p.color(Cr / d, Cg / d, Cb / d)
				this.img.set(x, y, col)
			}
		}
		this.img.updatePixels()
		return this.img
	}
}

class SketchTest extends Sketch {
	constructor () {
		super()
		// variables
		this.count = 100
		this.particles = []
	}

	setup () {
		super.setup()

		this.p.blendMode(this.p.ADD)
		this.p.imageMode(this.p.CENTER)
		this.p.frameRate(30)
		this.p.background(0)
		for (let i = 0; i < this.count; i++) {
			this.particles[i] = new Particle(this.p, 0, 0)
			this.particles[i].createParticleImage()
		}
	}

	draw () {
		super.draw()
		if (!this.p) return

		this.p.clear()
		this.p.background(0)
		this.p.noStroke()
		// s.translate(-w / 2, -h / 2, 0);
		for (let i = 0; i < this.count; i++) {
			for (let j = 0; j < this.count; j++) {
				if (i != j) {
					const force = this.particles[i].attract(this.particles[j], this.p)
					this.particles[i].applyForce(force)
				}
			}
		}
		for (let i = 0; i < this.count; i++) {
			this.particles[i].update()
			this.particles[i].wallThrough()
			this.particles[i].display()
		}
	}

	mousePressed () {
		super.mousePressed()

		this.particles.push(new Particle(this.p, 0, 0))
		this.particles[this.count].createParticleImage()
		this.count++
		console.log(this.particles.length)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}

