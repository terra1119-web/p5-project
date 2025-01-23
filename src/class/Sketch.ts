'use strict'
import '@/global'
import p5 from 'p5'
import 'p5/lib/addons/p5.sound'
import { mountFlex } from 'p5.flex'
mountFlex(p5)

import { CONSTANT } from '@/util/constant'

type SketchType = {
	renderer: string
	use2D: boolean
	p: p5
	alpha: number
	graphic: p5.Graphics
	fadeFlag: boolean
	mic: p5.AudioIn | null
	fft: p5.FFT
	spectrum: any[]
	useMic: boolean
	canvas: any
}

export default class Sketch implements SketchType {
	renderer: string
	use2D: boolean
	p: p5
	alpha: number
	graphic: p5.Graphics
	fadeFlag: boolean
	mic: p5.AudioIn | null
	fft: p5.FFT | null
	spectrum: any[]
	useMic: boolean
	canvas: p5.Renderer

	constructor({ renderer = 'P2D', use2D = true, useMic = false }) {
		this.renderer = renderer
		this.use2D = use2D
		this.useMic = useMic
		this.alpha = 0
		this.graphic = null
		this.fadeFlag = false
		this.mic = null
		this.startFade = this.startFade.bind(this)
		this.dispose = this.dispose.bind(this)
	}

	setup(): void {
		const renderer = this.renderer === 'WEBGL' ? this.p.WEBGL : this.p.P2D
		this.canvas = this.p.createCanvas(
			window.innerWidth,
			window.innerHeight,
			renderer
		)
		this.graphic = this.p.createGraphics(
			window.innerWidth,
			window.innerHeight
		)
		this.graphic.hide()
		window.addEventListener('fade', this.startFade, false)

		if (!this.useMic) return
		this.mic = new p5.AudioIn()
		this.p.userStartAudio().then(() => {
			this.mic.start()
			this.fft = new p5.FFT()
			this.fft.setInput(this.mic)
		})
		// this.p.flex()
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
		if (this.mic) this.mic.stop()
		this.mic = null
		this.graphic.remove()
		this.graphic = null
		this.p.remove()
		this.p = null
		window.removeEventListener('fade', this.startFade, false)
		const event = new Event('finish')
		window.dispatchEvent(event)
	}

	getHue(): number {
		if (!this.fft) return 0

		this.fft.analyze()

		// 周波数帯域の中央値を取得
		const freq = this.fft.getCentroid()

		// 周波数を色相にマッピング (0-360の範囲)
		const hue = this.p.map(freq, 0, 3000, 0, 360)
		return hue
	}

	getVolume(): number {
		if (!this.mic) return 0
		const volume = this.mic.getLevel() || 0
		return volume
	}

	getVolumeEachBand() {
		if (!this.fft) return [0, 0, 0, 0, 0]

		this.fft.analyze()
		const bass = this.fft.getEnergy('bass')
		const lowMid = this.fft.getEnergy('lowMid')
		const mid = this.fft.getEnergy('mid')
		const highMid = this.fft.getEnergy('highMid')
		const treble = this.fft.getEnergy('treble')
		const array = [treble, highMid, mid, lowMid, bass]

		return array
	}
}
