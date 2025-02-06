'use strict'
import Sketch from '@/class/Sketch'

const STEP_SIZE_DEFAULT = 5.0
const FRAME_MODULO = 4
const POINT_COUNT_THRESHOLD = 10
const FILL_COLOR_MIN = 200
const FILL_COLOR_MAX = 255
const FONT_SIZE_MIN = 3
const ANGLE_DISTORTION_DEFAULT = 0.0
const BACKGROUND_ALPHA = 5

const DEFAULT_LETTERS =
	'自らの無意識的な自己を実現する道を歩む者は、必然的に個人的無意識の内容を意識にとりいれ、それによって、人格は大きさを増すのである ひとりの人間が自分自身と他の人びとの生活をだいなしにしていることがいかにも歴然としているのに、その悲劇全体がわが身から起こり、次々にわが身から養分を得て維持されているということがなんとしても見えずにいるありさまは、しばしば痛ましい　われわれの生まれてきた世界は、無慈悲で残酷である。そして同時に、神聖な美しさをもっている。'

class LetterSketch extends Sketch {
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

	constructor() {
		super({})
		// variables
		this.x = 0
		this.y = 0
		this.toX = 0
		this.toY = 0
		this.stepSize = STEP_SIZE_DEFAULT
		this.letters = DEFAULT_LETTERS
		this.fontSizeMin = FONT_SIZE_MIN
		this.angleDistortion = ANGLE_DISTORTION_DEFAULT
		this.counter = 0
		this.pointCount = 0
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.smooth()

		this.x = this.p.random(this.p.width)
		this.y = this.p.random(this.p.height)

		this.p.textAlign(this.p.LEFT)
		this.p.fill(255)

		this.toX = this.p.random(this.p.width)
		this.toY = this.p.random(this.p.height)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0, BACKGROUND_ALPHA)

		if (this.p.frameCount % FRAME_MODULO === 0) {
			this.pointCount++
			if (this.pointCount > POINT_COUNT_THRESHOLD) {
				this.initPoint()
				this.pointCount = 0
			}
			this.p.fill(this.p.random(FILL_COLOR_MIN, FILL_COLOR_MAX))

			let d = this.p.dist(this.x, this.y, this.toX, this.toY)

			this.p.textFont('Georgia')
			this.p.textSize(this.fontSizeMin + d / 2)
			const newLetter = this.letters.charAt(this.counter)
			this.stepSize = this.p.textWidth(newLetter)

			if (d > this.stepSize) {
				const angle = this.p.atan2(this.toY - this.y, this.toX - this.x)

				this.p.push()
				this.p.translate(this.x, this.y)
				this.p.rotate(angle + this.p.random(this.angleDistortion))
				this.p.text(newLetter, 0, 0)
				this.p.pop()

				this.counter++
				if (this.counter > this.letters.length - 1) this.counter = 0

				this.x = this.x + this.p.cos(angle) * this.stepSize
				this.y = this.y + this.p.sin(angle) * this.stepSize
			}
		}
	}

	mousePressed(): void {
		super.mousePressed()
		this.x = this.p.mouseX
		this.y = this.p.mouseY
	}

	initPoint(): void {
		this.toX = this.p.random(this.p.width)
		this.toY = this.p.random(this.p.height)
	}
}

export default function (): void {
	const sketch: LetterSketch = new LetterSketch()
	sketch.init()
}
