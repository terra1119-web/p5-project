'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

const MAX_PARTICLE_COUNT = 70
const MAX_TRAIL_COUNT = 30
const vertShader = `
	precision highp float;

	attribute vec3 aPosition;

	void main() {
		vec4 positionVec4 = vec4(aPosition, 1.0);
		positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
		gl_Position = positionVec4;
	}
`

const fragShader = `
	precision highp float;

	uniform vec2 resolution;
	uniform int trailCount;
	uniform vec2 trail[${MAX_TRAIL_COUNT}];
	uniform int particleCount;
	uniform vec3 particles[${MAX_PARTICLE_COUNT}];
	uniform vec3 colors[${MAX_PARTICLE_COUNT}];

	void main() {
			vec2 st = gl_FragCoord.xy / resolution.xy;  // Warning! This is causing non-uniform scaling.

			float r = 0.0;
			float g = 0.0;
			float b = 0.0;

			for (int i = 0; i < ${MAX_TRAIL_COUNT}; i++) {
				if (i < trailCount) {
					vec2 trailPos = trail[i];
					float value = float(i) / distance(st, trailPos.xy) * 0.00015;  // Multiplier may need to be adjusted if max trail count is tweaked.
					g += value * 0.5;
					b += value;
				}
			}

			float mult = 0.00005;

			for (int i = 0; i < ${MAX_PARTICLE_COUNT}; i++) {
				if (i < particleCount) {
					vec3 particle = particles[i];
					vec2 pos = particle.xy;
					float mass = particle.z;
					vec3 color = colors[i];

					r += color.r / distance(st, pos) * mult * mass;
					g += color.g / distance(st, pos) * mult * mass;
					b += color.b / distance(st, pos) * mult * mass;
				}
			}

			gl_FragColor = vec4(r, g, b, 1.0);
	}
`

class SketchTest extends Sketch {
	colorScheme: string[]
	shaded: Boolean
	theShader: p5.Shader
	shaderTexture: p5.Graphics
	trail: number[][]
	particles: Particle[]
	// property
	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: true,
			useMic: false
		})
		// initialize
		this.colorScheme = [
			'#E69F66',
			'#DF843A',
			'#D8690F',
			'#B1560D',
			'#8A430A'
		]
		this.shaded = true
		this.theShader
		this.shaderTexture
		this.trail = []
		this.particles = []
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.theShader = this.p.createShader(vertShader, fragShader)
		this.p.pixelDensity(1)
		this.shaderTexture = this.p.createGraphics(
			this.p.width,
			this.p.height,
			this.p.WEBGL
		)
		this.shaderTexture.noStroke()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.noStroke()

		// Trim end of trail.
		this.trail.push([this.p.mouseX, this.p.mouseY])
		// this.trail.push([
		// 	this.p.random(this.p.width),
		// 	this.p.random(this.p.height)
		// ])

		let removeCount = 1
		if (this.p.mouseIsPressed && this.p.mouseButton == this.p.CENTER) {
			removeCount++
		}

		for (let i = 0; i < removeCount; i++) {
			if (this.trail.length == 0) {
				break
			}

			if (this.p.mouseIsPressed || this.trail.length > MAX_TRAIL_COUNT) {
				this.trail.splice(0, 1)
			}
		}

		// Spawn particles.
		if (
			this.trail.length > 1 &&
			this.particles.length < MAX_PARTICLE_COUNT
		) {
			let mouse = new p5.Vector(this.p.mouseX, this.p.mouseY)
			mouse.sub(this.p.pmouseX, this.p.pmouseY)
			if (mouse.mag() > 10) {
				mouse.normalize()
				this.particles.push(
					new Particle(
						this.p,
						this.p.pmouseX,
						this.p.pmouseY,
						mouse.x,
						mouse.y,
						this.colorScheme.length
					)
				)
			}
		}

		// Move and kill particles.
		for (let i = this.particles.length - 1; i > -1; i--) {
			this.particles[i].move()
			if (this.particles[i].vel.mag() < 0.1) {
				this.particles.splice(i, 1)
			}
		}

		// Display shader.
		this.shaderTexture.shader(this.theShader)

		const data = this.serializeSketch()

		this.theShader.setUniform('resolution', [this.p.width, this.p.height])
		this.theShader.setUniform('trailCount', this.trail.length)
		this.theShader.setUniform('trail', data.trails)
		this.theShader.setUniform('particleCount', this.particles.length)
		this.theShader.setUniform('particles', data.particles)
		this.theShader.setUniform('colors', data.colors)

		this.shaderTexture.rect(0, 0, this.p.width, this.p.height)
		this.p.texture(this.shaderTexture)

		this.p.rect(0, 0, this.p.width, this.p.height)
	}

	serializeSketch() {
		let data = { trails: [], particles: [], colors: [] }

		for (let i = 0; i < this.trail.length; i++) {
			data.trails.push(
				this.p.map(this.trail[i][0], 0, this.p.width, 0.0, 1.0),
				this.p.map(this.trail[i][1], 0, this.p.height, 1.0, 0.0)
			)
		}

		for (let i = 0; i < this.particles.length; i++) {
			data.particles.push(
				this.p.map(this.particles[i].pos.x, 0, this.p.width, 0.0, 1.0),
				this.p.map(this.particles[i].pos.y, 0, this.p.height, 1.0, 0.0),
				(this.particles[i].mass * this.particles[i].vel.mag()) / 100
			)

			let itsColor = this.colorScheme[this.particles[i].colorIndex]
			data.colors.push(
				this.p.red(itsColor),
				this.p.green(itsColor),
				this.p.blue(itsColor)
			)
		}

		return data
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

class Particle {
	p: p5
	pos: p5.Vector
	vel: p5.Vector
	mass: number
	airDrag: number
	colorIndex: number
	constructor(p, x, y, vx, vy, length) {
		this.p = p
		this.pos = new p5.Vector(x, y)
		this.vel = new p5.Vector(vx, vy)
		this.vel.mult(this.p.random(10))
		this.vel.rotate(this.p.radians(this.p.random(-25, 25)))
		this.mass = this.p.random(1, 20)
		this.airDrag = this.p.random(0.92, 0.98)
		this.colorIndex = this.p.int(this.p.random(length))
	}

	move(): void {
		this.vel.mult(this.airDrag)
		this.pos.add(this.vel)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
