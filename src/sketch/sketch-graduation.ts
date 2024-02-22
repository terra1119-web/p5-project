'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	mySound: p5.SoundFile
	x: number
	y: number
	toX: number
	toY: number
	stepSize: number
	letters: string
	fontSizeMin: number
	angleDistortion: number
	counter: number
	pointCount: number
	isPlaying: boolean
	canPlay: boolean
	textGraphics: p5.Graphics

	imgs: p5.Image[]
	balls: Ball[]
	time_max: number
	img: p5.Image
	rand_arr: p5.Image[]
	temp_arr: p5.Image[]
	play_max: number
	play_count: number
	time_count: number
	alpha: number
	image_name_array: string[]
	imageGraphics: p5.Graphics

	constructor() {
		super({})
		// initialize
		this.mySound = null
		this.x = 0
		this.y = 0
		this.toX = 0
		this.toY = 0
		this.stepSize = 5.0
		this.letters =
			'あの花が咲いたのは、そこに種が落ちたからで いつかまた枯れた後で種になって続いてく 君たちの足跡は、進むたび変わってゆくのに 永遠に見えるものに苦しんでばかりだね 荒野を駆ける　この両足で ゴーイング　ゴーイング　それだけなんだ 明日へ旅立つ準備はいいかい そこで戸惑う　でも運命が コーリング　コーリング　呼んでいる ならば、全てを生きてやれ 何回だって言うよ、世界は美しいよ 君がそれを諦めないからだよ 最終回のストーリーは初めから決まっていたとしても 今だけはここにあるよ　君のまま光ってゆけよ あの花が落ちるとき、その役目を知らなくても 側にいた人はきっと分かっているはずだから 海風を切る　胸いっぱいに ゴーイング　ゴーイング　息をするんだ 今日を旅立つ準備はいいかい ときに戸惑う　繰り返すんだ コーリング　コーリング　聞こえてる ならば、全てを生きてやる 何回だって言うよ、世界は美しいよ 君がそれを諦めないからだよ 混沌の時代に、泥だらけの君のままで輝きを見つめていて 悲しみに向かう夜も、揺るがずに光っていてよ いつか巡ってまた会おうよ 最終回のその後も 誰かが君と生きた記憶を語り継ぐでしょう いつか笑ってまた会おうよ 永遠なんてないとしたら この最悪な時代もきっと続かないでしょう 君たちはありあまる奇跡を 駆け抜けて今をゆく'
		this.fontSizeMin = 10
		this.angleDistortion = 0.0
		this.counter = 0
		this.pointCount = 0
		this.isPlaying = false
		this.canPlay = false
		this.textGraphics = null

		this.imgs = []
		this.balls = []
		this.time_max = 10000
		this.rand_arr = []
		this.temp_arr = []
		this.play_count = 0
		this.time_count = 0
		this.alpha = 0
		this.image_name_array = [
			'001.jpg',
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
			'2022_04_11_Oil__Acrylic_034.jpg',
			'Group1.png'
		]
	}

	preload(): void {
		super.preload()

		this.p.soundFormats('mp3')
		this.mySound = this.p.loadSound('sound/a.mp3')

		for (const image of this.image_name_array) {
			const img: p5.Image = this.p.loadImage(`images/brushDraw/${image}`)
			this.imgs.push(img)
		}
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.smooth()

		this.play_max = this.image_name_array.length
		this.initArray()
		this.initImage()
		this.imageGraphics = this.p.createGraphics(this.p.width, this.p.height)

		this.textGraphics = this.p.createGraphics(this.p.width, this.p.height)
		// this.textGraphics.background(0)
		// this.p.blendMode(this.p.OVERLAY)
		// this.textGraphics.smooth()
		this.x = this.textGraphics.random(this.textGraphics.width)
		this.y = this.textGraphics.random(this.textGraphics.height)

		this.textGraphics.textAlign(this.textGraphics.LEFT)
		this.textGraphics.fill(255)

		this.toX = this.textGraphics.random(this.textGraphics.width)
		this.toY = this.textGraphics.random(this.textGraphics.height)

		this.p.userStartAudio().then(() => {
			this.canPlay = true
		})
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		if (!this.isPlaying) return

		// text
		this.pointCount++
		if (this.pointCount > 50) {
			this.initPoint()
			this.pointCount = 0
		}
		this.textGraphics.fill(this.textGraphics.random(255))

		let d = this.textGraphics.dist(this.x, this.y, this.toX, this.toY)

		this.textGraphics.textFont('Georgia')
		this.textGraphics.textSize(this.fontSizeMin + d / 10)
		const newLetter = this.letters.charAt(this.counter)
		this.stepSize = this.textGraphics.textWidth(newLetter)

		if (d > this.stepSize) {
			const angle = this.textGraphics.atan2(
				this.toY - this.y,
				this.toX - this.x
			)

			this.textGraphics.push()
			this.textGraphics.translate(this.x, this.y)
			this.textGraphics.rotate(
				angle + this.textGraphics.random(this.angleDistortion)
			)
			this.textGraphics.text(newLetter, 0, 0)
			this.textGraphics.pop()

			this.counter++
			if (this.counter > this.letters.length - 1) this.counter = 0

			this.x = this.x + this.textGraphics.cos(angle) * this.stepSize
			this.y = this.y + this.textGraphics.sin(angle) * this.stepSize
		}
		this.textGraphics.background(0, 5)

		this.p.push()
		this.p.image(this.textGraphics, 0, 0)
		this.p.image(this.imageGraphics, 0, 0)
		this.p.pop()

		// image
		this.time_count++
		if (this.time_max < this.time_count) {
			this.p.fill(0, this.alpha)
			this.p.rect(0, 0, this.p.width, this.p.height)
			this.alpha += 1
			if (this.alpha > 255) {
				this.play_count++

				if (this.play_max <= this.play_count) {
					this.play_count = 0
					this.initArray()
				}
				this.time_count = 0

				this.alpha = 0
				this.clearScreen()
				this.initImage()
			}
		} else {
			for (let i: number = 0; i < this.balls.length; i++) {
				this.balls[i].draw()
				this.balls[i].update()
				this.balls[i].changeColour()
			}

			for (let i: number = 0; i < this.balls.length; i++) {
				if (this.balls[i].radius < 0) {
					this.balls.splice(i, 1)
				}
			}

			const rnd: number = this.p.random(100)
			if (rnd > 30) return

			for (let i: number = 0; i < 5; i++) {
				const x: number = this.p.floor(this.p.random(this.p.width))
				const y: number = this.p.floor(this.p.random(this.p.height))
				this.balls.push(
					new Ball(
						x,
						y,
						this.p.color(
							this.img.get(
								x + this.p.random(2),
								y + this.p.random(2)
							)
						),
						this.imageGraphics,
						this.img
					)
				)
			}
		}
		// end image
	}

	initPoint(): void {
		this.toX = this.textGraphics.random(this.textGraphics.width)
		this.toY = this.textGraphics.random(this.textGraphics.height)
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
			for (let j = 0; j < clone.length; j++) {
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
		this.img.resize(this.p.width, this.p.height)
	}

	clearScreen(): void {
		this.p.background(0)
	}

	mousePressed(): void {
		super.mousePressed()
		this.isPlaying = !this.isPlaying
		if (this.canPlay && this.isPlaying) {
			this.mySound.play()
		} else if (this.canPlay && !this.isPlaying) {
			this.mySound.stop()
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

class Ball {
	p: p5
	img: p5.Image
	location: p5.Vector
	radius: number
	r: number
	g: number
	b: number
	xOff: number
	yOff: number
	radiusLow: number
	radiusHigh: number
	rangeLow: number
	rangeHigh: number
	nX: number
	nY: number
	c: p5.Color

	constructor(mX: number, mY: number, c: p5.Color, p: p5, img: p5.Image) {
		this.p = p
		this.img = img
		this.location = this.p.createVector(mX, mY)
		this.radius = this.p.random(0.01)
		this.r = this.p.red(c)
		this.g = this.p.green(c)
		this.b = this.p.blue(c)

		this.xOff = 0.0
		this.yOff = 0.0
	}

	update(): void {
		this.radius -= this.p.random(0.0001)

		this.xOff = this.xOff + this.p.random(-0.5, 0.5)
		this.nX = this.p.noise(this.location.x) * this.xOff

		this.yOff = this.yOff + this.p.random(-0.5, 0.5)
		this.nY = this.p.noise(this.location.y) * this.yOff

		this.location.x += this.nX
		this.location.y += this.nY
	}

	changeColour(): void {
		this.c = this.p.color(this.img.get(this.location.x, this.location.y))
		this.r = this.p.red(this.c)
		this.g = this.p.green(this.c)
		this.b = this.p.blue(this.c)
	}

	draw(): void {
		this.p.noStroke()
		this.p.stroke(this.r, this.g, this.b)
		this.p.ellipse(
			this.location.x,
			this.location.y,
			this.radius * 50,
			this.radius * 50
		)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
