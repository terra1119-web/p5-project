'use strict'
import * as p5 from 'p5'
import * as Tone from 'tone'

import {
	CONSTANT
} from '@/util/constant'

type SketchType = {
	renderer: string
	use2D: boolean
	p: p5
	w: number
	h: number
	alpha: number
	graphic: p5.Graphics
	fadeFlag: boolean
	useMic: boolean
	mic: Tone.UserMedia
	meter: Tone.Meter
}

export default class Sketch implements SketchType {
	renderer: string
	use2D: boolean
	p: p5
	w: number
	h: number
	alpha: number
	graphic: p5.Graphics
	fadeFlag: boolean
	useMic: boolean
	mic: Tone.UserMedia
	meter: Tone.Meter

	constructor({
		renderer = 'P2D',
		use2D = true,
		useMic = false
	}) {
		this.renderer = renderer
		this.use2D = use2D
		this.w = window.innerWidth
		this.h = window.innerHeight
		this.alpha = 0
		this.graphic = null
		this.fadeFlag = false
		this.startFade = this.startFade.bind(this)
		this.dispose = this.dispose.bind(this)
		this.useMic = useMic
	}

	setup(): void {
		const renderer = this.renderer === 'WEBGL' ? this.p.WEBGL : this.p.P2D
		this.p.createCanvas(this.w, this.h, renderer)
		this.graphic = this.p.createGraphics(this.w, this.h)
		this.graphic.hide()
		window.addEventListener('fade', this.startFade, false)

		if (!this.useMic) return

		this.meter = new Tone.Meter()
		this.mic = new Tone.UserMedia()
		this.mic.open()
		this.mic.connect(this.meter)
	}

	draw(): void {
		if (this.renderer === 'WEBGL' && this.use2D) {
			this.p.translate(-this.p.width / 2, -this.p.height / 2, 0)
		}

		if (this.fadeFlag) {
			this.graphic.clear(0, 0, 0, 0)
			this.graphic.fill(0, this.alpha)
			this.graphic.rect(0, 0, this.graphic.width, this.graphic.height)
			this.alpha += 2
			if (this.alpha > CONSTANT.ALPHA_MAX) {
				this.dispose()
			}
		}
	}

	preload(): void {}

	mousePressed(): void {}

	keyTyped(): void {
		if (this.p.keyCode === 32 && !this.fadeFlag) {
			this.startFade()
		}
	}

	keyPressed(): void {}

	doubleClicked(): void {
		this.p.saveCanvas('sketch', 'png')
	}

	init(): void {
		const sketch = (p: p5): void => {
			this.p = p
			this.p.preload = () => this.preload()
			this.p.setup = () => this.setup()
			this.p.draw = () => this.draw()
			this.p.mousePressed = () => this.mousePressed()
			this.p.keyTyped = () => this.keyTyped()
			this.p.keyPressed = () => this.keyPressed()
			this.p.doubleClicked = () => this.doubleClicked()
		}

		new p5(sketch, document.getElementById('canvas'))
	}

	startFade(): void {
		this.graphic.show()
		this.fadeFlag = true
	}

	dispose(): void {
		this.graphic.remove()
		this.graphic = null
		this.p.remove()
		this.p = null
		if (this.useMic) this.mic.close()
		this.mic = null
		window.removeEventListener('fade', this.startFade, false)
		const event = new Event('finish')
		window.dispatchEvent(event)
	}

	get getSketch(): p5 {
		return this.p
	}

	get getVolume(): number | number[] {
		return this.meter.getValue()
	}
}