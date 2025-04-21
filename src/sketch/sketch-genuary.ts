'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	private t = 0.0
	private vel = 0.02
	private num: number
	private palette_selected: string[]
	private paletteSelected1: string[]
	private paletteSelected2: string[]
	private counter = 0
	private end = 1000000
	private palettes = [
		['#e9dbce', '#fceade', '#ea526f', '#e2c290', '#6b2d5c', '#25ced1'],
		['#223843', '#e9dbce', '#eff1f3', '#dbd3d8', '#d8b4a0', '#d77a61'],
		['#e29578', '#ffffff', '#006d77', '#83c5be', '#ffddd2', '#edf6f9'],
		['#e9dbce', '#ffffff', '#cc3528', '#028090', '#00a896', '#f8c522'],
		['#e9dbce', '#f8f7c1', '#f46902', '#da506a', '#fae402', '#92accc'],
		['#e42268', '#fb8075', '#761871', '#5b7d9c', '#a38cb4', '#476590'],
		['#f9b4ab', '#fdebd3', '#264e70', '#679186', '#bbd4ce'],
		['#1f306e', '#553772', '#8f3b76', '#c7417b', '#f5487f'],
		['#e0f0ea', '#95adbe', '#574f7d', '#503a65', '#3c2a4d'],
		['#413e4a', '#73626e', '#b38184', '#f0b49e', '#f7e4be'],
		['#ff4e50', '#fc913a', '#f9d423', '#ede574', '#e1f5c4'],
		['#99b898', '#fecea8', '#ff847c', '#e84a5f', '#2a363b'],
		['#69d2e7', '#a7dbd8', '#e0e4cc', '#f38630', '#fa6900'],
		['#fe4365', '#fc9d9a', '#f9cdad', '#c8c8a9', '#83af9b'],
		['#ecd078', '#d95b43', '#c02942', '#542437', '#53777a'],
		['#556270', '#4ecdc4', '#c7f464', '#ff6b6b', '#c44d58'],
		['#774f38', '#e08e79', '#f1d4af', '#ece5ce', '#c5e0dc'],
		['#e8ddcb', '#cdb380', '#036564', '#033649', '#031634'],
		['#490a3d', '#bd1550', '#e97f02', '#f8ca00', '#8a9b0f'],
		['#594f4f', '#547980', '#45ada8', '#9de0ad', '#e5fcc2'],
		['#00a0b0', '#6a4a3c', '#cc333f', '#eb6841', '#edc951'],
		['#5bc0eb', '#fde74c', '#9bc53d', '#e55934', '#fa7921'],
		['#ed6a5a', '#f4f1bb', '#9bc1bc', '#5ca4a9', '#e6ebe0'],
		['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
		['#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4'],
		['#114b5f', '#1a936f', '#88d498', '#c6dabf', '#f3e9d2'],
		['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'],
		['#06aed5', '#086788', '#f0c808', '#fff1d0', '#dd1c1a'],
		['#540d6e', '#ee4266', '#ffd23f', '#3bceac', '#0ead69'],
		['#c9cba3', '#ffe1a8', '#e26d5c', '#723d46', '#472d30'],
		['#3c4cad', '#5FB49C', '#e8a49c'],
		['#1c3560', '#f2efdb', '#fea985', '#ff6343'],
		[
			'#e0d7c5',
			'#488a50',
			'#b59a55',
			'#bf5513',
			'#3b6fb6',
			'#4f3224',
			'#9a7f6e',
		], //o-ball
		['#ffb53c', '#eeb3a3', '#f3553c', '#642a02'], //bloodOrange
		['#DEEFB7', '#5FB49C', '#ed6a5a'],
		['#2B2B2B', '#91B3E1', '#2F5FB3', '#3D4B89', '#AE99E8', '#DBE2EC'], //clipper_tea.snore&peace.
		['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'],
	]

	constructor() {
		super({})
	}

	setup(): void {
		super.setup()
		this.p.pixelDensity(2)
		this.p.angleMode(this.p.DEGREES)
		this.num = this.p.random(100000)
		this.palette_selected = this.p.random(this.palettes)
		this.paletteSelected1 = this.p.random(this.palettes)
		this.paletteSelected2 = this.p.random(this.palettes)
		this.p.background(0)
		this.grid()
	}

	draw(): void {
		super.draw()
		if (this.counter < this.end) {
			if (this.p.frameCount % 1 === 0) {
				for (let i = 0; i < 100; i++) {
					const x = this.p.randomGaussian(
						this.p.width / 2,
						this.p.width * 0.1
					)
					const y = this.p.randomGaussian(
						this.p.height / 2,
						this.p.height * 0.1
					)
					const r = this.p.randomGaussian(
						this.p.height * 0.001,
						this.p.height * 0.02
					)
					this.draw_shape(x, y, r)
				}
			}
		}

		if (this.counter < this.end - 1) {
			if (this.p.frameCount % 100 === 0) {
				this.paletteSelected1 = this.p.random(this.palettes)
				this.paletteSelected2 = this.p.random(this.palettes)
				this.grid()
			}
		}
	}

	private draw_shape(x: number, y: number, r: number): void {
		if (this.p.random() < 0.001) {
			const flower = new Flower(
				this.p,
				x,
				y,
				r * 3,
				this.palette_selected
			)
			flower.show()
		} else {
			const poly = new Poly(
				this.p,
				x,
				y,
				r,
				this.paletteSelected1,
				this.paletteSelected2
			)
			poly.show()
		}
		this.counter++
	}

	private grid(): void {
		const g_num = 60
		const w = this.p.width / g_num
		this.p.strokeWeight(0.5)
		for (let x = 0; x < g_num; x++) {
			for (let y = 0; y < g_num; y++) {
				this.p.stroke(this.p.random(this.palette_selected))

				if (x % 2 || y % 2) {
					this.p.push()
					this.p.drawingContext.setLineDash([1, 2])
					this.p.line(x * w, 0, x * w, this.p.height)
					this.p.line(0, y * w, this.p.width, y * w)
					this.p.pop()
				} else {
					this.p.line(x * w, 0, x * w, this.p.height)
					this.p.line(0, y * w, this.p.width, y * w)
				}
			}
		}
	}
}

