'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	particles: Particle[]
	x: number
	y: number
	constructor() {
		super({ useMic: true })
		// initialize
		this.particles = []
	}

	setup(): void {
		super.setup()

		this.x = this.p.width / 1
		this.y = this.p.height / 1
		this.p.background(0)
		this.p.strokeWeight(0.1)
		this.p.blendMode(this.p.ADD)
		this.p.frameRate(30) // Adjust the frame rate to reduce lag

		// Initialize particles (reduce the number to reduce lag)
		for (let i = 0; i < 100; i++) {
			this.particles.push(
				new Particle(
					this.p,
					this.p.random(this.p.width),
					this.p.random(this.p.height)
				)
			)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0, 10)

		for (let i = 0; i < this.p.TWO_PI; i += 0.001) {
			const px = this.x
			const py = this.y
			this.x =
				this.p.noise(i + this.p.frameCount / 200 + i) * this.p.width
			this.y =
				this.p.noise(i + this.p.frameCount / 150 + i + 100) *
				this.p.height

			const micVolume: number = this.mic.getLevel()
			const volume: number = this.p.map(micVolume, 0, 0.05, 0, 255)
			// Modify the stroke color to include a mix of colors (red and green)
			this.p.stroke(
				this.p.map(this.x, 0, this.p.width, 0, 255),
				this.p.map(this.y, 0, this.p.height, 0, 255),
				volume,
				volume
			)

			if (i != 0) {
				this.p.line(px, py, this.x, this.y)
			}
		}

		// Update and display particles
		for (const particle of this.particles) {
			particle.update()
			particle.display()
		}
	}
}

class Particle {
	p: p5
	pos: p5.Vector
	vel: p5.Vector
	acc: p5.Vector
	size: number
	constructor(p: p5, x: number, y: number) {
		this.p = p
		this.pos = this.p.createVector(x, y)
		this.vel = p5.Vector.random2D().mult(this.p.random(1, 3))
		this.acc = this.p.createVector()
		this.size = this.p.random(2, 5)
	}

	update() {
		this.vel.add(this.acc)
		this.pos.add(this.vel)
		this.acc.mult(0) // Reset acceleration

		// Add some noise to particle movement
		const angle =
			this.p.noise(
				this.pos.x * 0.01,
				this.pos.y * 0.01,
				this.p.frameCount * 0.01
			) * this.p.TWO_PI
		const gravity = p5.Vector.fromAngle(angle).mult(0.1)
		this.applyForce(gravity)
	}

	applyForce(force: p5.Vector) {
		this.acc.add(force)
	}

	display() {
		// Sample the background color at the particle's position
		const bgColor = this.p.get(
			this.p.floor(this.pos.x),
			this.p.floor(this.pos.y)
		)

		// Set the fill color with opacity (you can adjust the opacity value)
		this.p.fill(
			this.p.red(bgColor),
			this.p.green(bgColor),
			this.p.blue(bgColor),
			100
		) // Change 100 to your desired opacity value

		this.p.noStroke()
		this.p.ellipse(this.pos.x, this.pos.y, this.size)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
