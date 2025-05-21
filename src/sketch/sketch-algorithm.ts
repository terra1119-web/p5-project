'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

type ParticleType = {
	x: number
	y: number
	char: string
	size: number
	rotation: number
	dist: number | undefined
}

class SketchTest extends Sketch {
	// property
	NUM_PARTICLES: number
	CHARS: string[]
	texts: ParticleType[]
	font: p5.Font

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: false,
		})
		// initialize
		this.NUM_PARTICLES = 1000
		this.CHARS =
			'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'.split(
				''
			)
		this.texts = []
	}

	preload(): void {
		super.preload()

		this.font = this.p.loadFont('images/text-draw/Roboto-Bold.ttf')
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.textFont(this.font)
		this.p.textAlign(this.p.CENTER, this.p.CENTER)

		for (let i = 0; i < this.NUM_PARTICLES; i++) {
			this.createParticle()
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(25, 10)

		this.p.fill(229, 255, 255)
		this.p.stroke(204, 229, 229)
		this.p.strokeWeight(1)

		// sort by distance from center, so that the
		// closest particles to center are drawn last
		this.texts.sort((a, b) => a.dist - b.dist)

		for (let t of this.texts) {
			this.p.translate(t.x, t.y)
			this.p.rotate(t.rotation)
			this.p.textSize(t.size)
			this.p.text(t.char, 0, 0)
			this.p.resetMatrix()

			// reset if too close to center
			if (this.p.abs(t.x) < 10 && this.p.abs(t.y) < 10) {
				const angle = this.p.random(this.p.TWO_PI)
				t.x = this.p.cos(angle) * 2000
				t.y = this.p.sin(angle) * 2000
				t.size = (this.p.frameCount % 600) / 10
				t.rotation = this.p.random(this.p.TWO_PI)
			} else {
				// update
				t.x *= 0.98
				t.y *= 0.98
				t.size -= 0.5
				t.dist = this.p.dist(t.x, t.y, 0, 0)
				t.rotation += 0.02
			}
		}

		// this.p.fill(25, 0)
		// this.p.stroke(250, 1)
		// this.p.strokeWeight(this.p.width / 10)
		// this.p.textSize(this.p.width / 3)
		// this.p.text('Wander', 0, 0)
	}

	createParticle() {
		const angle = this.p.random(this.p.TWO_PI)
		const radius = this.p.random(2000)

		const particle = {
			x: this.p.cos(angle) * radius,
			y: this.p.sin(angle) * radius,
			char: this.CHARS[this.p.floor(this.p.random(this.CHARS.length))],
			size: 2,
			rotation: this.p.random(this.p.TWO_PI),
			dist: undefined,
		}
		this.texts.push(particle)
		return particle
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
