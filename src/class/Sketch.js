'use strict'
import p5 from 'p5'
import * as Tone from 'tone'

import {
	CONSTANT
} from '@/util/constant'

export default class Sketch {
	constructor({
		renderer = 'P2D',
		use2D = true,
		useMic = false
	}) {
		this.renderer = renderer
		this.use2D = use2D
		// this.sketch
		this.p
		this.w = window.innerWidth
		this.h = window.innerHeight
		this.alpha = 0
		this.graphic = null
		this.canvas
		this.fadeFlag = false
		this.startFade = this.startFade.bind(this)
		this.dispose = this.dispose.bind(this)
		this.useMic = useMic
		this.mic
		this.meter
	}

	setup() {
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

	draw() {
		if (this.renderer === 'WEBGL' && this.use2D) {
			this.p.translate(-this.p.width / 2, -this.p.height / 2, 0)
		}

		if (this.fadeFlag) {
			this.graphic.clear()
			this.graphic.fill(0, this.alpha)
			this.graphic.rect(0, 0, this.graphic.width, this.graphic.height)
			this.alpha += 2
			if (this.alpha > CONSTANT.ALPHA_MAX) {
				this.dispose()
			}
		}
	}

	preload() {}

	mousePressed() {}

	keyTyped() {
		if (this.p.keyCode === 32 && !this.fadeFlag) {
			this.startFade()
		}
	}

	keyPressed() {}

	doubleClicked() {
		this.p.saveCanvas('sketch', 'png')
	}

	init() {
		const sketch = p => {
			this.p = p
			this.p.preload = () => this.preload()
			this.p.setup = () => this.setup()
			this.p.draw = () => this.draw()
			this.p.mousePressed = () => this.mousePressed()
			this.p.keyTyped = () => this.keyTyped()
			this.p.keyPressed = () => this.keyPressed()
			this.p.doubleClicked = () => this.doubleClicked()
		}

		this.canvas = new p5(sketch, 'canvas')
	}

	startFade() {
		this.graphic.show()
		this.fadeFlag = true
	}

	dispose() {
		this.graphic.remove()
		this.graphic = null
		this.p.remove()
		this.p = null
		this.sketch = null
		this.canvas = null
		if (this.useMic) this.mic.close()
		this.mic = null
		window.removeEventListener('fade', this.startFade, false)
		const event = new Event('finish')
		window.dispatchEvent(event)
	}

	get getSketch() {
		return this.p
	}

	get getVolume() {
		return this.meter.getValue()
	}
}