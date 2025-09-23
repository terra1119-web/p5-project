'use strict'
import Sketch from '@/class/Sketch'
import { vert, frag } from '@/assets/shader/shader-accretion.js'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	theShader: p5.Shader
	shaderBg: p5.Graphics
	constructor() {
		super({
			renderer: 'P2D',
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

		// shaders require WEBGL mode to work
		this.shaderBg = this.p.createGraphics(
			this.p.width,
			this.p.height,
			this.p.WEBGL
		)

		this.theShader = this.p.createShader(vert, frag)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		// we can draw the background each frame or not.
		// if we do we can use transparency in our shader.
		// if we don't it will leave a trailing after image.
		// background(0);
		// shader() sets the active shader with our shader
		this.shaderBg.shader(this.theShader)

		// get the mouse coordinates, map them to values between 0-1 space
		let yMouse =
			(this.p.map(this.p.mouseY, 0, this.p.height, this.p.height, 0) /
				this.p.height) *
				2 -
			1
		let xMouse = (this.p.mouseX / this.p.width) * 2 - 1

		// Make sure pixels are square
		xMouse = (xMouse * this.p.width) / this.p.height
		yMouse = yMouse

		// pass the interactive information to the shader
		this.theShader.setUniform('iResolution', [this.p.width, this.p.height])
		this.theShader.setUniform('iTime', this.p.millis() / 1000.0)
		this.theShader.setUniform('iMouse', [xMouse, yMouse])

		// rect gives us some geometry on the screen to draw the shader on
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
