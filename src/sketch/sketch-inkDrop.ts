'use strict'
import Sketch from '@/class/Sketch'

class Pointer {
	p: p5
	dist: number
	rad: number
	speed: number
	acc: number
	pos: p5.Vector
	finalSize: number
	downSpeed: p5.Vector
	downAcc: p5.Vector

	constructor(p: p5, rad: number, acc: number, finalSize: number) {
		this.p = p
		this.dist = 1
		this.rad = rad
		this.speed = 0
		this.acc = acc
		this.pos = this.p.createVector(0, 0)
		this.finalSize = finalSize
		this.downSpeed = this.p.createVector(0, 0.01)
		// this.downSpeed = this.p.createVector(this.p.random(-0.1, 0.1), 0.01)
		this.downAcc = this.p.createVector(0, 0.05 + this.acc / 500)
	}

	move(): void {
		if (this.dist <= this.finalSize) {
			this.speed += this.acc
			this.dist += this.speed
			this.pos = this.p.createVector(
				this.p.cos(this.rad) * this.dist,
				this.p.sin(this.rad) * this.dist
			)
		} else {
			this.downSpeed.add(this.downAcc)
			this.pos.add(this.downSpeed)
		}
	}
}

class Drip {
	p: p5
	splat: Pointer[]
	color: p5.Color
	x: number
	y: number
	death: number
	noiseStart: number

	constructor(
		p: p5,
		x: number,
		y: number,
		extent: number,
		h: number,
		s: number,
		b: number
	) {
		this.p = p
		this.p.colorMode(this.p.HSB, 360, 100, 100, 100)
		this.splat = []
		this.color = this.p.color(h, s, b)
		this.x = x
		this.y = y
		this.death = 500
		this.noiseStart = this.p.random(1000)
		for (
			let i: number = this.noiseStart;
			i < this.noiseStart + this.p.TWO_PI;
			i += 0.1
		) {
			const acc: number = this.p.noise(i)
			this.splat.push(new Pointer(this.p, i, acc, extent))
		}
	}

	move(rains: Drip[]): void {
		for (let n of this.splat) {
			n.move()
		}
		this.death -= 1
		if (this.death < 1) {
			const index: number = rains.indexOf(this)
			rains.splice(index, 1)
		}
	}

	show(): void {
		this.p.noStroke()
		this.color.setAlpha(80)
		this.p.fill(this.color)
		this.p.push()
		this.p.translate(this.x, this.y)
		this.p.beginShape()
		for (let i: number = 0; i < this.splat.length; i++) {
			this.p.curveVertex(this.splat[i].pos.x, this.splat[i].pos.y)
		}
		this.p.endShape(this.p.CLOSE)
		this.p.pop()
	}
}

class SketchTest extends Sketch {
	// property
	rains: Drip[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: true
		})
		// initialize
		this.rains = []
	}

	setup(): void {
		super.setup()

		// this.p.blendMode(this.p.EXCLUSION)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		const hue: number = this.getHue()
		if (this.p.frameCount % 10 === 0) {
			const s: number = this.p.random(70, 100)
			const micVolume: number = this.mic.getLevel()
			const volume: number = this.p.map(micVolume, 0, 1, 0, 1000)
			const b: number = this.p.map(volume, 0, 1, 20, 100)

			this.rains.push(
				new Drip(
					this.p,
					this.p.random(this.p.width),
					this.p.random(-100, this.p.height),
					this.p.random(5, 30),
					hue,
					s,
					b
				)
			)
		}

		for (let i: number = this.rains.length - 1; i >= 0; i--) {
			this.rains[i].move(this.rains)
			this.rains[i].show()
		}

		this.p.fill(0, 0.8)
		this.p.rect(0, 0, this.p.width, this.p.height)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
