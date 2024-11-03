'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

type interactionsType = {
	CENTREMODE: string
	CHORDMODE: string
}

type constructionType = {
	REFLECTIONSROTATIONS: string
	ROTATIONSREFLECTIONS: string
	REFLECTIONSREFLECTIONS: string
	ROTATIONSROTATIONS: string
	RANDOMISED: string
}

class SketchTest extends Sketch {
	palettes: string[][]
	interactions: interactionsType
	construction: constructionType
	constructionCarousel: string[]
	constructionIndex: number
	currentConstructionMode: string
	currentInteractionMode: string
	cycleFrames: number
	substeps: number
	rotRateMultiplier: number
	randPalette: string[]
	// MOVERS AND CONSTRAINTS
	movers: Mover[]
	n: number
	r: number
	D: number
	walls: Wall[]
	fMax: number // max repulsive force
	overlap: number // multiples of r close to the border
	w: number
	opacity: number

	// LAYERS - two for comparisons
	primaryLayerA: p5.Graphics
	secondaryLayerA: p5.Graphics
	tertiaryLayerA: p5.Graphics
	primaryLayerB: p5.Graphics
	secondaryLayerB: p5.Graphics
	tertiaryLayerB: p5.Graphics

	debugLayer: p5.Graphics
	globalScale: number
	rotRate: number
	rotateAndZoomMode: boolean

	// property
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize

		this.palettes = [
			// ['#ffffff'],
			[
				'#f72585',
				'#b5179e',
				'#7209b7',
				'#560bad',
				' #480ca8',
				'#3a0ca3',
				'#3f37c9',
				'#4361ee',
				'#4895ef',
				'#4cc9f0'
			],
			[
				'#03071e',
				'#370617',
				'#6a040f',
				'#9d0208',
				'#d00000',
				'#dc2f02',
				'#e85d04',
				' #f48c06',
				'#faa307',
				'#ffba08'
			],
			[
				'#d9ed92',
				'#b5e48c',
				'#99d98c',
				'#76c893',
				'#52b69a',
				'#34a0a4',
				'#168aad',
				'#1a759f',
				'#1e6091',
				'#184e77'
			],
			[
				'#3a0f72',
				'#6023b0',
				'#7826e3',
				'#8e48eb',
				'#a469f2',
				'#bb4fcd',
				'#d235a8',
				'#ff005e',
				'#250b47'
			],
			[
				'#007f5f',
				'#2b9348',
				'#55a630',
				'#80b918',
				'#aacc00',
				'#bfd200',
				'#d4d700',
				'#dddf00',
				'#eeef20',
				'#ffff3f'
			],
			[
				'#012a4a',
				'#013a63',
				'#01497c',
				'#014f86',
				'#2a6f97',
				'#2c7da0',
				'#468faf',
				'#61a5c2',
				'#89c2d9',
				'#a9d6e5'
			],
			[
				'#f94144',
				'#f3722c',
				'#f8961e',
				'#f9844a',
				'#f9c74f',
				'#90be6d',
				'#43aa8b',
				'#4d908e',
				'#577590',
				'#277da1'
			],
			[
				'#0466c8',
				'#0353a4',
				'#023e7d',
				'#002855',
				'#001845',
				'#001233',
				'#33415c',
				'#5c677d',
				'#7d8597',
				'#979dac'
			],
			[
				'#7400b8',
				'#6930c3',
				'#5e60ce',
				'#5390d9',
				'#4ea8de',
				'#48bfe3',
				'#56cfe1',
				'#64dfdf',
				'#72efdd',
				'#80ffdb'
			],
			[
				'#54478c',
				'#2c699a',
				'#048ba8',
				'#0db39e',
				'#16db93',
				'#83e377',
				'#b9e769',
				'#efea5a',
				'#f1c453',
				'#f29e4c'
			],
			['#227c9d', '#17c3b2', '#ffcb77', '#fef9ef', '#fe6d73'],
			['#ffbc42', '#d81159', '#8f2d56', '#218380', '#73d2de'],
			['#d00000', '#ffba08', '#3f88c5', '#032b43', '#136f63'],
			['#eac435', '#345995', '#03cea4', '#fb4d3d', '#ca1551']
		]

