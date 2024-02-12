'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	MOUSEPOWER: number
	BLOCKSIZE: number
	main: Point[]
	rows: Point[][]
	columns: Point[][]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: true
		})
		// initialize
		this.MOUSEPOWER = 0.05
		this.BLOCKSIZE = 24
		this.main = []
		this.rows = []
		this.columns = []
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.makeGrid()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)

		this.main.forEach(elem => {
			elem.update()
		})

		this.p.noFill()
		this.p.stroke(255)
		this.rows.forEach(arr => {
			this.p.beginShape()
			arr.forEach(elem => {
				this.p.curveVertex(elem.pos.x, elem.pos.y)
			})
			this.p.endShape()
		})

		this.columns.forEach(arr => {
			this.p.beginShape()
			arr.forEach(elem => {
				this.p.curveVertex(elem.pos.x, elem.pos.y)
			})
			this.p.endShape()
		})
	}

	mousePressed(): void {
		super.mousePressed()

		this.burst()
	}

	keyTyped(): void {
		super.keyTyped()
	}

	keyPressed(): void {
		super.keyPressed()
	}

	doubleClicked(): void {
		super.doubleClicked()
	}

	burst() {
		const mouse = this.p.createVector(this.p.mouseX, this.p.mouseY)
		this.main.forEach(elem => {
			const diff = elem.pos.copy().sub(mouse)
			const distance = diff.mag()
			const multi = this.p.pow(2, -(distance * this.MOUSEPOWER))
			const f = diff.mult(multi)
			elem.acc.add(f)
		})
	}

	makeGrid(): void {
		const arr = []
		for (let i = 0; i < this.p.width; i += this.BLOCKSIZE) {
			for (let j = 0; j < this.p.height; j += this.BLOCKSIZE) {
				arr.push(new Point(this.p, i, j))
			}
		}

		const columns: Point[][] = []
		for (let i = 0; i < this.p.width; i += this.BLOCKSIZE) {
			const column = arr.filter(elem => elem.supposed.x == i)
			columns.push(column)
		}

		const rows: Point[][] = []
		for (let j = 0; j < this.p.height; j += this.BLOCKSIZE) {
			const row = arr.filter(elem => elem.supposed.y == j)
			rows.push(row)
		}

		this.main = arr
		this.columns = columns
		this.rows = rows
	}
}

class Point {
	p: p5
	supposed: p5.Vector
	pos: p5.Vector
	vel: p5.Vector
	acc: p5.Vector
	FRICTION: number
	RESILIENCY: number

	constructor(p: p5, x: number, y: number) {
		this.p = p
		this.supposed = this.p.createVector(x, y)
		this.pos = this.p.createVector(x, y)
		this.vel = this.p.createVector(0, 0)
		this.acc = this.p.createVector(0, 0)
		this.FRICTION = 0.95
		this.RESILIENCY = -0.025
	}

	update() {
		this.seek(this.supposed)
		this.vel.add(this.acc)
		this.pos.add(this.vel)
		this.vel.mult(this.FRICTION)
		this.acc.mult(0) //clear acc
	}

	seek(target: p5.Vector) {
		const diff = this.pos.copy().sub(target)
		const distance = diff.mag()
		const f = diff.mult(distance).mult(this.RESILIENCY)
		this.acc.add(f)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
