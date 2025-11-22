'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	img: p5.Image | undefined
	oscs: p5.Oscillator[] = []
	delay: p5.Delay
	reverb: p5.Reverb
	OSC_COUNT: number = 8
	started: boolean = false
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: true,
		})
		// initialize
	}

	preload(): void {
		super.preload()

		this.img = this.p.loadImage('images/acoustic/soundwave03.png')
	}

	setup(): void {
		super.setup()

		this.delay = new p5.Delay()
		this.reverb = new p5.Reverb()

		for (let i = 0; i < this.OSC_COUNT; i++) {
			const osc = new p5.Oscillator(
				this.p.random(['sine', 'triangle', 'sawtooth'])
			)
			osc.start()
			osc.amp(0)
			this.delay.process(osc, 0.25, 0.5, 2000)
			this.reverb.process(osc, 3, 0.5)
			console.log(this.oscs)
			this.oscs.push(osc)
		}

		this.p.textAlign(this.p.CENTER, this.p.CENTER)
		this.p.textSize(18)
		this.p.fill(255)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		if (!this.started) {
			this.p.background(0, 150)
			this.p.text(
				'クリックしてサウンドを開始',
				this.p.width / 2,
				this.p.height / 2
			)
			return
		}

		// 時間軸的スコア：横方向にスキャン
		let x = (this.p.frameCount * 2) % this.p.width
		let yStep = this.p.height / this.OSC_COUNT

		for (let i = 0; i < this.OSC_COUNT; i++) {
			let y = i * yStep + yStep / 2
			let c = this.img.get(x, y)
			let col = this.p.color(c)
			let h = this.p.hue(col)
			let b = this.p.brightness(col)
			let s = this.p.saturation(col)
			let freq = this.p.map(h, 0, 255, 100, 1200)
			let amp = this.p.map(b * s, 0, 255 * 255, 0, 0.6)
			this.oscs[i].freq(freq + i * 15, 0.2)
			this.oscs[i].amp(amp, 0.3)
		}

		// マウス位置でdelayとreverbを変化
		let delayTime = this.p.map(this.p.mouseX, 0, this.p.width, 0, 1)
		let feedback = this.p.map(this.p.mouseY, 0, this.p.height, 0.1, 0.9)
		this.delay.delayTime(delayTime)
		this.delay.feedback(feedback)

		let reverbTime = this.p.map(this.p.mouseY, 0, this.p.height, 0.5, 5)
		let reverbDecay = this.p.map(this.p.mouseX, 0, this.p.width, 0.1, 0.9)
		this.reverb.set(reverbTime, reverbDecay)

		// 現在スキャンしている位置を描画
		this.p.stroke(255, 0, 0)
		this.p.line(x, 0, x, this.p.height)
	}

	mousePressed(): void {
		super.mousePressed()

		if (this.p.getAudioContext().state !== 'running') {
			this.p.getAudioContext().resume()
			this.started = true
		}
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