		// Kind of making enums ---> OpenProcessing doesn't like object.freeze ?
		this.interactions = {
			CENTREMODE: 'CENTREMODE',
			CHORDMODE: 'CHORDMODE'
		}

		this.construction = {
			REFLECTIONSROTATIONS: 'Reflections -> Rotations',
			ROTATIONSREFLECTIONS: 'Rotations -> Reflections',
			REFLECTIONSREFLECTIONS: 'Reflections -> Reflections',
			ROTATIONSROTATIONS: 'Rotations -> Rotations',
			RANDOMISED: 'Randomised Reflections/Rotations'
		}

		// SELECTIONS
		this.constructionCarousel = [
			this.construction.RANDOMISED,
			this.construction.REFLECTIONSROTATIONS,
			this.construction.ROTATIONSREFLECTIONS,
			this.construction.REFLECTIONSREFLECTIONS,
			this.construction.ROTATIONSROTATIONS
		]
		this.constructionIndex = 0
		this.currentConstructionMode
		this.currentInteractionMode

		// TIMING
		this.cycleFrames = 300
		this.substeps = 5 // how many times should we refresh per frame
		this.rotRateMultiplier = 0.25 // how much should we rotate per zoom cycle. Hint: much more WILL make you sick.

		// COLOURS
		this.randPalette

		// MOVERS AND CONSTRAINTS
		this.movers = []
		this.n
		this.r
		this.D
		this.walls = []
		this.fMax = 0.25 // max repulsive force
		this.overlap = 1 // multiples of r close to the border
		this.w

		// LAYERS - two for comparisons
		this.primaryLayerA
		this.secondaryLayerA
		this.tertiaryLayerA
		this.primaryLayerB
		this.secondaryLayerB
		this.tertiaryLayerB

		this.debugLayer
		this.canvas = null
		this.globalScale = 1
		this.rotRate
		this.rotateAndZoomMode = true
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.frameRate(30)
		this.p.pixelDensity(1)

		this.p.background(0)
		this.rotRate =
			(this.rotRateMultiplier * this.p.TWO_PI) / this.cycleFrames

		this.constructionCarousel = [
			this.construction.RANDOMISED,
			this.construction.REFLECTIONSROTATIONS,
			this.construction.ROTATIONSREFLECTIONS,
			this.construction.REFLECTIONSREFLECTIONS,
			this.construction.ROTATIONSROTATIONS
		]

		// if randomised, choose a random construction method from the other options with each refresh
		if (
			this.constructionCarousel[this.constructionIndex] ===
			this.construction.RANDOMISED
		) {
			this.currentConstructionMode = this.p.random(
				this.constructionCarousel.filter(
					m => m != this.construction.RANDOMISED
				)
			)
		} else {
			this.currentConstructionMode =
				this.constructionCarousel[this.constructionIndex]
		}

		// INIT LAYERS
		this.debugLayer = this.p.createGraphics(this.p.height, this.p.height)

		this.primaryLayerA = this.p.createGraphics(this.p.height, this.p.height)
		this.secondaryLayerA = this.p.createGraphics(
			this.p.height,
			this.p.height
		)
		this.tertiaryLayerA = this.p.createGraphics(
			2 * this.p.height,
			2 * this.p.height
		) // the final image for zooming and rotating

		this.primaryLayerB = this.p.createGraphics(this.p.height, this.p.height)
		this.secondaryLayerB = this.p.createGraphics(
			this.p.height,
			this.p.height
		)
		this.tertiaryLayerB = this.p.createGraphics(
			2 * this.p.height,
			2 * this.p.height
		) // the final image for zooming and rotating

		this.secondaryLayerA.noStroke()
		this.secondaryLayerB.noStroke()
		this.tertiaryLayerA.noStroke()
		this.tertiaryLayerB.noStroke()

