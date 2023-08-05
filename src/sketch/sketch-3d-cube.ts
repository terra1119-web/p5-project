'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	angleX: number
	angleY: number
	angleZ: number
	cubeSize: number

	// property
	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false
		})
		// initialize
		this.angleX = 0
		this.angleY = 0
		this.angleZ = 0
		this.cubeSize = 150
	}

	setup(): void {
		super.setup()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.noFill()
		this.p.strokeWeight(2)
		this.p.stroke(0)

		this.p.rotateX(this.angleX)
		this.p.rotateY(this.angleY)
		this.p.rotateZ(this.angleZ)

		for (let i = -this.cubeSize; i <= this.cubeSize; i += 50) {
			for (let j = -this.cubeSize; j <= this.cubeSize; j += 50) {
				for (let k = -this.cubeSize; k <= this.cubeSize; k += 50) {
					const r = this.p.map(
						this.p.sin(this.p.frameCount * 0.01 + i + j + k),
						-1,
						1,
						0,
						255
					)
					const g = this.p.map(
						this.p.sin(this.p.frameCount * 0.02 + i + j + k),
						-1,
						1,
						0,
						255
					)
					const b = this.p.map(
						this.p.sin(this.p.frameCount * 0.03 + i + j + k),
						-1,
						1,
						0,
						255
					)

					this.p.push()
					this.p.translate(i, j, k)
					this.p.stroke(r, g, b)
					this.p.box(15)
					this.p.pop()
				}
			}
		}

		this.angleX += 0.01
		this.angleY += 0.02
		this.angleZ += 0.03
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
