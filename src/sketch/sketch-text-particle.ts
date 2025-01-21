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

class SketchTest extends Sketch {
	// property
	private engine: Matter.Engine
	private world: Matter.World
	private particles: TextParticle[]
	private text: string
	private currentIndex: number
	private lastDropTime: number
	private boundaries: Matter.Body[]
	private font: p5.Font
	private readonly MIN_PARTICLE_DISTANCE = 100

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: true,
			useMic: true
		})
		// initialize
		this.text =
			'心の目で見る世界は音の調べのように時に優しく時に激しく心を洗う自然の静けさの中に響く 自分自身を超える調べを感じよ 風に乗せて心の声を調和の中で解き放つ 木々のささやきに耳を傾け魂の奥底で鳴り響く調べを聴く 星空の下 心の琴線に触れる静寂の音色に身を委ねる'
		this.currentIndex = 0
		this.lastDropTime = 0
		this.particles = []
		this.boundaries = []

		// Matter.jsの初期化
		this.engine = Matter.Engine.create()
		this.world = this.engine.world
		this.engine.gravity.y = 0.3
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

		// 【修正4】: 境界の反発係数を上げて、より活発な動きを実現
		const boundaryOptions = {
			isStatic: true,
			restitution: 0.8 // 0.6から0.8に変更
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

		this.p.textFont(this.font)
		this.p.pixelDensity(1)
		this.p.colorMode(this.p.HSB, 360, 100, 100, 1)
		this.p.textAlign(this.p.CENTER, this.p.CENTER)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0, 0, 10, 0.1)
		Matter.Engine.update(this.engine)

		const volumes = this.getVolumeEachBand()
		const hue = this.getHue()

		const currentTime = this.p.millis()
		// 【修正5】: 文字を追加する際の時間間隔を長く
		if (currentTime - this.lastDropTime > 800) {
			// 500msから800msに変更
			const char = this.text[this.currentIndex]
			const size = this.p.random(24, 64)

			// 【修正6】: 文字の初期位置をランダムに分散
			let startX = this.p.width / 2 + this.p.random(-100, 100)
			startX = this.p.constrain(startX, 100, this.p.width - 100)

			// 【修正7】: 位置が適切な場合のみ文字を追加
			if (this.isPositionValid(startX, -50)) {
				const particle = {
					body: Matter.Bodies.circle(startX, -50, size / 2, {
						restitution: 0.6,
						friction: 0.1,
						// 【修正8】: より自然な初期速度の設定
						velocity: {
							x: this.p.random(-1, 1), // -2~2から-1~1に変更
							y: this.p.random(0, 1) // 0~2から0~1に変更
						}
					}),
					char: char,
					size: size,
					hue: hue
				}

				Matter.World.add(this.world, particle.body)
				this.particles.push(particle)

				this.currentIndex = (this.currentIndex + 1) % this.text.length
				this.lastDropTime = currentTime
			}
		}

		// 【修正9】: パーティクルの位置リセット時も重なりチェック
		this.particles.forEach((particle, index) => {
			const pos = particle.body.position

			if (pos.y > this.p.height + 100) {
				let newX = this.p.width / 2 + this.p.random(-100, 100)
				newX = this.p.constrain(newX, 100, this.p.width - 100)

				if (this.isPositionValid(newX, -50)) {
					Matter.Body.setPosition(particle.body, {
						x: newX,
						y: -50
					})
					Matter.Body.setVelocity(particle.body, {
						x: this.p.random(-1, 1),
						y: this.p.random(0, 1)
					})
					particle.hue = this.getHue()
					particle.size = this.p.random(24, 64)
				}
			}

			const avgVolume =
				volumes.reduce((a, b) => a + b, 0) / volumes.length
			const brightness = this.p.map(avgVolume, 0, 100, 50, 100)

			this.p.push()
			this.p.translate(pos.x, pos.y)
			this.p.rotate(particle.body.angle)
			this.p.fill(particle.hue, 80, brightness)
			this.p.noStroke()
			this.p.textSize(particle.size)
			this.p.text(particle.char, 0, 0)
			this.p.pop()
		})

		if (this.fadeFlag) {
			this.p.image(this.graphic, 0, 0)
		}
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

	dispose(): void {
		Matter.Engine.clear(this.engine)
		this.particles = []
		this.boundaries = []
		super.dispose()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
