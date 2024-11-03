'use strict'
import Sketch from '@/class/Sketch'
import { vert, frag } from '@/assets/shader/shader.js'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	gfx: p5.Graphics
	theShader: p5.Shader
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(1)

		this.gfx = this.p.createGraphics(
			this.p.width,
			this.p.height,
			this.p.WEBGL
		)
		this.theShader = this.p.createShader(vert, frag)

		this.p.noStroke()
		this.gfx.noStroke()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.gfx.background(0)

		this.gfx.shader(this.theShader)
		this.theShader.setUniform('tex0', this.canvas)
		this.theShader.setUniform('canvasSize', [this.p.width, this.p.height])
		this.theShader.setUniform('texelSize', [
			1 / (this.p.width * 1),
			1 / (this.p.height * 1)
		])
		this.theShader.setUniform('mouse', [
			this.p.mouseX / this.p.width,
			this.p.mouseY / this.p.height
		])
		this.theShader.setUniform('time', this.p.frameCount / 60)
		this.gfx.quad(-1, 1, 1, 1, 1, -1, -1, -1)

		this.p.image(this.gfx, 0, 0)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
