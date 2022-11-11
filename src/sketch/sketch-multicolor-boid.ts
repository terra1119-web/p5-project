'use strict'
import Sketch from '@/class/Sketch'

type colorSchemeType = {
	name: String
	colors: String[]
}

type gridType = {
	x: number
	y: number
	w: number
	c: number
	angle: number
	shape: string
}

class SketchTest extends Sketch {
	// property
	angle: number
	palette: string[]
	colorScheme: colorSchemeType[]
	offset: number
	grids: gridType[]
	g: gridType
	easeArray: any[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
		})
		// initialize
		this.colorScheme = [
			{
				name: 'Benedictus',
				colors: ['#F27EA9', '#366CD9', '#5EADF2', '#636E73', '#F2E6D8'],
			},
			{
				name: 'Cross',
				colors: ['#D962AF', '#58A6A6', '#8AA66F', '#F29F05', '#F26D6D'],
			},
			{
				name: 'Demuth',
				colors: ['#222940', '#D98E04', '#F2A950', '#BF3E21', '#F2F2F2'],
			},
			{
				name: 'Hiroshige',
				colors: ['#1B618C', '#55CCD9', '#F2BC57', '#F2DAAC', '#F24949'],
			},
			{
				name: 'Hokusai',
				colors: ['#074A59', '#F2C166', '#F28241', '#F26B5E', '#F2F2F2'],
			},
			{
				name: 'Hokusai Blue',
				colors: ['#023059', '#459DBF', '#87BF60', '#D9D16A', '#F2F2F2'],
			},
			{
				name: 'Java',
				colors: ['#632973', '#02734A', '#F25C05', '#F29188', '#F2E0DF'],
			},
			{
				name: 'Kandinsky',
				colors: ['#8D95A6', '#0A7360', '#F28705', '#D98825', '#F2F2F2'],
			},
			{
				name: 'Monet',
				colors: ['#4146A6', '#063573', '#5EC8F2', '#8C4E03', '#D98A29'],
			},
			{
				name: 'Nizami',
				colors: ['#034AA6', '#72B6F2', '#73BFB1', '#F2A30F', '#F26F63'],
			},
			{
				name: 'Renoir',
				colors: ['#303E8C', '#F2AE2E', '#F28705', '#D91414', '#F2F2F2'],
			},
			{
				name: 'VanGogh',
				colors: ['#424D8C', '#84A9BF', '#C1D9CE', '#F2B705', '#F25C05'],
			},
			{
				name: 'Mono',
				colors: ['#D9D7D8', '#3B5159', '#5D848C', '#7CA2A6', '#262321'],
			},
			{
				name: 'RiverSide',
				colors: ['#906FA6', '#025951', '#252625', '#D99191', '#F2F2F2'],
			},
		]
	}

	setup(): void {
		super.setup()

		this.p.colorMode(this.p.HSB, 360, 100, 100, 100)
		this.p.angleMode(this.p.DEGREES)
		this.initialize()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.blendMode(this.p.BLEND)
		this.p.background(0, 0, 5)
		this.p.blendMode(this.p.ADD)

		this.p.push()
		this.p.translate(this.p.width / 2, this.p.height / 2)
		this.p.rotate(this.angle)
		this.p.translate(-this.p.width / 2, -this.p.height / 2)
		for (let i: number = 0; i < this.grids.length; i++) {
			const obj: gridType = this.grids[i]
			this.p.noStroke()
			this.p.push()
			this.p.translate(obj.x, obj.y)
			this.p.fill(0, 0, 100, 0)
			this.p.rectMode(this.p.CENTER)
			this.p.rect(0, 0, obj.w, obj.w)
			// drawingContext.clip();
			this.p.rotate(obj.angle)
			this.p.translate(-obj.w / 2, -obj.w / 2)
			const d = obj.w * this.easeArray[this.p.int(i + this.p.frameCount) % this.easeArray.length]
			this.p.fill(obj.c)
			this.p.rectMode(this.p.CORNER)

			switch (obj.shape) {
				case 'rect':
					this.p.rect(0, 0, d, obj.w)
					break
				case 'circle':
					this.p.ellipse(0, 0, d, d)
					break
				case 'arc':
					this.p.arc(0, 0, d, d, 0, 90, this.p.PIE)
					break
				case 'triangle':
					this.p.triangle(0, 0, d, 0, 0, d)
					break
			}
			this.p.pop()
		}

		const n: number = this.p.noise(this.g.x / this.p.width * 3, this.g.y / this.p.height * 3, this.p.frameCount / this.p.width * 3) * 360 / 10
		this.g.x = this.p.width / 2 + this.p.cos(n + this.p.frameCount / 3.2 * 4) * this.p.width / 4
		this.g.y = this.p.height / 2 + this.p.sin(n + this.p.frameCount / 5.3 * 7) * this.p.height / 4
		this.g.x = this.p.constrain(this.g.x, this.offset * 2, this.p.width - this.offset * 2)
		this.g.y = this.p.constrain(this.g.y, this.offset * 2, this.p.height - this.offset * 2)

		this.p.push()
		this.p.fill(0, 0, 100)
		this.p.drawingContext.shadowColor = this.p.color(0, 0, 100)
		this.p.drawingContext.shadowBlur = this.p.width / 10
		this.p.circle(this.g.x, this.g.y, n / 36 * 150)
		this.p.circle(this.g.x, this.g.y, n / 36 * 150)
		this.p.pop()
		for (let obj of this.grids) {
			obj.x += 3
			if (obj.x > this.p.width + this.offset) obj.x = -this.offset
		}

		this.grids = this.grids.sort((a: gridType, b: gridType) => {
			a.angle = this.p.atan2(a.y - this.g.y, a.x - this.g.x)
			return this.p.dist(a.x, a.y, this.g.x, this.g.y) > this.p.dist(b.x, b.y, this.g.x, this.g.y) ? -1 : 1
			// return this.p.atan2(a.y - this.g.y, a.x - this.g.x) > this.p.atan2(b.y - this.g.y, b.x - this.g.x) ? -1 : 1
		})

		// if (this.g.x < 0) this.g.x += this.p.width
		// if (this.g.x > this.p.width) this.g.x -= this.p.width
		// if (this.g.y < 0) this.g.y += this.p.width
		// if (this.g.y > this.p.height) this.g.y -= this.p.height

		this.p.pop()
		if (this.p.frameCount % (this.easeArray.length * 4) == 0) {
			this.initialize()
		}
	}

	initialize(): void {
		this.angle = this.p.int(this.p.random(4)) * 360 / 4
		this.palette = this.p.shuffle(this.p.random(this.colorScheme).colors.concat())

		this.offset = this.p.width / 15
		const x: number = -this.offset
		const y: number = -this.offset
		const d: number = this.p.width + this.offset * 2
		this.grids = []
		while (this.grids.length < 150) {
			this.grids = []
			this.separateGrid(x, y, d)
		}
		this.g = Object.assign({}, this.p.random(this.grids))
		this.easeArray = this.fillArray('backInOut', this.p.int(this.grids.length / 2))
		this.p.reverse(this.easeArray)
	}

	separateGrid(x: number, y: number, d: number): void {
		const sepNum = this.p.int(this.p.random(2, 6))
		const w = d / sepNum

		for (let i: number = x; i < x + d - 1; i += w) {
			for (let j: number = y; j < y + d - 1; j += w) {
				if (this.p.random(100) < 95 && w > this.p.width / 5) {
					this.separateGrid(i, j, w)
				} else {
					this.grids.push({
						x: i + w / 2,
						y: j + w / 2,
						w: w,
						c: this.p.random(this.palette),
						angle: (this.p.int(this.p.random(4)) * 360) / 4,
						shape: this.p.random(['rect', 'circle', 'arc', 'triangle']),
					});
				}
			}
		}
	}

	backInOut(_x: number): number {
		if(_x < 0.5) {
			const f: number = 2 * _x
			return (0.5 * (f * f * f - f * Math.sin(f * this.p.PI)))
		} else {
			const f: number = (1 - (2*_x - 1))
			return (0.5 * (1 - (f * f * f - f * Math.sin(f * this.p.PI))) + 0.5)
		}
	}

	fillArray(_algo: string, _len: number): number[] {
		const _dest: number[] = new Array(_len)
		for (let i: number = 0; i<_len; i++) {
			const _p = i / (_len-1)
			_dest[i] = this[_algo](_p)
		}
		return(_dest)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
