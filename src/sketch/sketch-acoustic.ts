'use strict'
import p5 from 'p5'
import Sketch from '@/class/Sketch'
import { fip } from '@/library/p5.FIP.js'

class SketchTest extends Sketch {
	image: p5.Image
	imageWidth: number
	imageX: number
	threshold: number
	thresholdMax: number
	thresholdMin: number
	timer: number
	timerMax: number
	timerMin: number
	timerCount: number
	glitch: p5.Shader
	layer: p5.Framebuffer
	// property
	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: false
		})
		// initialize
		this.thresholdMax = 3.0
		this.thresholdMin = 0.1
		this.threshold = 0
		this.timerMax = 360
		this.timerMin = 120
		this.timer = 0
		this.timerCount = 0
		this
	}

	preload(): void {
		super.preload()
		this.glitch = this.p.createShader(fip.defaultVert, fip.glitch)
		this.image = this.p.loadImage(`images/acoustic/soundwave03.png`)
	}

	setup(): void {
		super.setup()
		this.p.background(0)
		this.layer = this.p.createFramebuffer() as any as p5.Framebuffer
		this.imageWidth = (this.image.width * this.p.height) / this.image.height
		this.imageX = (this.p.width - this.imageWidth) / 2
		this.threshold = this.p.random(this.thresholdMin, this.thresholdMax)
		this.timer = this.p.random(this.timerMin, this.timerMax)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.timerCount++
		if (this.timerCount > 0 && this.timerCount < 30) {
			this.threshold = this.p.random(this.thresholdMin, this.thresholdMax)
		} else {
			this.threshold = 0
		}

		if (this.timerCount > this.timer) {
			this.timerCount = 0
			this.timer = this.p.random(this.timerMin, this.timerMax)
		}

		this.layer.begin()
		this.p.clear()
		this.p.scale(1, -1) // Flip the Y-axis to match the canvas (different coordinate system in framebuffer)
		this.p.image(
			this.image,
			-this.imageX,
			-this.p.height / 2,
			this.imageWidth,
			this.p.height
		)
		this.layer.end()

		// Apply the shader
		this.p.shader(this.glitch)

		// Set the shader uniforms
		this.glitch.setUniform('glitchIntensity', this.threshold) // Set the intensity of the glitch effect
		this.glitch.setUniform('texture', this.layer.color) // Set the texture to apply the shader to

		this.p.rect(0, 0, this.p.width, this.p.height) // Draw a rectangle to apply the shader to
		this.p.resetShader()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
