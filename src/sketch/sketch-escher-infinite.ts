'use strict'
import Sketch from '@/class/Sketch'
import { vert, frag } from '@/assets/shader/shader-escher-infinite.js'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	theShader: p5.Shader
	shaderBg: p5.Graphics
	moves: number[]
	time_: number
	framerate: number
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false,
		})
		// initialize
		this.moves = [0, 0]
	}

	preload(): void {
		super.preload()
	}

	async setup(): Promise<void> {
		super.setup()

		this.theShader = this.p.createShader(vert, frag)

		// disables scaling for retina screens which can create inconsistent scaling between displays
		this.p.pixelDensity(1)
		this.p.noStroke()

		// shaders require WEBGL mode to work
		this.shaderBg = this.p.createGraphics(
			this.p.width,
			this.p.height,
			this.p.WEBGL
		)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.shaderBg.shader(this.theShader)

		// pass the interactive information to the shader
		this.theShader.setUniform('iResolution', [this.p.width, this.p.height])
		this.theShader.setUniform('iTime', this.p.millis() / 1000.0)
		this.theShader.setUniform('iMouse', this.moves)

		// rect gives us some geometry on the screen to draw the shader on
		this.shaderBg.rect(0, 0, this.p.width, this.p.height)
		this.p.image(this.shaderBg, 0, 0, this.p.width, this.p.height)

		let increment = 20 / ((this.p.frameRate() || 60) * 140) // timestep based on framerate, will rotate same speed on all regardless of framerate
		this.time_ += increment
		if (this.time_ > this.p.TWO_PI) this.time_ -= this.p.TWO_PI
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
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