		// VISUALS
		this.currentInteractionMode =
			this.p.random(1) < 0.33
				? this.interactions.CENTREMODE
				: this.interactions.CHORDMODE // in general, chordmode is more interesting
		this.opacity =
			this.p.random(1) < 0.25 ? 255 : this.p.int(this.p.random(50, 100)) // most of the time translucent, but every now and then BAM! Full colour.
		this.randPalette = this.p
			.random(this.palettes)
			.map(e => this.hexToRgbWithOpacity(e, this.opacity))

		this.w = this.primaryLayerA.width // given it's square

		// MOVERS
		this.n = this.p.int(this.p.random(20, 40))
		this.r = this.p.random(0.025 * this.w, 0.2 * this.w)
		this.D = 2 * this.r
		this.generateMovers()
		this.generateWalls()
		this.p.imageMode(this.p.CENTER)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		// draw in the backgrounds each frame
		this.p.background(0)

		this.fillGraphicLayer(this.debugLayer)
		this.fillGraphicLayer(this.secondaryLayerA)
		this.fillGraphicLayer(this.tertiaryLayerA)
		this.fillGraphicLayer(this.secondaryLayerB)
		this.fillGraphicLayer(this.tertiaryLayerB)
		this.debugLayer.noFill()
		this.debugLayer.stroke(255)

		// update global zoom and rotation
		if (this.rotateAndZoomMode) {
			this.globalScale =
				1 / this.p.sqrt(2) +
				(1 +
					this.p.sin(
						this.p.frameCount *
							this.rotRate *
							(1 / this.rotRateMultiplier) +
							this.p.HALF_PI +
							this.p.PI
					)) // start zoomed out and then zoom in
		}

		// in case we need to speed things up, allow multiple passes per drawframe
		for (let i = 0; i < this.substeps; i++) {
			for (let m of this.movers) {
				for (let w of this.walls) {
					this.bounce(w, m) // bounce off the walls
				}
				m.update() // update position
			}
			this.handleMoverInteraction()
			this.drawOverlap(this.primaryLayerA, this.currentInteractionMode)
			// drawOverlap(primaryLayerB, chosenInteractionMode);
		}

		// constructing the final image for each frame
		switch (this.currentConstructionMode) {
			case this.construction.REFLECTIONSROTATIONS:
				this.drawReflections(this.secondaryLayerA, this.primaryLayerA)
				this.drawRotations(this.tertiaryLayerA, this.secondaryLayerA)
				break
			case this.construction.ROTATIONSREFLECTIONS:
				this.drawRotations(this.secondaryLayerA, this.primaryLayerA)
				this.drawReflections(this.tertiaryLayerA, this.secondaryLayerA)
				break
			case this.construction.REFLECTIONSREFLECTIONS:
				this.drawReflections(this.secondaryLayerA, this.primaryLayerA)
				this.drawReflections(this.tertiaryLayerA, this.secondaryLayerA)
				break
			case this.construction.ROTATIONSROTATIONS:
				this.drawRotations(this.secondaryLayerA, this.primaryLayerA)
				this.drawRotations(this.tertiaryLayerA, this.secondaryLayerA)
				break
		}

		this.p.push()
		this.p.translate(this.p.width / 2, this.p.height / 2)
		if (this.rotateAndZoomMode) {
			this.p.scale(this.globalScale)
			this.p.rotate(this.p.frameCount * this.rotRate)
		}
		this.p.image(this.tertiaryLayerA, 0, 0, this.p.width, this.p.width)
		this.p.pop()

		// for comparison videos
		// image(tertiaryLayerA, width*0.25, height/2, 0.95*width/2, 0.95*width/2);
		// image(tertiaryLayerB, width*0.75, height/2, 0.95*width/2, 0.95*width/2);

		if (this.p.frameCount % this.cycleFrames === 0) this.cycleSketch()
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

	fillGraphicLayer(layer: p5.Graphics) {
		layer.fill(0)
		layer.noStroke()
		layer.rect(0, 0, layer.width, layer.height)
	}

