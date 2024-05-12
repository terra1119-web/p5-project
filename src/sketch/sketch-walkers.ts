'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	num: number
	walkers: Walker[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: true
		})
		// initialize
		this.num = 500
		this.walkers = []
	}

	setup(): void {
		super.setup()

		for (let i = 0; i < this.num; i++) {
			this.walkers[i] = new Walker(this.p)
		}
		this.p.background(0)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.blendMode(this.p.BLEND)
		this.p.fill(0, 5)
		this.p.rect(0, 0, this.p.width, this.p.height)

		// Walkerクラスのdraw()を実行
		this.p.blendMode(this.p.ADD)
		for (let i = 0; i < this.num; i++) {
			const hue: number = this.getHue()
			this.walkers[i].draw(hue)
		}
		// this.p.rectMode(this.p.CENTER)
		// this.p.translate(this.p.width / 2, this.p.height / 2)
		// this.p.textFont('Roboto')
		// this.p.textSize(64)
		// this.p.text('10', 0 / 2, 0)
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

class Walker {
	p: p5
	position: p5.Vector
	color: p5.Color
	size: number
	rotationAngle: number
	rotationSpeed: number
	velocity: p5.Vector

	constructor(p: p5) {
		this.p = p
		// 初期位置を画面の中心に
		this.position = this.p.createVector(this.p.width / 2, this.p.height / 2)
		this.p.colorMode(this.p.HSB, 100)
		// this.color = this.p.color(
		// 	this.p.random(150, 255),
		// 	this.p.random(100, 200),
		// 	this.p.random(50, 150),
		// 	this.p.random(50, 150)
		// )
		this.size = this.p.random(1, 8)
		this.rotationAngle = this.p.random(this.p.TWO_PI) // Random initial angle for rotational movement
		this.rotationSpeed = this.p.random(0.005, 0.02) // Random rotation speed
	}

	draw(hue) {
		// 上下左右にランダムな速度
		this.velocity = p5.Vector.fromAngle(this.rotationAngle) // Use polar coordinates for rotational movement
		this.velocity.mult(this.p.random(0.5, 5)) // Adjust the speed
		// 位置を更新
		this.position.add(this.velocity)

		// 色を更新 (to create a gradient effect)
		// this.color.levels[1] = hue

		this.color = this.p.color(
			hue,
			this.p.random(0, 100),
			this.p.random(50, 100),
			this.p.random(50, 100)
		)

		// 円を描画
		this.p.noStroke()
		this.p.fill(this.color)
		this.p.ellipse(this.position.x, this.position.y, this.size, this.size)

		// 回転角度を更新
		this.rotationAngle += this.rotationSpeed
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
