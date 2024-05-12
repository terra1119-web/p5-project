'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	mode: number
	newNoise: NoiseImage
	theImagePost: p5.Image
	offset: number
	pos: p5.Vector
	direction: p5.Vector
	looptime: number
	starttime: number
	gels: string[]
	gelcolor: number
	reloop: boolean
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
		this.mode = 0 // shape type
		this.newNoise // the noise noise generation object
		this.theImagePost // final image render kept for blending into  the next frame
		this.offset = 100 // edge buffer for noise
		this.pos
		this.direction // used if a random walk is needed in the gradient function
		this.looptime = 15000 // in millis() grow time of shape and plasma scale
		this.starttime //millis() of the last time startup function executed
		this.gels = [
			'#ffffff77',
			'#ff0000',
			'#00ff00',
			'#0000ff',
			'#ffff00aa',
			'#ff00ff',
			'#00ffff99'
		] // to colorize the image
		this.gelcolor
		this.reloop = false
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(1)
		this.p.background(0)
		this.theImagePost = this.p.get(0, 0, this.p.width, this.p.height)
		this.p.noFill()
		this.pos = this.p.createVector(this.p.width / 2, this.p.height / 2) //random walk (only used for the line mode)
		this.direction = p5.Vector.random2D().mult(5) //random walk (only used for the line mode)

		this.p.noiseDetail(4, 0.5)

		this.newNoise = new NoiseImage(
			this.p,
			this.p.width + this.offset,
			this.p.height + this.offset,
			0.06
		) // initialize the noise image object

		this.mode = this.p.floor(this.p.random(8)) //random start mode
		this.gelcolor = this.p.random(this.gels) //random start color

		this.starttime = this.p.millis() // millis() dont reset when startup is called, hence this
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		let drawtime = this.p.millis() - this.starttime

		if (
			drawtime % this.looptime < 1000 / this.p.frameRate() &&
			!this.reloop
		) {
			// restarting the loop with different values
			let lastmode = this.mode
			while (lastmode == this.mode)
				this.mode = this.p.floor(this.p.random(8))
			let lastcolor = this.gelcolor
			while (lastcolor == this.gelcolor)
				this.gelcolor = this.p.random(this.gels)
			this.reloop = true
		} else {
			this.reloop = false
		}

		this.newNoise.update() // let the noise image class do its thing

		this.p.blendMode(this.p.BLEND) // draw the shaped gradient

		switch (this.mode) {
			case 0:
				this.gradient(
					this.p.map(
						drawtime % this.looptime,
						0,
						this.looptime,
						32,
						this.p.width / 2
					)
				) // linear gradient
				break
			case 1:
				this.gradient2(
					this.p.map(
						drawtime % this.looptime,
						0,
						this.looptime,
						0,
						this.p.width
					)
				) // circular gradient
				break
			default:
				this.gradient3(
					this.p.map(
						drawtime % this.looptime,
						0,
						this.looptime,
						0,
						this.p.width
					),
					this.mode + 1
				) // n-gon gradient
		}

		this.p.blendMode(this.p.DIFFERENCE) // difference blend noise
		if (this.p.random(1) > 0.1) {
			this.newNoise.display()
		} else {
			this.p.fill(128) // 1 in 10 chance of neutral grey so the shape will be shown
			this.p.rect(0, 0, this.p.width, this.p.height)
		}

		this.p.filter(this.p.INVERT) // negate the image

		let tempImage = this.p.get(0, 0, this.p.width, this.p.height)
		this.p.blendMode(this.p.MULTIPLY) // multiply itself a bunch of times, which is faster than a pixel based level curve adjustment
		for (let i = 0; i < 10; i++) {
			this.p.image(tempImage, 0, 0)
		}

		this.p.blendMode(this.p.OVERLAY) // add a color overlay
		this.p.fill(this.gelcolor)
		this.p.rect(0, 0, this.p.width, this.p.height)

		this.p.blendMode(this.p.LIGHTEST) // blend in the captured image fromt he previous frame
		this.p.image(this.theImagePost, 0, 0)

		this.p.blendMode(this.p.BLEND) // paint a semitransparent black over things to get afterimage effect
		this.p.noStroke()
		this.p.fill(0, 0, 0, 85)
		this.p.rect(0, 0, this.p.width, this.p.height)

		this.theImagePost = this.p.get(0, 0, this.p.width, this.p.height) // grab the final image for the frame overlay

		this.pos.x = this.p.constrain(
			this.pos.x + this.direction.x,
			0.1 * this.p.width,
			0.9 * this.p.width
		) // update the random walk
		this.pos.y = this.p.constrain(
			this.pos.y + this.direction.y,
			0.1 * this.p.height,
			0.9 * this.p.height
		)
		this.direction.rotate(this.p.randomGaussian(0, 0.4)) // change the ransom walk direction
	}

	mousePressed(): void {
		super.mousePressed()
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

	gradient(w: number) {
		this.p.push()
		this.p.translate(this.pos.x, this.pos.y)
		this.p.rotate(-this.p.frameCount / 50)
		this.p.noStroke()
		this.p.background(0)
		this.p.fill(255)
		this.p.rect(-2 * this.p.width, 0, 4 * this.p.width, 2 * this.p.height)

		for (let i = 0; i < 256; i++) {
			this.p.fill(i)
			this.p.rect(
				-2 * this.p.width,
				((i / 2 - 64) * w) / 160,
				4 * this.p.width,
				(2 * w) / 160
			)
		}
		this.p.pop()
	}

	//circular gradient
	gradient2(w: number) {
		this.p.push()
		this.p.translate(this.p.width / 2, this.p.height / 2)
		this.p.rotate(-this.p.frameCount / 50)

		this.p.noStroke()
		this.p.background(0)

		let inner = w * 0.6
		let outer = w * 1.0 + 100
		for (let i = 0; i < 256; i++) {
			this.p.fill(i)
			this.p.circle(0, 0, this.p.map(i, 0, 255, outer, inner))
		}
		this.p.pop()
	}

	//ngon gradient
	gradient3(w: number, s: number) {
		this.p.push()
		this.p.rectMode(this.p.CENTER)
		this.p.translate(this.p.width / 2, this.p.height / 2)
		this.p.rotate(-this.p.frameCount / 50)
		this.p.noStroke()
		this.p.background(0)

		let inner = w * 0.5
		let outer = w * 1.1 + 100
		for (let i = 0; i < 256; i++) {
			this.p.fill(i)
			this.ngon(
				0,
				0,
				this.p.map(i, 0, 255, outer, inner),
				this.p.map(i, 0, 255, outer, inner)
			)
		}
		this.p.pop()
	}

	ngon(n: number, x: number, y: number, d: number) {
		this.p.beginShape()
		for (let i = 0; i < n; i++) {
			const angle = (this.p.TWO_PI / n) * i
			const px = x + (this.p.cos(angle) * d) / 2
			const py = y + (this.p.sin(angle) * d) / 2
			this.p.vertex(px, py)
		}
		this.p.endShape(this.p.CLOSE)
	}
}

