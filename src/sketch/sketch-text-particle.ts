'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'
import Matter from 'matter-js'

interface TextParticle {
	body: Matter.Body
	char: string
	size: number
	hue: number
}

class TextParticleSketch extends Sketch {
	// Matter.js properties
	private engine: Matter.Engine
	private world: Matter.World
	private boundaries: Matter.Body[]
	private particles: TextParticle[]

	// Text properties
	private text: string
	private font: p5.Font
	private currentIndex: number

	// Particle properties
	private lastDropTime: number
	private readonly MIN_PARTICLE_DISTANCE = 100

	// Physics constants
	private readonly TEXT_DROP_INTERVAL = 800
	private readonly GRAVITY_Y = 0.3
	private readonly BOUNDARY_RESTITUTION = 0.8
	private readonly PARTICLE_RESTITUTION = 0.6
	private readonly PARTICLE_FRICTION = 0.1

	// Particle size constants
	private readonly MIN_PARTICLE_SIZE = 24
	private readonly MAX_PARTICLE_SIZE = 96

	// Particle position constants
	private readonly POSITION_RANDOM_RANGE = 100
	private readonly RESET_Y_THRESHOLD = 100

	// Particle velocity constants
	private readonly INITIAL_X_VELOCITY_RANGE = 1
	private readonly INITIAL_Y_VELOCITY_RANGE = 1

