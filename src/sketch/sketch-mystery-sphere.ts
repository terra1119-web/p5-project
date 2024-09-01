'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	colorPalletes: {
		name: string
		colors: string[]
	}[]
	s: number
	pg: p5.Graphics
	n: number
	pos: p5.Vector[]
	c: number[]

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: false
		})
		// initialize

		this.colorPalletes = [
			{
				name: 'DeepEmeraldGold',
				colors: ['#005e55', '#fff9bf', '#edb50c', '#b8003d', '#5e001f']
			},
			{
				name: 'WarmRainbow',
				colors: ['#01204E', '#028391', '#F6DCAC', '#FAA968', '#F85525']
			},
			{
				name: 'ChocolateAndCream',
				colors: ['#D54751', '#EF9A48', '#FFFCC7', '#4DA394', '#59322B']
			},
			{
				name: 'PopArt',
				colors: ['#241965', '#653993', '#9F4094', '#B73D6E', '#F19406']
			},
			{
				name: 'DeepEmeraldGold',
				colors: ['#F87523', '#FFC31B', '#E7DCC9', '#1DB7B9', '#126D68']
			},
			{
				name: 'GreenPink',
				colors: ['#01B999', '#FAB3B3', '#DC958F', '#A1D8CE', '#F1FAF7']
			},
			{
				name: 'NatureTranquility',
				colors: ['#106A6B', '#07374B', '#CAB381', '#E9E0CE']
			},
			{
				name: 'VibrantHarmony',
				colors: ['#F15946', '#5681CB', '#FAAA2D', '#296647', '#453945']
			},
			{
				name: 'Serenity Bliss',
				colors: ['#FFB4B8', '#EF4B28', '#0A563A', '#FFBC54', '#ECE9E0']
			}
		]

		this.s = 300
		this.n = 8000
		this.pos = []
		this.c = []
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.pg = this.p.createGraphics(this.s * 10, this.s * 10)
		// this.pg.background(255);

		for (let i = 0; i < this.n; i++) {
			this.pos[i] = this.p.createVector(
				this.p.random(this.pg.width),
				this.p.random(this.pg.height)
			)
			this.c[i] = this.p.random(255)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)

		this.p.camera(
			1000 * this.p.cos(this.p.frameCount / 300),
			-300,
			1000 * this.p.sin(this.p.frameCount / 300),
			0,
			0,
			0,
			0,
			1,
			0
		)

		this.p.ambientLight(200)
		this.p.pointLight(
			255,
			0,
			0,
			1000 * this.p.cos(this.p.frameCount / 150),
			-300,
			1000 * this.p.sin(this.p.frameCount / 150)
		)
		this.p.pointLight(
			255,
			255,
			0,
			1000 * this.p.cos(this.p.frameCount / 200),
			300,
			1000 * this.p.sin(this.p.frameCount / 200)
		)
		this.p.pointLight(
			0,
			255,
			0,
			1000 * this.p.cos(this.p.frameCount / 100),
			100,
			1000 * this.p.sin(this.p.frameCount / 100)
		)

		for (let i in this.pos) {
			const d = this.p.createVector(
				this.p.noise(
					(this.pos[i].x / this.pg.width) * 15,
					(this.pos[i].y / this.pg.height) * 15,
					0.1
				) - 0.5,
				this.p.noise(
					(this.pos[i].x / this.pg.width) * 15,
					(this.pos[i].y / this.pg.height) * 15,
					10.2
				) - 0.5
			)
			d.mult(10)

			this.pos[i].add(d)

			this.pg.strokeWeight(5 * this.p.noise(this.p.frameCount / 100, +i))
			this.pg.stroke(this.c[i])
			this.pg.point(this.pos[i].x, this.pos[i].y)
		}

		this.p.noStroke()
		this.p.texture(this.pg)
		this.p.sphere(this.s)
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

class Easing {
	static easeInSine(x) {
		return 1 - Math.cos((x * Math.PI) / 2)
	}

	static easeOutSine(x) {
		return Math.sin((x * Math.PI) / 2)
	}

	static easeInOutSine(x) {
		return -(Math.cos(Math.PI * x) - 1) / 2
	}

	static easeInQuad(x) {
		return x * x
	}

	static easeOutQuad(x) {
		return 1 - (1 - x) * (1 - x)
	}

	static easeInOutQuad(x) {
		return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
	}

	static easeInCubic(x) {
		return x * x * x
	}

	static easeOutCubic(x) {
		return 1 - Math.pow(1 - x, 3)
	}

	static easeInOutCubic(x) {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
	}

	static easeInQuart(x) {
		return x * x * x * x
	}

	static easeOutQuart(x) {
		return 1 - Math.pow(1 - x, 4)
	}

	static easeInOutQuart(x) {
		return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2
	}

	static easeInQuint(x) {
		return x * x * x * x * x
	}

	static easeOutQuint(x) {
		return 1 - Math.pow(1 - x, 5)
	}

	static easeInOutQuint(x) {
		return x < 0.5
			? 16 * x * x * x * x * x
			: 1 - Math.pow(-2 * x + 2, 5) / 2
	}

	static easeInExpo(x) {
		return x === 0 ? 0 : Math.pow(2, 10 * x - 10)
	}

	static easeOutExpo(x) {
		return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
	}

	static easeInOutExpo(x) {
		return x === 0
			? 0
			: x === 1
			? 1
			: x < 0.5
			? Math.pow(2, 20 * x - 10) / 2
			: (2 - Math.pow(2, -20 * x + 10)) / 2
	}

	static easeInCirc(x) {
		return 1 - Math.sqrt(1 - Math.pow(x, 2))
	}

	static easeOutCirc(x) {
		return Math.sqrt(1 - Math.pow(x - 1, 2))
	}

	static easeInOutCirc(x) {
		return x < 0.5
			? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
			: (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2
	}

	static easeOutBack(x) {
		const c1 = 1.70158
		const c3 = c1 + 1
		return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
	}

	static easeInOutBack(x) {
		const c1 = 1.70158
		const c2 = c1 * 1.525
		return x < 0.5
			? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
			: (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