class NoiseImage {
	p: p5
	pg: p5.Graphics
	pg2: p5.Graphics
	nf: number
	pointer: number
	xoff: number
	yoff: number
	offset: number

	constructor(p: p5, _x: number, _y: number, _nf: number) {
		this.p = p
		this.pg = this.p.createGraphics(_x, _y)
		this.pg2 = this.p.createGraphics(
			this.p.floor(_x / 6),
			this.p.floor(_y / 6)
		) // taking out the floor() causes a real cool glitch effect
		this.nf = _nf
		//this.pg.background(128);
		this.pointer = 0
		this.xoff = 0
		this.yoff = 0
		this.offset = 100

		this.pg2.loadPixels()
		for (let c = 0; c < this.pg2.width * this.pg2.height; c++) {
			let i = c % this.pg2.width
			let j = this.p.floor(c / this.pg2.width)
			this.pg2.set(
				i,
				j,
				this.p.map(
					this.p.noise(
						this.xoff + this.nf * i,
						this.yoff + this.nf * j
					),
					0,
					1,
					64,
					200,
					true
				)
			)
		}
		this.pg2.updatePixels()
		this.pg.image(this.pg2, 0, 0, this.pg.width, this.pg.height)
		this.xoff = this.p.random(100)
		this.yoff = this.p.random(100)
	}

	update() {
		if (this.pointer <= this.pg2.width * this.pg2.height) {
			// still rendering
			this.pg2.loadPixels()
			const maxTime = this.p.millis() + 30 // sets the amount of time you are willing to take up on adding random noise in milliseconds per frame
			while (this.p.millis() < maxTime) {
				let i = this.pointer % this.pg2.width
				let j = this.p.floor(this.pointer / this.pg2.width)
				this.pg2.set(
					i,
					j,
					this.p.map(
						this.p.noise(
							this.xoff + this.nf * i,
							this.yoff + this.nf * j
						),
						0,
						1,
						64,
						200,
						true
					)
				)
				this.pointer++
			}
			this.pg2.updatePixels()
		} else {
			// done rendering, flip the scratch pgraphic object for the "real" one
			this.pointer = 0
			this.pg.image(this.pg2, 0, 0, this.pg.width, this.pg.height)
			this.xoff = this.p.random(100)
			this.yoff = this.p.random(100)
		}
	}

	display() {
		// one of 4 mirror versions with random offset
		switch (this.p.floor(this.p.random(4))) {
			case 0:
				this.p.image(
					this.pg,
					-this.p.random(this.offset / 2),
					-this.p.random(this.offset / 2),
					this.pg.width,
					this.pg.height
				)
				break
			case 1:
				this.p.image(
					this.pg,
					-this.p.random(this.offset / 2),
					this.p.height + this.p.random(this.offset / 2),
					this.pg.width,
					-this.pg.height
				)
				break
			case 2:
				this.p.image(
					this.pg,
					this.p.width + this.p.random(this.offset / 2),
					-this.p.random(this.offset / 2),
					-this.pg.width,
					this.pg.height
				)
				break
			case 3:
				this.p.image(
					this.pg,
					this.p.width + this.p.random(this.offset / 2),
					this.p.height + this.p.random(this.offset / 2),
					-this.pg.width,
					-this.pg.height
				)
				break
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
