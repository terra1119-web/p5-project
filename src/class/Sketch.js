'use strict'
import P5 from 'p5'
import { CONSTANT } from '@/util/constant'

// let fadeFlag = false
export default class Sketch {
	constructor (renderer = 'P2D', use2D = true) {
		this.renderer = renderer
		this.use2D = use2D
		this.sketch
		this.p
		this.w = window.innerWidth
		this.h = window.innerHeight
		this.alpha = 0
		this.graphic = null
		this.canvas
		this.fadeFlag = false
		this.startFade = this.startFade.bind(this)
		this.dispose = this.dispose.bind(this)
	}

	setup () {
		const renderer = this.renderer === 'WEBGL' ? this.p.WEBGL : this.p.P2D
		this.p.createCanvas(this.w, this.h, renderer)
		this.graphic = this.p.createGraphics(this.w, this.h)
		this.graphic.hide()
		window.addEventListener('fade', this.startFade, false)
	}

	draw () {
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

	preload () {
	}

	mousePressed () {
	}

	keyTyped () {
		if (this.p.keyCode === 32 && !this.fadeFlag) {
			this.startFade()
		}
	}

	keyPressed () {
	}

	doubleClicked () {
	}

	init () {
		this.sketch = p => {
			this.p = p
			this.p.preload = () => this.preload()
			this.p.setup = () => this.setup()
			this.p.draw = () => this.draw()
			this.p.mousePressed = () => this.mousePressed()
			this.p.keyTyped = () => this.keyTyped()
			this.p.keyPressed = () => this.keyPressed()
			this.p.doubleClicked = () => this.doubleClicked()
		}

		this.canvas = new P5(this.sketch, 'canvas')
	}

	startFade () {
		this.graphic.show()
		this.fadeFlag = true
	}

	dispose () {
		this.graphic.remove()
		this.graphic = null
		this.p.remove()
		this.p = null
		this.sketch = null
		this.canvas = null
		const event = new Event('finish')
		window.dispatchEvent(event)
		window.removeEventListener('fade', this.startFade, false)
	}

	get getSketch() {
		return this.p
	}
}