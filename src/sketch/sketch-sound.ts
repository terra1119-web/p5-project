'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	imgs: p5.Image[]
	img: p5.Image
	oscs: p5.Oscillator[]
	currentX: number
	currentY: number
	OSC_COUNT: number = 5
	delay: p5.Delay
	reverb: p5.Reverb
	image_name_array: string[]
	rand_arr: p5.Image[]
	temp_arr: p5.Image[]
	play_max: number
	play_count: number
	time_count: number
	time_max: number = 8000
	is_complete: boolean
	alpha: number
	resizeData: { x: number; y: number; newW: number; newH: number }
	constructor() {
		super({
			// renderer: 'WEBGL',
			use2D: true,
			useMic: false,
		})
		// initialize
		this.oscs = []
		this.currentX = 0
		this.currentY = 0
		this.imgs = []
		this.image_name_array = [
			'001.png',
			'002.jpg',
			'003.jpg',
			'004.jpg',
			'005.jpg',
			'006.jpg',
			'007.jpg',
			'008.jpg',
			'009.jpg',
			'010.jpg',
			'011.jpg',
			'012.jpg',
			// '2022_04_11_Oil__Acrylic_034.jpg'
		]
		this.rand_arr = []
		this.temp_arr = []
		this.play_count = 0
		this.time_count = 0
		this.is_complete = false
		this.alpha = 0
	}

	preload(): void {
		super.preload()
		this.image_name_array.forEach(image => {
			const img: p5.Image = this.p.loadImage(`images/text-draw/${image}`)
			this.imgs.push(img)
		})

		// this.img = this.p.loadImage('images/text-draw/002.jpg')
	}

	setup(): void {
		super.setup()

		// this.p.frameRate(5)
		this.delay = new p5.Delay()
		this.reverb = new p5.Reverb()

		// オシレータを準備
		for (let i = 0; i < this.OSC_COUNT; i++) {
			let osc = new p5.Oscillator(
				440,
				this.p.random(['sine', 'triangle', 'sawtooth'])
			)
			osc.start()
			osc.amp(0)
			this.delay.process(osc, 0.25, 0.5, 2000) // (source, delayTime, feedback, filterFreq)
			this.reverb.process(osc, 3, 0.5)
			this.oscs.push(osc)
		}

		this.clearScreen()
		this.play_max = this.image_name_array.length

		this.initArray()
		this.initImage()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.time_count++
		if (this.time_max < this.time_count) {
			this.is_complete = true

			this.p.fill(0, this.alpha)
			this.p.rect(0, 0, this.p.width, this.p.height)
			this.alpha += 1
			this.oscs.forEach(osc => {
				osc.amp(0)
			})
			if (this.alpha > 255) {
				this.play_count++

				if (this.play_max <= this.play_count) {
					this.play_count = 0
					this.initArray()
				}
				this.time_count = 0

				this.alpha = 0
				this.is_complete = false
				this.clearScreen()
				this.initImage()
			}
		} else {
			if (!this.is_complete && this.p) {
				this.updateSound()
			}
		}
	}

	dispose(): void {
		super.dispose()
		this.oscs.forEach(osc => {
			osc.stop(0)
			osc.disconnect()
		})
	}

	updateSound(): void {
		for (let i = 0; i < this.oscs.length; i++) {
			// ランダムな座標のピクセルを選ぶ
			let x = this.p.floor(this.p.random(this.p.width))
			let y = this.p.floor(this.p.random(this.p.height))
			let c = this.img.get(x - this.resizeData.x, y - this.resizeData.y)
			let col = this.p.color(c)

			// 色の成分を抽出
			let h = this.p.hue(col)
			let b = this.p.brightness(col)
			let s = this.p.saturation(col)

			// 色相 → 周波数
			let freq = this.p.map(h, 0, 255, 100, 1200)
			// 明度と彩度で音量を決定
			let amp = this.p.map(b * s, 0, 255 * 255, 0, 0.7)

			this.p.stroke(col)
			this.p.point(x, y)

			// オシレータに反映（滑らかに変化）
			if (this.p.frameCount % 5 === 0) {
				this.oscs[i].freq(freq + i * 20, 0.2)
				this.oscs[i].amp(amp, 0.2)
			}
		}
	}

	initArray(): void {
		let clone: p5.Image[] = [...this.imgs]
		this.rand_arr = new Array(clone.length)
		this.temp_arr = null
		let rand_num: number = 0
		for (let i: number = 0; i < this.rand_arr.length; i++) {
			this.temp_arr = new Array(1)
			rand_num = Math.floor(this.p.random(clone.length))

			this.temp_arr = this.p.subset(clone, rand_num, 1)
			this.rand_arr[i] = this.temp_arr[0]

			this.temp_arr = new Array(clone.length - 1)

			let count: number = 0
			for (let j: number = 0; j < clone.length; j++) {
				if (j != rand_num) {
					this.temp_arr[count] = clone[j]
					count += 1
				}
			}
			clone = this.temp_arr
		}
	}

	initImage(): void {
		this.img = null
		this.img = this.rand_arr[this.play_count]
		this.resizeData = this.coverImageToScreenData(this.img)
		this.img.resize(this.resizeData.newW, this.resizeData.newH)
		this.p.tint(255, 200)
		this.p.image(this.img, this.resizeData.x, this.resizeData.y)
		this.p.noTint()
	}

	clearScreen(): void {
		this.p.background(0)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
