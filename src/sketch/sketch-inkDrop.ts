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

	constructor(p:p5, rad: number, acc: number, finalSize: number) {
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
		if(this.dist <= this.finalSize) {
			this.speed += this.acc
			this.dist += this.speed
			this.pos = this.p.createVector(this.p.cos(this.rad) * this.dist, this.p.sin(this.rad) * this.dist)
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
	extent: number
	noiseStart: number
	colors: string[]

	constructor(p:p5, x: number, y: number, extent: number) {
		this.p = p
		this.colors = ["#75b9be","#696d7d","#d72638","#f49d37","#140f2d"]
		this.splat = []
		this.color = this.p.color(this.p.random(this.colors))
		this.x = x
		this.y = y
		this.death = 500
		this.extent = extent
		this.noiseStart = this.p.random(1000)
		for(let i: number = this.noiseStart; i < this.noiseStart + this.p.TWO_PI; i += 0.1) {
			const acc: number = this.p.noise(i)
			this.splat.push(new Pointer(this.p, i, acc, extent))
		}
	}

	move(rains: Drip[]): void {
		for(let n of this.splat) {
			n.move()
		}
		this.death -= 1
		if(this.death < 1) {
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
		for(let i: number = 0; i < this.splat.length; i++) {
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
		})
		// initialize
		this.rains = []
	}

	setup(): void {
		super.setup()

		this.p.blendMode(this.p.OVERLAY)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		// const backgroundColor: p5.Color = this.p.color('#f0ead6')
		// backgroundColor.setAlpha(10)
		// this.p.background(backgroundColor)

		if(this.p.frameCount % 10 === 0) {
			this.rains.push(new Drip(this.p, this.p.random(this.p.width), this.p.random(-100, this.p.height), this.p.random(5, 30)))
		}


		for(let i:number = this.rains.length - 1; i >= 0; i--) {
			this.rains[i].move(this.rains)
			this.rains[i].show()
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}