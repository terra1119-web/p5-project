'use strict'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	f: number
	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false
		})
		// initialize
		this.f = 0
	}

	setup(): void {
		super.setup()

		this.p.noStroke()
	}

	draw(): void {
		super.draw()
		if (!this.p) return
		this.p.background(0)

		const h = 120
		const P = this.p.PI
		const i = P / 32
		for (let x = -P; x < P; x += i) {
			for (let z = -P; z < P; z += i) {
				this.p.push()
				let y = this.p.tan(
					this.p.width -
						this.p.mag(this.p.noise(x), this.p.noise(z)) * this.f
				)
				this.p.scale(0.75)
				this.p.translate(x * h, z * h, -y * h * 3)
				this.p.sphere(this.p.mag(this.p.noise(x), this.p.noise(z)) * 2)
				this.p.pop()
			}
		}
		this.f += i / 8
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
