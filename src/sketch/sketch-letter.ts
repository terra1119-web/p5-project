'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
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
		this.stepSize = 5.0
		this.letters =
			'自らの無意識的な自己を実現する道を歩む者は、必然的に個人的無意識の内容を意識にとりいれ、それによって、人格は大きさを増すのである ひとりの人間が自分自身と他の人びとの生活をだいなしにしていることがいかにも歴然としているのに、その悲劇全体がわが身から起こり、次々にわが身から養分を得て維持されているということがなんとしても見えずにいるありさまは、しばしば痛ましい　われわれの生まれてきた世界は、無慈悲で残酷である。そして同時に、神聖な美しさをもっている。'
		this.fontSizeMin = 3
		this.angleDistortion = 0.0
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

		this.p.background(0, 5)

		if (this.p.frameCount % 4 === 0) {
			this.pointCount++
			if (this.pointCount > 10) {
				this.initPoint()
				this.pointCount = 0
			}
			this.p.fill(this.p.random(200, 255))

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
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