	drawRotations(targetLayer: p5.Graphics, layer2Copy: p5.Graphics) {
		for (let i = 0; i < 4; i++) {
			targetLayer.push()
			targetLayer.translate(targetLayer.width / 2, targetLayer.height / 2)
			targetLayer.rotate(i * this.p.HALF_PI)
			targetLayer.image(
				layer2Copy,
				0,
				0,
				targetLayer.width / 2,
				targetLayer.height / 2
			)
			targetLayer.pop()
		}
	}

	drawReflections(targetLayer: p5.Graphics, layer2Copy: p5.Graphics) {
		const reflections = [
			{ x: 1, y: 1 }, // TL
			{ x: -1, y: 1 }, // TR
			{ x: 1, y: -1 }, // BR
			{ x: -1, y: -1 }
		] // BL
		for (let i = 0; i < 4; i++) {
			targetLayer.push()
			targetLayer.translate(targetLayer.width / 2, targetLayer.height / 2)
			targetLayer.scale(reflections[i].x, reflections[i].y)
			targetLayer.image(
				layer2Copy,
				-0.5 * targetLayer.width,
				-0.5 * targetLayer.width,
				targetLayer.width / 2,
				targetLayer.width / 2
			)
			targetLayer.pop()
		}
	}

	drawOverlap(layer: p5.Graphics, mode: string) {
		for (let i = 0; i < this.movers.length; i++) {
			for (let j = i; j < this.movers.length; j++) {
				if (i === j) continue
				let d = p5.Vector.dist(this.movers[i].pp, this.movers[j].pp)
				if (d < 2 * this.r) {
					layer.stroke(this.movers[i].c)
					switch (mode) {
						case this.interactions.CENTREMODE:
							this.showOverlapLineBetweenCenters(
								layer,
								this.movers[i].pp,
								this.movers[j].pp
							)
							break
						case this.interactions.CHORDMODE:
							this.showOverlapChord(
								layer,
								this.movers[i].pp,
								this.movers[j].pp
							)
							break
					}
				}
			}
		}
	}

	showOverlapLineBetweenCenters(layer: p5.Graphics, posA, posB) {
		layer.line(posA.x, posA.y, posB.x, posB.y)
	}

	showOverlapChord(layer: p5.Graphics, posA, posB) {
		let d = p5.Vector.dist(posA, posB)
		if (d > this.D) return
		let aSys = p5.Vector.sub(posB, posA).heading() // get the heading from A to B
		let a = this.p.acos(d / this.D)
		layer.push()
		layer.translate(posA.x, posA.y)
		layer.rotate(aSys) // for simplicity, rotate the system so that posB is always to the right of posA

		layer.line(
			this.r * this.p.cos(a),
			this.r * this.p.sin(a),
			this.r * this.p.cos(a),
			this.r * this.p.sin(-a)
		) // drawing a line between the points of intersection
		layer.pop()
	}

	drawNormal(layer, wall, mover) {
		let ap = p5.Vector.sub(mover.p, wall.start)
		let ab = p5.Vector.sub(wall.end, wall.start)
		ab.normalize()
		ab.mult(ap.dot(ab))
		let normal = p5.Vector.add(wall.start, ab)
		layer.line(mover.p.x, mover.p.y, normal.x, normal.y)
	}

	bounce(wall: Wall, mover: Mover) {
		// scalar projection to get the distance to the wall
		let ap = p5.Vector.sub(mover.pp, wall.start)
		let ab = p5.Vector.sub(wall.end, wall.start)
		ab.normalize()
		ab.mult(ap.dot(ab))
		let normal = p5.Vector.add(wall.start, ab) // scalar projection point
		let d = p5.Vector.dist(mover.pp, normal) // how far from the wall?

		let reflectionVector = this.p.createVector(-ab.y, ab.x) // the normal vector to the wall

		let inBoundsOfWall =
			p5.Vector.dist(wall.start, mover.pp) < wall.wallLength &&
			p5.Vector.dist(wall.end, mover.pp) < wall.wallLength
		if (d < this.overlap * this.r && inBoundsOfWall) {
			// is we're inside some threshold...
			wall.isHit = true
			mover.v.reflect(reflectionVector)
		} else {
			wall.isHit = false
		}
	}

