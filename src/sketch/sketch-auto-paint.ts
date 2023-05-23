'use strict'
import Sketch from '@/class/Sketch'
import * as p5 from 'p5'

class SketchTest extends Sketch {
	// property
	sHeight: number
	pArr: Ptc[]
	point: p5.Vector
	redOffset: number
	greenOffset: number
	blueOffset: number
	cTr: p5.Color
	toX: number
	toY: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true
		})
		// initialize
		this.sHeight = 0
		this.pArr = []
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.point = this.p.createVector()
		this.cTr = this.p.color(0, 100)
		this.sHeight = this.p.height
		this.redOffset = this.p.random() * 300 - 100
		this.greenOffset = this.p.random() * 300 - 100
		this.blueOffset = this.p.random() * 300 - 100

		this.addPtc()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		let mx: number = 0,
			my: number = 0

		let num: number = this.pArr.length
		for (var i: number = 0; i < num; ++i) {
			const p: Ptc = this.pArr[i]
			p.process()

			mx += p.x / this.p.width
			my += p.y / this.p.height
			//my += p.y / sHeight;
		}

		// if (this.redOffset !== this.cTr.redOffset) {
		// 	this.redOffset > this.cTr.redOffset ? this.cTr.redOffset++ : this.cTr.redOffset--
		// } else {
		// 	this.redOffset = this.p.random() * 300 - 100
		// }
		// if (this.greenOffset !== this.cTr.greenOffset) {
		// 	this.greenOffset > this.cTr.greenOffset
		// 		? this.cTr.greenOffset++
		// 		: this.cTr.greenOffset--
		// } else {
		// 	this.greenOffset = this.p.random() * 300 - 100
		// }
		// if (this.blueOffset !== this.cTr.blueOffset) {
		// 	this.blueOffset > this.cTr.blueOffset ? this.cTr.blueOffset++ : this.cTr.blueOffset--
		// } else {
		// 	this.blueOffset = this.p.random() * 300 - 100
		// }
	}

	addPtc(): void {
		let pCount: number = 16
		while (pCount--) {
			const p: Ptc = new Ptc(this.p, 6 + this.p.random(160))
			p.x = this.p.int(this.p.random(this.p.width))
			p.y = this.p.int(this.p.random(this.p.height))
			this.pArr.push(p)
		}
	}
}

class Ptc {
	p: p5
	destPoint: p5.Vector = new p5.Vector()
	vx: number = 0
	vy: number = 0
	easing: number = 0.02 + Math.random() * 0.03
	rNum: number
	stopFlag: boolean = false
	x: number
	y: number

	constructor(p: p5, radius: number) {
		this.p = p
		this.p.fill(255)
		this.p.noStroke
		this.p.circle(0, 0, radius)
		this.destPoint = this.p.createVector()
		this.vx = 0
		this.vy = 0
		this.easing = 0.02 + Math.random() * 0.03
		this.stopFlag = false
	}

	process(): void {
		if (this.stopFlag) {
			this.rNum = this.p.random(20)
			if (this.rNum == 0) {
				this.destPoint.x = this.p.random(553) - 20
				this.destPoint.y = this.p.random(553) - 20
				this.stopFlag = false
			}
		} else {
			this.movePtc()
			if (this.p.round(this.vx) === 0 && this.p.round(this.vy) === 0) {
				this.stopFlag = true
			}
		}
	}

	movePtc(): void {
		this.vx = (this.destPoint.x - this.x) * this.easing
		this.vy = (this.destPoint.y - this.y) * this.easing
		this.x += this.vx
		this.y += this.vy
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
