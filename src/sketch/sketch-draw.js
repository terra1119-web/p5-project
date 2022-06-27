'use strict'
import Sketch from '@/class/Sketch.js'

const colors = "e6e1c5-d4cb92-395c6b-80a4ed-bcd3f2-f24-fff-52489c-4062bb-59c3c3-ebebeb-f45b69-0c090d-e01a4f-f15946-f9c22e-53b3cb".split("-").map(a => "#" + a)
let overAllTexture

class Particle {
	constructor (args, s) {
		const def = {
			p: s.createVector(0, 0),
			v: s.createVector(0, 0),
			a: s.createVector(0, 0),
			r: 10,
			dp: s.random(0.93, 0.99),
			angMult: s.random(10, 50),
			color: s.random(colors),
			flg: false
		}
		this.s = s
		Object.assign(def, args)
		Object.assign(this, def)
	}
	draw () {
		// strokeWeight(3)
		mainGraphics.push()
		mainGraphics.translate(this.p.x, this.p.y)
		// const color = s.color(this.color)
		// color.setAlpha(125)
		mainGraphics.fill(this.color)
		mainGraphics.noStroke()
		//stroke(0,100)
		mainGraphics.ellipse(0, 0, this.r)
		mainGraphics.pop()
	}

	update () {
		this.p.add(this.v)
		this.v.add(this.a)
		let delta = this.s.createVector(this.p.x - this.s.width / 2, this.p.y - this.s.height / 2)
		let ang = delta.heading()
		let rr = delta.mag()

		this.v.x += -this.s.sin(ang * this.angMult + rr / 5) / 15 + this.s.cos(rr / 10) / 10
		this.v.y += -this.s.cos(ang * this.angMult + rr / 5) / 15 + this.s.sin(rr / 10) / 10
		this.a.x = (this.s.noise(this.p.x, this.p.y, 5) - 0.5) * 1.1
		this.a.y = (this.s.noise(this.p.x, this.p.y, 5000) - 0.5) * 1.1

		this.v.mult(0.95)
		// this.r*= this.dp
		if (this.r > 120 || this.r < 10) this.flg = !this.flg
		if (this.flg) {
			this.r *= this.dp
		} else {
			this.r += this.dp * 0.9
		}
	}
}

let particles = []
let mainGraphics

class SketchTest extends Sketch {
	setup (s) {
		super.setup()
		overAllTexture = s.createGraphics(s.width, s.height)
		mainGraphics = s.createGraphics(s.width, s.height)
		// mainGraphics.blendMode(s.ADD)
		overAllTexture.loadPixels()

		// noStroke()
		for (let i = 0; i < s.width + 50; i++) {
			for (let o = 0; o < s.height + 50; o++) {
				overAllTexture.set(i, o, s.color(150, s.noise(i / 10, i * o / 300) * s.random([0, 50, 100])))
			}
		}
		overAllTexture.updatePixels()

		s.background(0)
		for (let i = 0; i < s.width; i += 200) {
			for (let o = 0; o < s.height; o += 100) {
				particles.push(
					new Particle({
						p: s.createVector(i, o),
						v: s.createVector(s.noise(i / 10) * 10 - 5, s.noise(o / 10) * 10 - 5),
						r: s.random(150)
					}, s)
				)
			}
		}
		mainGraphics.background(0)
	}

	draw (s) {
		super.draw()
		particles.forEach(p => p.draw())
		particles.forEach(p => p.update())
		s.image(mainGraphics, 0, 0)

		s.push()
		s.blendMode(s.ADD)
		s.image(overAllTexture, 0, 0)
		s.pop()
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}