	// Drawing constants
	private readonly BACKGROUND_ALPHA = 1
	private readonly TEXT_SIZE_MIN = 24
	private readonly TEXT_SIZE_MAX = 96

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: true,
			useMic: true
		})
		// Text initialize
		this.text =
			'心の目で見る世界は音の調べのように時に優しく時に激しく心を洗う自然の静けさの中に響く 自分自身を超える調べを感じよ 風に乗せて心の声を調和の中で解き放つ 木々のささやきに耳を傾け魂の奥底で鳴り響く調べを聴く 星空の下 心の琴線に触れる静寂の音色に身を委ねる'
		this.currentIndex = 0

		// Particle initialize
		this.lastDropTime = 0
		this.particles = []

		// Matter.js initialize
		this.engine = Matter.Engine.create()
		this.world = this.engine.world
		this.engine.gravity.y = this.GRAVITY_Y
		this.boundaries = []
	}

	preload(): void {
		super.preload()
		this.font = this.p.loadFont('font/NotoSerifJP-Medium.ttf')
	}

	// 【修正3】: 新しいヘルパーメソッドを追加して文字同士の距離をチェック
	private isPositionValid(x: number, y: number): boolean {
		for (const particle of this.particles) {
			const dx = particle.body.position.x - x
			const dy = particle.body.position.y - y
			const distance = Math.sqrt(dx * dx + dy * dy)
			if (distance < this.MIN_PARTICLE_DISTANCE) {
				return false
			}
		}
		return true
	}

	setup(): void {
		super.setup()

		// Boundary properties
		const boundaryOptions = {
			isStatic: true,
			restitution: this.BOUNDARY_RESTITUTION
		}
		const ground = Matter.Bodies.rectangle(
			this.p.width / 2,
			this.p.height + 30,
			this.p.width,
			60,
			boundaryOptions
		)
		const leftWall = Matter.Bodies.rectangle(
			-30,
			this.p.height / 2,
			60,
			this.p.height,
			boundaryOptions
		)
		const rightWall = Matter.Bodies.rectangle(
			this.p.width + 30,
			this.p.height / 2,
			60,
			this.p.height,
			boundaryOptions
		)
		this.boundaries = [ground, leftWall, rightWall]
		Matter.World.add(this.world, this.boundaries)

		// p5 properties
		this.p.background(0)
		this.p.textFont(this.font)
		this.p.pixelDensity(1)
		this.p.colorMode(this.p.HSB, 360, 100, 100, 1)
		this.p.textAlign(this.p.CENTER, this.p.CENTER)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.updatePhysics()
		this.addNewParticle()
		this.updateAndDrawParticles()

		if (this.fadeFlag) {
			this.p.image(this.graphic, 0, 0)
		}
	}

	private updatePhysics(): void {
		this.p.background(0, 0, 10, this.BACKGROUND_ALPHA)
		Matter.Engine.update(this.engine)
	}

	private addNewParticle(): void {
		const currentTime = this.p.millis()
		if (currentTime - this.lastDropTime > this.TEXT_DROP_INTERVAL) {
			const char = this.text[this.currentIndex]
			const size = this.p.random(
				this.MIN_PARTICLE_SIZE,
				this.MAX_PARTICLE_SIZE
			)

			let startX =
				this.p.width / 2 +
				this.p.random(
					-this.POSITION_RANDOM_RANGE,
					this.POSITION_RANDOM_RANGE
				)
			startX = this.p.constrain(startX, 100, this.p.width - 100)

			if (this.isPositionValid(startX, -50)) {
				this.createParticle(char, size, startX)
				this.currentIndex = (this.currentIndex + 1) % this.text.length
				this.lastDropTime = currentTime
			}
		}
	}

	private createParticle(char: string, size: number, startX: number): void {
		const particleOptions: Matter.IBodyDefinition = {
			restitution: this.PARTICLE_RESTITUTION,
			friction: this.PARTICLE_FRICTION,
			velocity: {
				x: this.p.random(
					-this.INITIAL_X_VELOCITY_RANGE,
					this.INITIAL_X_VELOCITY_RANGE
				),
				y: this.p.random(0, this.INITIAL_Y_VELOCITY_RANGE)
			}
		}

		const particle = {
			body: Matter.Bodies.circle(startX, -50, size / 2, particleOptions),
			char: char,
			size: size,
			hue: this.getHue()
		}
		Matter.World.add(this.world, particle.body)
		this.particles.push(particle)
	}

	private updateAndDrawParticles(): void {
		if (!this.p) return
		const volumes = this.getVolumeEachBand()
		this.particles.forEach((particle, index) => {
			this.resetParticlePositionIfNeeded(particle, volumes)
			this.drawParticle(particle, volumes)
		})
	}

	private resetParticlePositionIfNeeded(
		particle: TextParticle,
		volumes: number[]
	): void {
		if (!this.p) return
		const pos = particle.body.position
		if (pos.y > this.p.height + this.RESET_Y_THRESHOLD) {
			let newX =
				this.p.width / 2 +
				this.p.random(
					-this.POSITION_RANDOM_RANGE,
					this.POSITION_RANDOM_RANGE
				)
			newX = this.p.constrain(newX, 100, this.p.width - 100)

			if (this.isPositionValid(newX, -50)) {
				Matter.Body.setPosition(particle.body, {
					x: newX,
					y: -50
				})
				Matter.Body.setVelocity(particle.body, {
					x: this.p.random(
						-this.INITIAL_X_VELOCITY_RANGE,
						this.INITIAL_X_VELOCITY_RANGE
					),
					y: this.p.random(0, this.INITIAL_Y_VELOCITY_RANGE)
				})
				particle.hue = this.getHue()
				particle.size = this.p.floor(
					this.p.random(this.TEXT_SIZE_MIN, this.TEXT_SIZE_MAX)
				)
			}
		}
	}

	private drawParticle(particle: TextParticle, volumes: number[]): void {
		if (!this.p) return
		const brightness = this.calculateBrightness(volumes)
		this.renderParticle(particle, brightness)
	}

	private calculateBrightness(volumes: number[]): number {
		if (!this.p) return 0
		const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length
		return this.p.map(avgVolume, 0, 100, 50, 100)
	}

	private renderParticle(particle: TextParticle, brightness: number): void {
		if (!this.p) return
		const pos = particle.body.position

		this.p.push()
		this.p.translate(pos.x, pos.y)
		this.p.rotate(particle.body.angle)
		this.p.fill(particle.hue, 80, brightness)
		this.p.noStroke()
		this.p.textSize(particle.size)
		this.p.text(particle.char, 0, 0)
		this.p.pop()
	}

	// event methods
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

	dispose(): void {
		Matter.Engine.clear(this.engine)
		this.particles = []
		this.boundaries = []
		super.dispose()
	}
}
// function for entry point
export default function (): void {
	const sketch: TextParticleSketch = new TextParticleSketch()
	sketch.init()
}
