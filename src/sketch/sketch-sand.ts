'use strict'
import Sketch from '@/class/Sketch'

type STONE_TYPE = {
	pos: p5.Vector
	r: number
}

class SketchTest extends Sketch {
	// property
	stroker: p5.Color
	beach: Sand[]
	stones: STONE_TYPE[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true
		})
		// initialize
		this.beach = []
		this.stones = []
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(1)
		this.p.background(0)
		this.stroker = this.p.color('#eeeff0')
		this.stroker.setAlpha(30)
		for (let y = -50; y < this.p.height + 50; y += this.p.random(80, 120)) {
			let x = this.p.map(
				this.p.noise(y / 10),
				0,
				1,
				this.p.width / 6,
				this.p.width - this.p.width / 4
			)
			const stone = {
				pos: this.p.createVector(x, y),
				r: this.p.random(this.p.height / 70, this.p.height / 12)
			}
			this.stones.push(stone)
		}

		for (
			let y = -this.p.height / 10;
			y < this.p.height + this.p.height / 10;
			y++
		) {
			this.beach.push(
				new Sand(
					this.p,
					-10,
					y + this.p.random(-1, 1),
					this.stones,
					this.beach,
					this.stroker
				)
			)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		if (this.p.frameCount < 100 && this.p.frameCount % 2 == 0) {
			for (
				let y = -this.p.height / 10;
				y < this.p.height + this.p.height / 4;
				y++
			) {
				this.beach.push(
					new Sand(
						this.p,
						-10,
						y,
						this.stones,
						this.beach,
						this.stroker
					)
				)
			}
		}

		for (let i = this.beach.length - 1; i >= 0; i--) {
			this.beach[i].move()
			this.beach[i].show()
			this.beach[i].end()
		}
	}
}

class Sand {
	p: p5
	pos: p5.Vector
	acc: p5.Vector
	vel: p5.Vector
	stones: STONE_TYPE[]
	beach: Sand[]
	stroker: p5.Color

	constructor(
		p: p5,
		x: number,
		y: number,
		stones: STONE_TYPE[],
		beach: Sand[],
		stroker: p5.Color
	) {
		this.p = p
		this.pos = this.p.createVector(x, y)
		this.acc = this.p.createVector(this.p.random(0.02, 0.05), 0)
		this.vel = this.p.createVector(0, 0)
		this.stones = stones
		this.beach = beach
		this.stroker = stroker
	}

	move() {
		for (let i = 0; i < this.stones.length; i++) {
			let d = p5.Vector.dist(this.pos, this.stones[i].pos)
			if (d <= this.stones[i].r) {
				let yvOff = (this.pos.y - this.stones[i].pos.y) * -2
				this.acc.add(0, yvOff)
			}
		}
		let yoff = this.p.map(
			this.p.noise(
				this.p.frameCount / 50,
				this.pos.x / 10,
				this.pos.y / 50
			),
			0,
			1,
			-0.002,
			0.002
		)
		this.acc.add(0, yoff)
		this.vel.add(this.acc)
		this.pos.add(this.vel)
	}

	show() {
		this.p.stroke(this.stroker)
		this.p.point(this.pos.x, this.pos.y)
	}

	end() {
		if (
			this.pos.x > this.p.width + 1 ||
			this.pos.y < -this.p.height / 10 ||
			this.pos.y > this.p.height + this.p.height / 10
		) {
			let index = this.beach.indexOf(this)
			this.beach.splice(index, 1)
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