	hexToRgbWithOpacity(hex, opacity) {
		// Remove the hash symbol if it's present
		hex = hex.replace('#', '')

		// Parse the hex color into its RGB components
		let r = parseInt(hex.substring(0, 2), 16)
		let g = parseInt(hex.substring(2, 4), 16)
		let b = parseInt(hex.substring(4, 6), 16)

		// Return the RGB color with the specified opacity
		return this.p.color(r, g, b, opacity)
	}

	cycleSketch() {
		this.movers = []
		this.setup()
	}

	generateMovers() {
		for (let i = 0; i < this.n; i++) {
			this.movers.push(
				new Mover(
					this.p,
					this.p.random(this.w),
					this.p.random(this.w),
					this.randPalette,
					this.r
				)
			)
		}
	}

	drawArrow(layer, x, y, heading, mag) {
		layer.push()
		layer.translate(x, y)
		layer.rotate(heading)
		layer.line(0, 0, mag, 0)
		layer.line(mag, 0, mag - mag / 4, -mag / 4)
		layer.line(mag, 0, mag - mag / 4, mag / 4)
		layer.pop()
	}

	handleMoverInteraction() {
		for (let i = 0; i < this.movers.length; i++) {
			for (let j = i; j < this.movers.length; j++) {
				if (i === j) continue
				let d = p5.Vector.dist(this.movers[i].pp, this.movers[j].pp)
				if (d < 2 * this.r) {
					let fMag = this.p.map(d, 0, 2 * this.r, this.fMax, 0)
					let f = p5.Vector.sub(this.movers[i].pp, this.movers[j].pp)
					this.movers[i].applyForce(f.setMag(fMag)) // applyForce
					this.movers[j].applyForce(f.mult(-1)) // apply the reverse to j
				}
			}
		}
	}

	generateWalls() {
		this.walls = []
		this.walls.push(new Wall(this.p, 0, 0, this.w, 0))
		this.walls.push(new Wall(this.p, this.w, 0, this.w, this.w))
		this.walls.push(new Wall(this.p, this.w, this.w, 0, this.w))
		this.walls.push(new Wall(this.p, 0, this.w, 0, 0))
	}

	showWalls(layer) {
		layer.stroke(255)
		for (let w of this.walls) {
			w.show(layer)
		}
	}
}

class Mover {
	p: p5
	pp: p5.Vector
	v: p5.Vector
	a: p5.Vector
	c: number
	r: number

	constructor(p, x, y, randPalette, r) {
		this.p = p
		this.pp = this.p.createVector(x, y)
		this.v = p5.Vector.random2D()
		//   this.v = p5.Vector.fromAngle(random(-PI/12, PI/12));
		this.a = this.p.createVector(0, 0)
		this.c = this.p.random(randPalette)
		this.r = r
		// this.normal = null;
	}

	applyForce(f) {
		this.a.add(f)
	}

	update() {
		this.v.add(this.a).normalize()
		this.pp.add(this.v)
		this.a.mult(0)
	}

	show(layer) {
		layer.circle(this.pp.x, this.pp.y, 2 * this.r)
		// if (DEBUGMODE)
		// 	this.p.drawArrow(
		// 		layer,
		// 		this.pp.x,
		// 		this.pp.y,
		// 		this.v.heading(),
		// 		this.r * 2
		// 	)
	}
}

class Wall {
	p: p5
	start: p5.Vector
	end: p5.Vector
	isHit: boolean
	wallLength: number
	midPt: p5.Vector

	constructor(p, startX, startY, endX, endY) {
		this.p = p
		this.start = this.p.createVector(startX, startY)
		this.end = this.p.createVector(endX, endY)
		this.isHit = false
		this.wallLength = p5.Vector.dist(this.start, this.end)
		this.midPt = p5.Vector.lerp(this.start, this.end, 0.5)
	}

	show(layer) {
		//   if(this.isHit) strokeWeight(5);
		layer.line(this.start.x, this.start.y, this.end.x, this.end.y)

		// text(round(this.wallLength,1), this.midPt.x, this.midPt.y)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}

//