class Flower {
	private pos: p5.Vector
	private r: number
	private d: number
	private topNum: number
	private angle: number

	constructor(
		private p: p5,
		x: number,
		y: number,
		r: number,
		private palette: string[]
	) {
		this.pos = p.createVector(x, y)
		this.r = r
		this.d = p.random(0.2)
		this.topNum = p.int(p.random(10))
		this.angle = p.random(360)
	}

	show(): void {
		this.p.push()
		this.p.fill(255, 0)
		this.p.noStroke()
		this.p.translate(this.pos.x, this.pos.y)
		this.p.rotate(this.angle)

		this.p.beginShape()
		for (let i = 0; i < 360; i += 1) {
			const radius = this.r + this.r * this.d * Math.sin(i * this.topNum)
			const ex = radius * Math.sin(i)
			const ey = radius * Math.cos(i)
			this.p.vertex(ex, ey)
		}
		this.p.endShape(this.p.CLOSE)
		this.p.drawingContext.clip()

		this.p.push()
		const nums = 280
		const w = this.p.width / nums
		this.p.noStroke()
		this.p.fill(this.p.random(this.palette))
		this.p.translate(-this.p.width / 2, -this.p.height / 2)
		for (let j = 0; j < nums; j++) {
			for (let i = 0; i < nums; i++) {
				if (j % 2) {
					this.p.ellipse(i * w + w / 2, j * w, w * 0.5)
				} else {
					this.p.ellipse(i * w, j * w, w * 0.5)
				}
			}
		}
		this.p.pop()
		this.p.pop()
	}
}

class Poly {
	private pos: p5.Vector
	private r: number
	private angle: number
	private d: number
	private col1: p5.Color
	private col2: p5.Color

	constructor(
		private p: p5,
		x: number,
		y: number,
		r: number,
		palette1: string[],
		palette2: string[]
	) {
		this.pos = p.createVector(x, y)
		this.r = r
		this.angle = p.random(360)
		this.d = r * p.random(0.3, 0.8)
		this.col1 = p.color(p.random(palette1))
		this.col1.setAlpha(10)
		this.col2 = p.color(p.random(palette2))
	}

	show(): void {
		this.p.push()
		this.p.translate(this.pos.x, this.pos.y)
		this.p.rotate(this.angle)

		if (this.p.random() < 0.9) {
			this.p.noStroke()
			const gradientFill = this.p.drawingContext.createLinearGradient(
				0,
				-this.d,
				0,
				this.d
			)
			gradientFill.addColorStop(0, this.col1.toString())
			gradientFill.addColorStop(1, this.col2.toString())
			this.p.drawingContext.fillStyle = gradientFill
		} else {
			this.p.noFill()
			this.p.stroke(this.col1)
		}

		if (this.p.random() < 0.5) {
			this.p.beginShape()
			const nums = this.p.int(this.p.random(3, 6))
			const dep = this.p.random(0.1, 0.3)
			for (let i = 0; i < 360; i += 1) {
				const radius = this.d + this.d * dep * this.p.sin(i * nums)
				const ex = radius * this.p.sin(i)
				const ey = radius * this.p.cos(i)
				this.p.vertex(ex, ey)
			}
			this.p.endShape(this.p.CLOSE)
		} else {
			const h = this.d * this.p.random(0.2, 1)
			this.p.rect(0, 0, this.d, h, Math.abs(h / 2))
		}

		this.p.pop()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
