'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	bg: p5.Graphics
	air: p5.Graphics
	panels: p5.Graphics[]
	xshift: number
	yshift: number
	haze: boolean
	time_count: number
	time_max: number
	swingX: number
	swingY: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true
		})
		// initialize
		this.xshift = 0
		this.yshift = 0
		this.haze = false
		this.panels = []
		this.time_count = 0
		this.time_max = 500
	}

	setup(): void {
		super.setup()

		this.swingX = this.p.random(0, this.p.width)
		this.swingY = this.p.random(0, this.p.height)
		this.p.imageMode(this.p.CENTER)
		this.bg = this.p.createGraphics(2 * this.p.width, 1.5 * this.p.height)
		this.air = this.p.createGraphics(2 * this.p.width, 1.5 * this.p.height)
		for (let i: number = 0; i < 6; i++) {
			this.panels.push(
				this.p.createGraphics(2 * this.p.width, 1.5 * this.p.height)
			)
		}
		this.p.noiseDetail(2, 1)
		let start: p5.Color = this.p.color(255, 140, 0, 200)
		let finish: p5.Color = this.p.color(0, 0, 0, 200)
		this.drawSky(this.bg, start, finish)
		start = this.p.color(255, 140, 0, 130)
		finish = this.p.color(255, 255, 255, 50)
		this.drawSky(this.air, start, finish)
		this.makeEverything()
	}

	makeEverything(): void {
		this.p.noiseSeed(this.p.random(1000))
		let y: number = (2 * this.p.height) / 3
		for (let p of this.panels) {
			this.drawGround(y, p)
			y += this.p.height / 12
		}
	}

	drawSky(cg: p5.Graphics, start: p5.Color, finish: p5.Color): void {
		cg.clear(0, 0, 0, 0)
		let c: p5.Color = start
		for (let y: number = 0; y <= cg.height; y += 2) {
			c = this.p.lerpColor(start, finish, y / (cg.height / 2))
			cg.stroke(c)
			cg.strokeWeight(2)
			cg.noFill()
			cg.line(0, y, cg.width, y)
		}
		this.p.noStroke()
	}

	drawGround(startY: number, panel: p5.Graphics) {
		let a: number = this.p.map(
			startY,
			(2 * this.p.height) / 3,
			this.p.height * 1.2,
			20,
			200
		)
		panel.stroke(0, a)
		panel.strokeWeight(a / 50)
		panel.fill(0, a)
		let freq: number = this.p.map(
			startY,
			(2 * this.p.height) / 3,
			1.5 * this.p.height,
			10,
			200
		)
		panel.beginShape()
		panel.curveVertex(-50, panel.height)
		panel.curveVertex(-50, panel.height)
		panel.curveVertex(-50, startY)
		panel.curveVertex(-50, startY)
		for (
			let x: number = -50;
			x <= panel.width + 50;
			x += this.p.random(this.p.width / 500, this.p.width / 300)
		) {
			let y1: number =
				startY - (this.p.height / 5) * this.p.noise(startY + x / 350)
			let w: number = (y1 * y1) / (this.p.height * this.p.random(10, 20))
			let y2: number =
				startY -
				(this.p.height / 5) * this.p.noise(startY + (x + w) / 350)
			if (this.p.floor(this.p.random(freq)) == 0) {
				this.drawTree(x + w / 2, y1, y2, w, -50, 30, panel)
				x += 1.5 * w
			} else {
				panel.curveVertex(x, y1)
			}
		}
		panel.curveVertex(panel.width + 50, startY)
		panel.curveVertex(panel.width + 50, startY)
		panel.curveVertex(panel.width + 50, panel.height)
		panel.curveVertex(panel.width + 50, panel.height)
		panel.endShape(this.p.CLOSE)
	}

	drawTree(
		x: number,
		y1: number,
		y2: number,
		w: number,
		t: number,
		a: number,
		panel: p5.Graphics
	) {
		for (let y: number = y1; y > t; y -= 10) {
			panel.curveVertex(
				x - (w / 2) * this.p.noise(y1 + 50 * x + y / 250),
				y
			)
			if (y < y1 / 1.5 && this.p.floor(this.p.random(18)) == 0) {
				panel.push()
				panel.noStroke()
				panel.ellipse(
					x + this.p.random(w / 4),
					y,
					w / 3,
					this.p.random(w / 3, w / 1.5)
				)
				panel.pop()
			}
		}
		for (let y: number = t; y <= y2; y += 10) {
			panel.curveVertex(
				x + w - (w / 2) * this.p.noise(y1 + 50 * x + y / 250),
				y
			)
		}
	}

	changeScene(): void {
		this.swingX = this.p.random(0, this.p.width)
		this.swingY = this.p.random(0, this.p.height)

		for (let p of this.panels) {
			p.clear(0, 0, 0, 0)
		}
		this.bg.clear(0, 0, 0, 0)
		this.air.clear(0, 0, 0, 0)
		let start: p5.Color = this.p.color(
			this.p.random(50, 185),
			this.p.random(50, 185),
			this.p.random(50, 185),
			200
		)
		let finish: p5.Color = this.p.color(0, 0, 0, 200)
		this.drawSky(this.bg, start, finish)
		start.setAlpha(130)
		finish = this.p.color(255, 255, 255, 30)
		this.drawSky(this.air, start, finish)
		this.makeEverything()
	}

	easeInOutQuad(x: number): number {
		return x < 0.5
			? 0.01 * x * x
			: 0.01 - Math.pow(-100 * x + 0.02, 0.02) / 1000
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(255)
		let txshift: number = (this.swingX - this.p.width / 2) / 6
		this.xshift = this.p.lerp(this.xshift, txshift, 0.05)
		let tyshift: number = (this.swingY - this.p.height / 2) / 20
		this.yshift = this.p.lerp(this.yshift, tyshift, 0.05)
		this.p.image(
			this.bg,
			this.p.width / 2 + this.xshift,
			this.p.height / 2 + this.yshift
		)
		for (let i: number = 1; i < 7; i++) {
			this.p.image(
				this.panels[i - 1],
				this.p.width / 2 + i * this.xshift,
				this.p.height / 2 + i * this.yshift
			)
		}
		if (this.haze)
			this.p.image(this.air, this.p.width / 2, this.p.height / 2)
		if (this.p.abs(txshift) < 1)
			this.swingX = this.p.random(0, this.p.width)
		if (this.p.abs(tyshift) < 1)
			this.swingY = this.p.random(0, this.p.height)

		this.time_count++
		if (this.time_max < this.time_count) {
			this.time_count = 0
			this.changeScene()
		}
	}

	mousePressed(): void {
		super.mousePressed()
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
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
