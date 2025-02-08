'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	angleX: number = 0
	angleY: number = 0
	angleZ: number = 0
	cubeSize: number = 150
	cubeStep: number = 50
	boxSize: number = 15

	// property
	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true
		})
	}

	setup(): void {
		super.setup()

		this.p.colorMode(this.p.HSB)
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

		for (let i = -this.cubeSize; i <= this.cubeSize; i += this.cubeStep) {
			for (
				let j = -this.cubeSize;
				j <= this.cubeSize;
				j += this.cubeStep
			) {
				for (
					let k = -this.cubeSize;
					k <= this.cubeSize;
					k += this.cubeStep
				) {
					const hue = this.getHue()
					const getMappedSin = (multiplier: number) => {
						return this.p.map(
							this.p.sin(
								this.p.frameCount * multiplier + i + j + k
							),
							-1,
							1,
							0,
							100
						)
					}
					const s = getMappedSin(0.02)
					const b = getMappedSin(0.03)

					this.p.push()
					this.p.translate(i, j, k)
					this.p.stroke(hue, s, b)
					this.p.box(this.boxSize)
					this.p.pop()
				}
			}
		}

		const volume = this.getVolume()
		const baseRotationSpeed = 0.01

		this.angleX += baseRotationSpeed + volume
		this.angleY += baseRotationSpeed * 2 + volume
		this.angleZ += baseRotationSpeed * 3 + volume
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
