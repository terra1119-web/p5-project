'use strict'
import Sketch from '@/class/Sketch'

type ColorSchemeType = {
	name: string,
	colors: string[]
}

class SketchTest extends Sketch {
	// property
	g1: p5.Graphics
	palette: string[]
	colorScheme: ColorSchemeType[]

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
		this.colorScheme = [
			{
				name: "Benedictus",
				colors: ["#F27EA9", "#366CD9", "#5EADF2", "#636E73", "#F2E6D8"],
			},
			{
				name: "Cross",
				colors: ["#D962AF", "#58A6A6", "#8AA66F", "#F29F05", "#F26D6D"],
			},
			{
				name: "Demuth",
				colors: ["#222940", "#D98E04", "#F2A950", "#BF3E21", "#F2F2F2"],
			},
			{
				name: "Hiroshige",
				colors: ["#1B618C", "#55CCD9", "#F2BC57", "#F2DAAC", "#F24949"],
			},
			{
				name: "Hokusai",
				colors: ["#074A59", "#F2C166", "#F28241", "#F26B5E", "#F2F2F2"],
			},
			{
				name: "Hokusai Blue",
				colors: ["#023059", "#459DBF", "#87BF60", "#D9D16A", "#F2F2F2"],
			},
			{
				name: "Java",
				colors: ["#632973", "#02734A", "#F25C05", "#F29188", "#F2E0DF"],
			},
			{
				name: "Kandinsky",
				colors: ["#8D95A6", "#0A7360", "#F28705", "#D98825", "#F2F2F2"],
			},
			{
				name: "Monet",
				colors: ["#4146A6", "#063573", "#5EC8F2", "#8C4E03", "#D98A29"],
			},
			{
				name: "Nizami",
				colors: ["#034AA6", "#72B6F2", "#73BFB1", "#F2A30F", "#F26F63"],
			},
			{
				name: "Renoir",
				colors: ["#303E8C", "#F2AE2E", "#F28705", "#D91414", "#F2F2F2"],
			},
			{
				name: "VanGogh",
				colors: ["#424D8C", "#84A9BF", "#C1D9CE", "#F2B705", "#F25C05"],
			},
			{
				name: "Mono",
				colors: ["#D9D7D8", "#3B5159", "#5D848C", "#7CA2A6", "#262321"],
			},
			{
				name: "RiverSide",
				colors: ["#906FA6", "#025951", "#252625", "#D99191", "#F2F2F2"],
			},
		]
	}

	setup(): void {
		super.setup()

		this.p.colorMode(this.p.HSB, 360, 100, 100, 100)
		this.p.pixelDensity(1)
		this.p.angleMode(this.p.DEGREES)
		this.palette = this.p.shuffle(this.p.random(this.colorScheme).colors.concat())
		this.g1 = this.p.createGraphics(this.p.width, this.p.height)
		this.drawTexture(this.g1, 0.01, true)
		this.drawTexture(this.g1, 0.01, false)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.randomSeed(0)
		const yStep: number = this.p.height / 25
		const xStep: number = 250
		const nsx: number = 400
		const nsy: number = 50

		for (let y: number = -yStep; y < this.p.height + yStep; y += yStep / 2) {
			this.p.drawingContext.filter = 'blur(' + this.p.int(this.p.map(this.p.abs(y - (this.p.height * 3) / 5), 0, this.p.height / 2 + yStep, 0, 20)) + 'px)'

			this.p.push()
			this.p.translate(0, y)

			const n: number = this.p.map(this.p.noise(y / nsy, this.p.frameCount / 300), -1, 1, 0, 1)
			const colors: string[] = this.p.shuffle(this.palette.concat())
			const gradient: CanvasGradient = this.p.random() > 0.5
				? this.p.drawingContext.createLinearGradient(0, -yStep * 2, this.p.width, yStep * 2)
				: this.p.drawingContext.createLinearGradient(this.p.width, -yStep * 2, 0, yStep * 2)

			gradient.addColorStop(0, colors[0])
			gradient.addColorStop(n, colors[2])
			gradient.addColorStop(1, colors[1])

			this.p.drawingContext.fillStyle = gradient
			this.p.strokeWeight(3)
			this.p.stroke(0,0,100)
			this.p.noStroke()

			this.p.beginShape()
			let y2: number
			for (let x: number = -xStep; x < this.p.width + xStep; x += xStep) {
				y2 = this.p.noise(x / nsx, y / nsy, this.p.frameCount / 200) * yStep * 4
				this.p.curveVertex(x, y2)
			}
			this.p.vertex(this.p.width + xStep, y2)
			this.p.vertex(0 - xStep, this.p.height + yStep)
			this.p.endShape(this.p.CLOSE)
			this.p.pop()
		}
		this.p.drawingContext.globalAlpha = 1 / 2
		this.p.drawingContext.filter = "blur(" + 0 + "px)"

		this.p.image(this.g1, 0, 0)
		this.p.drawingContext.globalAlpha = 1
	}

	drawTexture(target: p5.Graphics, prob: number, bool: boolean): void {
		for (let i: number = 0; i < this.p.width * this.p.height * prob; i++) {
			const x: number = this.p.random(this.p.width)
			const y: number = this.p.random(this.p.height)
			const d: number = (this.p.width / this.p.map(prob, 0, 1, this.p.width / 50, this.p.width / 10000)) * this.p.random(1, 1.5)
			const angle: number = (this.p.int(this.p.random(8)) * 360) / 8
			const r: number = d * this.p.sqrt(2)
			const g: CanvasGradient = target.drawingContext.createLinearGradient(
				this.p.cos(angle) * r,
				this.p.sin(angle) * r,
				this.p.cos(angle + this.p.PI) * r,
				this.p.sin(angle + this.p.PI) * r
			)
			const n: number = this.p.random(1)
			const m: number = n + this.p.random(3)
			g.addColorStop(0, this.p.color(0, n).toString())
			g.addColorStop(1, this.p.color(0, m).toString())
			target.noStroke()
			if (bool) {
				target.drawingContext.fillStyle = g
			} else {
				target.erase(this.p.random(2, 8), 0)
			}

			target.push()
			target.translate(x, y)
			target.rotate(this.p.random(360))
			target.shearX(this.p.random(360 / 4) * (this.p.random() > 0.5 ? -1 : 1))
			target.shearY(this.p.random(360 / 4) * (this.p.random() > 0.5 ? -1 : 1))
			target.rectMode(this.p.CENTER)
			target.ellipse(0, 0, d, d)
			target.pop()
			if (!bool) {
				target.noErase()
			}
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}