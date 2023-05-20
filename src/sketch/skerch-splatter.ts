'use strict'
import Sketch from '@/class/Sketch'
import Microphone from '@/class/Microphone'

class SketchTest extends Sketch {
	// property
	blobSize: number
	overlay: p5.Graphics
	hue: number
	brightness: number
	hueCoefficient: number
	brightnessCoefficient: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true
		})
		// initialize
		this.hue = 0
		this.brightness = 0
		this.hueCoefficient = 0
		this.brightnessCoefficient = 1
	}

	setup(): void {
		super.setup()

		this.blobSize = this.p.width / 50
		this.p.colorMode(this.p.HSB, 360, 100, 100, 100)
		this.p.background(200, 100, 10, 100)
		this.p.blendMode(this.p.BLEND)
		this.p.noStroke()

		this.overlay = this.p.createGraphics(this.p.width, this.p.height)
		this.overlay.colorMode(this.p.HSB, 360, 100, 100, 100)
		this.overlay.noStroke()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		Microphone.getAudio()

		this.p.blendMode(this.p.BLEND)
		// if (this.p.frameCount % 8 === 0) {
		if (Microphone.getVolume > 60 || this.p.frameCount % 50 === 0) {
			const x: number = this.p.int(this.p.random(this.p.width))
			const y: number = this.p.int(this.p.random(this.p.height))
			this.drawBlob(x, y, this.blobSize, 8)
		}

		if (this.p.frameCount % 10 === 0) {
			this.hue += this.hueCoefficient
			this.brightness += this.brightnessCoefficient
			if (this.hue > 360 || this.hue < 0) {
				this.hueCoefficient *= -1
			}
			if (this.brightness > 100 || this.brightness < 0) {
				this.brightnessCoefficient *= -1
			}
		}

		this.p.blendMode(this.p.DARKEST)
		// this.overlay.blendMode(this.p.DARKEST)
		this.overlay.clear(0, 0, 0, 0)
		this.overlay.fill(this.hue, 50, this.brightness, 20)
		this.overlay.rect(0, 0, this.p.width, this.p.height)
		this.p.image(this.overlay, 0, 0, this.p.width, this.p.height)
	}

	drawBlob(x: number, y: number, radius: number, level: number) {
		const s: number = this.p.random(70, 100)
		const b: number = this.p.map(Microphone.getVolume, 0, 200, 60, 100)
		const color: number[] = [Microphone.getHue, s, b, 100]
		this.p.fill(color)

		this.p.beginShape()
		let noiseScale: number = this.p.map(radius, 10, 50, 10, 100)
		let numVertices: number = 10
		for (let i: number = 0; i < numVertices; i++) {
			let angle: number = this.p.map(i, 0, numVertices, 0, this.p.TWO_PI)
			let r: number =
				radius +
				this.p.noise(i * noiseScale, level * noiseScale * 100) *
					radius *
					2
			let px: number = x + this.p.cos(angle) * r
			let py: number = y + this.p.sin(angle) * r
			px += this.p.random(-r / 10, r / 10)
			py += this.p.random(-r / 10, r / 10)
			this.p.curveVertex(px, py)
		}
		this.p.endShape(this.p.CLOSE)

		if (level > 1) {
			level = level - 1
			let num = this.p.int(this.p.random(2, 5))
			for (let i: number = 0; i < num; i++) {
				let a = this.p.random(0, this.p.TWO_PI)
				let r = radius / 2
				let nx =
					x + this.p.cos(a) * 6 * level + this.p.random(-r / 2, r / 2)
				let ny =
					y + this.p.sin(a) * 6 * level + this.p.random(-r / 2, r / 2)
				this.drawBlob(nx, ny, r, level)
			}
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
