'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	minSide: number
	objs: (Orb | Sparkle | Ripple | Shapes)[]
	colors: string[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
		this.objs = []
		this.colors = [
			'#ffffff',
			'#ffffff',
			'#ffffff',
			'#ffffff',
			'#ffffff',
			'#ffffff'
		]
	}

	setup(): void {
		super.setup()

		this.minSide = this.p.min(this.p.width, this.p.height)
		this.p.rectMode(this.p.CENTER)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		for (let i of this.objs) {
			i.run()
		}

		for (let i = 0; i < this.objs.length; i++) {
			if (this.objs[i].isDead) {
				this.objs.splice(i, 1)
			}
		}

		if (this.p.frameCount % this.p.random([10, 60, 120]) == 0) {
			this.addObjs()
		}
	}

	addObjs() {
		let x = this.p.random(-0.1, 1.1) * this.p.width
		let y = this.p.random(-0.1, 1.1) * this.p.height

		for (let i = 0; i < 20; i++) {
			this.objs.push(new Orb(this.p, this.minSide, this.colors, x, y))
		}

		for (let i = 0; i < 50; i++) {
			this.objs.push(new Sparkle(this.p, this.minSide, this.colors, x, y))
		}

		for (let i = 0; i < 2; i++) {
			this.objs.push(new Ripple(this.p, this.minSide, this.colors, x, y))
		}

		for (let i = 0; i < 10; i++) {
			this.objs.push(new Shapes(this.p, this.minSide, this.colors, x, y))
		}
	}
}

class Orb {
	p: p5
	minSide: number
	colors: string[]
	x: number
	y: number
	xx: number
	yy: number
	radius: number
	maxRadius: number
	rStep: number
	maxCircleD: number
	circleD: number
	isDead: boolean
	ang: number
	angStep: number
	xStep: number
	yStep: number
	life: number
	lifeSpan: number
	col: number
	pos: p5.Vector[]
	followers: number

	constructor(p, minSide, colors, x, y) {
		this.p = p
		this.minSide = minSide
		this.colors = colors
		this.x = x
		this.y = y
		this.radius = 0
		this.maxRadius = minSide * 0.03
		this.rStep = this.p.random(1)
		this.maxCircleD = minSide * 0.005
		this.circleD = minSide * 0.005
		this.isDead = false
		this.ang = this.p.random(10)
		this.angStep = this.p.random([-1, 1]) * this.p.random(0.3, 0.1)
		this.xStep =
			this.p.random([-1, 1]) *
			minSide *
			this.p.random(0.01) *
			this.p.random(this.p.random())
		this.yStep =
			this.p.random([-1, 1]) *
			minSide *
			this.p.random(0.01) *
			this.p.random(this.p.random())
		this.life = 0
		this.lifeSpan = this.p.int(this.p.random(50, 180))
		this.col = this.p.random(colors)
		this.pos = []
		this.pos.push(this.p.createVector(this.x, this.y))
		this.followers = 10
	}

	show() {
		this.xx = this.x + this.radius * this.p.cos(this.ang)
		this.yy = this.y + this.radius * this.p.sin(this.ang)
		this.p.push()
		this.p.noStroke()
		this.p.noFill()
		this.p.stroke(this.col)
		this.p.strokeWeight(this.circleD)
		this.p.beginShape()
		for (let i = 0; i < this.pos.length; i++) {
			this.p.vertex(this.pos[i].x, this.pos[i].y)
		}
		this.p.endShape()
		this.p.pop()
	}

	move() {
		this.ang += this.angStep
		this.x += this.xStep
		this.y += this.yStep
		this.radius += this.rStep
		this.radius = this.p.constrain(this.radius, 0, this.maxRadius)
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true
		}
		this.circleD = this.p.map(
			this.life,
			0,
			this.lifeSpan,
			this.maxCircleD,
			1
		)
		this.pos.push(this.p.createVector(this.xx, this.yy))
		if (this.pos.length > this.followers) {
			this.pos.splice(0, 1)
		}
	}
	run() {
		this.show()
		this.move()
	}
}

class Sparkle {
	p: p5
	minSide: number
	colors: string[]
	x: number
	y: number
	r: number
	a: number
	x0: number
	y0: number
	targetX: number
	targetY: number
	life: number
	lifeSpan: number
	col: number
	sw: number
	isDead: boolean
	constructor(p, minSide, colors, x, y) {
		this.p = p
		this.minSide = minSide
		this.colors = colors
		this.x = x
		this.y = y
		this.r = minSide * p.random(0.4)
		this.a = this.p.random(10)
		this.x0 = x
		this.y0 = y
		this.targetX = x + this.r * this.p.cos(this.a)
		this.targetY = y + this.r * this.p.sin(this.a)
		this.life = 0
		this.lifeSpan = this.p.int(this.p.random(50, 280))
		this.col = this.p.random(colors)
		this.sw = minSide * this.p.random(0.01)
		this.isDead = false
	}

