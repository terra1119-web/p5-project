'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'
class SketchTest extends Sketch {
	// property
	line_num: number
	box_num: number
	px: number
	py: number
	pz: number
	dx: number
	dy: number
	dz: number
	ampx: number
	ampy: number
	ampz: number
	pn_time: number
	offsetx: number
	offsety: number
	offsetz: number
	tlx: number
	tly: number
	tlz: number
	stx: number
	sty: number
	stz: number
	enx: number
	eny: number
	enz: number
	dtx: number
	dty: number
	dtz: number
	minSize: number
	lines: LineObject[]
	boxes: BoxObject[]

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true
		})

		// initialize
		this.lines = []
		this.boxes = []
		this.minSize = 4
	}

	setup() {
		super.setup()

		this.p.colorMode(this.p.RGB, 255)
		this.p.background(0)
		this.p.frameRate(30)

		this.line_num = 100
		this.box_num = 200

		this.offsetx = this.p.width / 2
		this.offsety = this.p.height / 2
		this.offsetz = 0.0

		this.px = this.offsetx
		this.py = this.offsety
		this.pz = this.offsetz

		this.ampx = 0.0
		this.ampy = 0.0
		this.ampz = 4000.0

		this.pn_time = 0.0
	}

	draw() {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		// this.p.blendMode(this.p.ADD)

		//lights ();
		// this.p.ambientLight(102, 102, 102);
		// this.p.lightSpecular(222, 222, 222);
		// this.p.directionalLight(102, 102, 102, 0, 0, -1);

		this.pz -= 40.0
		this.px = this.ampz * this.p.noise(this.pz / 200000.0, this.pn_time)
		this.py = 0.0

		this.dx = this.px + this.p.random(-1000, 1000)
		this.dy = this.py + this.p.random(-1000, 1000)
		this.dz = this.pz

		this.pn_time += 0.01

		this.lines.push(
			new LineObject(this.px, this.py, this.pz, this.dx, this.dy, this.dz)
		)

		if (this.lines.length > this.line_num) {
			this.lines.shift()
		}

		if (this.lines.length > 80) {
			this.tlx = this.offsetx
			this.tly = this.offsety
			this.tlz = this.offsetz

			const pcamx = this.lines[this.lines.length - 60].px
			const pcamy = this.lines[this.lines.length - 60].py
			const pcamz = this.lines[this.lines.length - 60].pz

			const ncamx = this.lines[this.lines.length - 20].px
			const ncamy = this.lines[this.lines.length - 20].py
			const ncamz = this.lines[this.lines.length - 20].pz

			this.p.camera(
				pcamx + this.offsetx,
				pcamy + this.offsety - 60,
				pcamz + this.offsetz,
				ncamx + this.offsetx,
				ncamy + this.offsety - 60,
				ncamz + this.offsetz,
				0.0,
				1.0,
				1.0
			)

			this.p.translate(this.tlx, this.tly, this.tlz)

			for (let i: number = 0; i < this.lines.length - 1; i++) {
				if (i > 0) {
					this.p.stroke(255)
					this.p.strokeWeight(1)
					this.stx = this.lines[i].px
					this.sty = this.lines[i].py
					this.stz = this.lines[i].pz
					this.enx = this.lines[i - 1].px
					this.eny = this.lines[i - 1].py
					this.enz = this.lines[i - 1].pz
					this.dtx = this.lines[i].dx
					this.dty = this.lines[i].dy
					this.dtz = this.lines[i].dz
					this.p.beginShape()
					this.p.vertex(this.stx - 10, this.sty, this.stz)
					this.p.vertex(this.enx - 10, this.eny, this.enz)
					this.p.vertex(this.enx + 10, this.eny, this.enz)
					this.p.vertex(this.stx + 10, this.sty, this.stz)
					this.p.endShape()
				}
			}

			for (let i: number = 0; i < 4; i++) {
				// const c = this.p.color(this.p.random(255), this.p.random(255), this.p.random(255));
				const c: p5.Color = this.p.color(255, 255, 255)
				//boxes.add (new BoxObject (px + random (-600, 600), py + random (-600, 600), pz, 0, random (10, 60), random (10, 60), random (10, 60), c))
				const micVolume: number = this.getVolume()
				const volume: number = this.p.map(micVolume, 0, 1, 0, 1000)
				const size: number = this.p.random(this.minSize, volume)
				this.boxes.push(
					new BoxObject(
						this.p,
						this.px + this.p.random(-600, 600),
						this.py + this.p.random(-600, 600),
						this.pz,
						0,
						size,
						size,
						size,
						c
					)
				)
			}

			for (const box of this.boxes) {
				box.drawBox()
			}

			if (this.boxes.length > this.box_num) {
				for (let i: number = 0; i < 4; i++) {
					this.boxes.shift()
				}
			}
		}
	}
}

class LineObject {
	px: number
	py: number
	pz: number
	dx: number
	dy: number
	dz: number

	constructor(
		px: number,
		py: number,
		pz: number,
		dx: number,
		dy: number,
		dz: number
	) {
		this.px = px
		this.py = py
		this.pz = pz
		this.dx = dx
		this.dy = dy
		this.dz = dz
	}
}

class BoxObject {
	p: p5
	alpha: number
	box_sizex: number
	box_sizey: number
	box_sizez: number
	box_locx: number
	box_locy: number
	box_locz: number
	col: p5.Color

	constructor(
		p: p5,
		x: number,
		y: number,
		z: number,
		a: number,
		sx: number,
		sy: number,
		sz: number,
		c: p5.Color
	) {
		this.p = p
		this.alpha = a
		this.box_sizex = sx
		this.box_sizey = sy
		this.box_sizez = sz
		this.box_locx = x
		this.box_locy = y
		this.box_locz = z
		this.col = c
	}

	drawBox(): void {
		this.alpha += 3.2

		// this.p.fill(this.col, this.alpha * 0.8);
		// this.p.noStroke();
		this.p.noFill()
		this.p.stroke(255, this.alpha)
		//strokeWeight (alpha / 140);

		this.p.push()
		this.p.translate(this.box_locx, this.box_locy, this.box_locz)
		//graphic.box (box_sizex*s, box_sizey*s, box_sizez*s);
		this.p.box(this.box_sizex, this.box_sizey, this.box_sizez)
		//graphic.scale(s);
		//sphere(box_sizey);
		this.p.pop()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
