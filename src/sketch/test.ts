'use strict'
import Sketch from '@/class/Sketch'
import Microphone from '@/class/Microphone'

class SketchTest extends Sketch {
	// property
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
		})
		// initialize
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.stroke(255)
		this.p.noFill()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		if (!Microphone.dataArray) return
		Microphone.getAudio()
		console.log(Microphone.getVolume)

		this.p.beginShape()
		Microphone.dataArray.forEach((data, index) => {
			const x = this.p.map(index, 0, Microphone.dataArray.length - 1, 20, this.p.width -20)
			const y = this.p.map(this.p.height * 0.5 - data, this.p.height * 0.5, 0, this.p.height * 0.5, 0)
			this.p.vertex(x, y)
		})
		this.p.endShape()
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