	show() {
		this.p.noFill()
		this.p.strokeWeight(this.sw)
		this.p.stroke(this.col)
		if (this.p.random() < 0.5) {
			this.p.point(this.x, this.y)
		}
	}

	move() {
		let nrm = this.p.norm(this.life, 0, this.lifeSpan)
		this.x = this.p.lerp(this.x0, this.targetX, this.easeOutCirc(nrm))
		this.y = this.p.lerp(this.y0, this.targetY, this.easeOutCirc(nrm))
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true
		}
	}

	run() {
		this.show()
		this.move()
	}

	easeOutCirc(x) {
		return Math.sqrt(1 - Math.pow(x - 1, 2))
	}
}

class Ripple {
	p: p5
	minSide: number
	colors: string[]
	x: number
	y: number
	life: number
	lifeSpan: number
	col: number
	maxSw: number
	sw: number
	d: number
	maxD: number
	isDead: boolean
	constructor(p, minSide, colors, x, y) {
		this.p = p
		this.minSide = minSide
		this.colors = colors
		this.x = x
		this.y = y
		this.life = 0
		this.lifeSpan = this.p.int(this.p.random(50, 150))
		this.col = this.p.random(colors)
		this.maxSw = minSide * 0.005
		this.sw = minSide * 0.005
		this.d = 0
		this.maxD = minSide * this.p.random(0.1, 0.5)
		this.isDead = false
	}

	show() {
		this.p.noFill()
		this.p.stroke(this.col)
		this.p.strokeWeight(this.sw)
		this.p.circle(this.x, this.y, this.d)
	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true
		}
		let nrm = this.p.norm(this.life, 0, this.lifeSpan)
		this.sw = this.p.lerp(this.maxSw, 0.1, this.easeOutCirc(nrm))
		this.d = this.p.lerp(0, this.maxD, this.easeOutCirc(nrm))
	}

	run() {
		this.show()
		this.move()
	}

	easeOutCirc(x) {
		return Math.sqrt(1 - Math.pow(x - 1, 2))
	}
}

class Shapes {
	p: p5
	minSide: number
	colors: string[]
	x: number
	y: number
	life: number
	lifeSpan: number
	col: number
	sw: number
	maxSw: number
	w: number
	ang: number
	angStep: number
	shapeType: number
	r: number
	a: number
	x0: number
	y0: number
	targetX: number
	targetY: number
	isDead: boolean
	constructor(p, minSide, colors, x, y) {
		this.p = p
		this.minSide = minSide
		this.colors = colors
		this.x = x
		this.y = y
		this.life = 0
		this.lifeSpan = this.p.int(this.p.random(50, 222))
		this.col = this.p.random(colors)
		this.sw = minSide * 0.005
		this.maxSw = minSide * 0.005
		this.w = minSide * this.p.random(0.05)
		this.ang = this.p.random(10)
		this.angStep = this.p.random([-1, 1]) * this.p.random(0.05)
		this.shapeType = this.p.int(this.p.random(3))
		this.r = minSide * this.p.random(0.4)
		this.a = this.p.random(10)
		this.x0 = x
		this.y0 = y
		this.targetX = x + this.r * this.p.cos(this.a)
		this.targetY = y + this.r * this.p.sin(this.a)
		this.isDead = false
	}

	show() {
		this.p.push()
		this.p.translate(this.x, this.y)
		this.p.rotate(this.ang)
		this.p.noFill()
		this.p.strokeWeight(this.sw)
		this.p.stroke(this.col)
		if (this.shapeType == 0) {
			this.p.square(0, 0, this.w)
		} else if (this.shapeType == 1) {
			this.p.circle(0, 0, this.w)
		} else if (this.shapeType == 2) {
			this.p.line(0, this.w / 2, 0, -this.w / 2)
			this.p.line(this.w / 2, 0, -this.w / 2, 0)
		}
		this.p.pop()
	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true
		}
		let nrm = this.p.norm(this.life, 0, this.lifeSpan)
		this.x = this.p.lerp(this.x0, this.targetX, this.easeOutCirc(nrm))
		this.y = this.p.lerp(this.y0, this.targetY, this.easeOutCirc(nrm))
		this.sw = this.p.lerp(this.maxSw, 0.1, this.easeOutCirc(nrm))
		this.ang += this.angStep
	}

	run() {
		this.show()
		this.move()
	}

	easeOutCirc(x) {
		return Math.sqrt(1 - Math.pow(x - 1, 2))
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
