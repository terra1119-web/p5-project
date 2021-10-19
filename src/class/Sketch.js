'use strict'
import P5 from 'p5'
import { CONSTANT } from '@/util/constant'

// let fadeFlag = false
export default class Sketch {
	constructor (renderer = 'P2D') {
		this.renderer = renderer
		this.sketch
		this.s
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
		const renderer = this.renderer === 'WEBGL' ? this.s.WEBGL : this.s.P2D
		this.s.createCanvas(this.w, this.h, renderer)
		this.graphic = this.s.createGraphics(this.w, this.h)
		this.graphic.hide()
		window.addEventListener('fade', this.startFade, false)
	}

	draw () {
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

	keyTyped (s) {
		if (s.keyCode === 32 && !this.fadeFlag) {
			this.startFade()
		}
	}

	keyPressed () {
	}

	doubleClicked () {
	}

	init () {
		this.sketch = s => {
			this.s = s
			this.s.preload = () => this.preload(this.s)
			this.s.setup = () => this.setup(this.s)
			this.s.draw = () => this.draw(this.s)
			this.s.mousePressed = () => this.mousePressed(this.s)
			this.s.keyTyped = () => this.keyTyped(this.s)
			this.s.keyPressed = () => this.keyPressed(this.s)
			this.s.doubleClicked = () => this.doubleClicked(this.s)
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
		this.s.remove()
		this.s = null
		this.sketch = null
		this.canvas = null
		const event = new Event('finish')
		window.dispatchEvent(event)
		window.removeEventListener('fade', this.startFade, false)
	}

	get getSketch() {
		return this.s
	}
}