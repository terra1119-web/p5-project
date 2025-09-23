'use strict'
import '@/global'
import p5 from 'p5'
import 'p5/lib/addons/p5.sound'

import { CONSTANT } from '@/util/constant'
import AudioAnalyzer from './AudioAnalyzer'

type SketchType = {
	renderer: string
	use2D: boolean
	p: p5
	alpha: number
	graphic: p5.Graphics
	fadeFlag: boolean
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
	audioAnalyzer: AudioAnalyzer
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
		this.audioAnalyzer = new AudioAnalyzer(this.p)
		this.audioAnalyzer.setup()
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
		if (this.audioAnalyzer) this.audioAnalyzer.dispose()
		this.graphic.remove()
		this.graphic = null
		this.p.remove()
		this.p = null
		window.removeEventListener('fade', this.startFade, false)
		const event = new Event('finish')
		window.dispatchEvent(event)
	}

	getHue(): number {
		return this.audioAnalyzer.getHue()
	}

	getVolume(): number {
		return this.audioAnalyzer.getVolume()
	}

	getVolumeEachBand() {
		return this.audioAnalyzer.getVolumeEachBand()
	}

	coverImageToScreenData(img: p5.Image) {
		// 画面と画像の比率を計算
		const scaleW = this.p.width / img.width
		const scaleH = this.p.height / img.height
		const scale = this.p.max(scaleW, scaleH) // はみ出してもいいので大きい方を採用

		// 新しい幅と高さ
		const newW = img.width * scale
		const newH = img.height * scale

		// 中央に配置（画像がはみ出す部分は見切れる）
		const x = (this.p.width - newW) / 2
		const y = (this.p.height - newH) / 2

		return {
			x,
			y,
			newW,
			newH,
		}
	}
}
