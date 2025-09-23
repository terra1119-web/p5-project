'use strict'
import Sketch from '@/class/Sketch'
import { vert, frag } from '@/assets/shader/shader-posthelious.js'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	theShader: p5.Shader
	shaderBg: p5.Graphics
	constructor() {
		super({
			// renderer: 'WEBGL',
			use2D: true,
			useMic: false,
		})
		// initialize
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(1)
		this.p.noStroke()

		this.theShader = this.p.createShader(vert, frag)

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

		this.p.background(0)

		// Pass the interactive information to the shader
		this.shaderBg.shader(this.theShader)
		this.theShader.setUniform('iResolution', [this.p.width, this.p.height])
		this.theShader.setUniform('iTime', this.p.millis() / 400.0)
		this.theShader.setUniform('iMouse', [this.p.mouseX, this.p.mouseY])

		// rect gives us some geometry on the screen to draw the shader on
		this.shaderBg.rect(0, 0, this.p.width, this.p.height)

		// Center the shader display on screen
		this.shaderBg.rect(0, 0, this.p.width, this.p.height)
		this.p.image(this.shaderBg, 0, 0, this.p.width, this.p.height)
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
