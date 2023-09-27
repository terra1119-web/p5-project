'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	unit: number
	theta: number
	frames: number
	waveNum: number
	volumeCoefficient: number

	constructor() {
		super({ useMic: true })

		// initialize
		this.frames = 240
		this.waveNum = 24
		this.volumeCoefficient = 0.06
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.noStroke()
		this.unit = this.p.width / this.waveNum
		this.theta = 0
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		const array = this.getVolumeEachBand()
		const maxValue: number = Math.max(...array)
		const maxIndex: number = array.indexOf(maxValue)
		const targetYArray: number[] =
			maxIndex === 0
				? [0, 1]
				: maxIndex === 1
				? [3, 4, 5, 6, 7, 8, 9]
				: maxIndex === 2
				? [10, 11, 12, 13, 14, 15]
				: maxIndex === 3
				? [16, 17, 18, 19]
				: maxIndex === 4
				? [20, 21, 22]
				: []

		for (let y: number = 0; y <= this.waveNum; y++) {
			for (let x: number = 0; x <= this.waveNum; x++) {
				let volume = 0
				if (targetYArray.includes(y)) {
					volume = maxValue
				}
				const distance: number = this.p.dist(
					this.p.width / 2,
					this.p.height / 2,
					x * this.unit,
					y * this.unit
				)
				const offSet: number = this.p.map(
					distance,
					0,
					this.p.sqrt(
						this.p.sq(this.p.width / 2) +
							this.p.sq(this.p.height / 2)
					),
					0,
					this.p.TWO_PI
				)
				// const sz = this.p.map(this.p.sin(this.theta + offSet), -1, 1, this.unit * .2, this.unit * .1)
				const sz =
					this.p.map(
						this.p.sin(this.theta + offSet),
						-1,
						1,
						this.unit * 0.2,
						this.unit * 0.1
					) +
					volume * this.volumeCoefficient
				const angle: number = this.p.atan2(
					y * this.unit - this.p.height / 2,
					x * this.unit - this.p.width / 2
				)
				this.p.push()
				this.p.translate(x * this.unit, y * this.unit)
				this.p.rotate(angle)
				const px: number = this.p.map(
					this.p.sin(this.theta + offSet),
					-1,
					1,
					0,
					50
				)
				this.p.ellipse(px, 0, sz, sz)
				this.p.pop()
			}
		}
		this.theta -= this.p.TWO_PI / this.frames
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
