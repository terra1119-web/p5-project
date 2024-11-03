'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	treeMax: number
	trees: Tree[]
	direction: p5.Vector
	count: number[]
	colorInt: number

	constructor() {
		super({})

		// initialize
		this.treeMax = 2
		this.trees = []
		this.count = []
		this.colorInt = 250
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.p.stroke(80, 0, 50, 200)
		this.p.fill(250, this.colorInt, this.colorInt, 220)
		this.p.ellipseMode(this.p.CENTER)
		this.p.smooth()
		this.direction = this.p.createVector(0, -this.p.height)
		for (let i: number = 0; i < this.treeMax; i++) {
			const start: p5.Vector = this.p.createVector(
				this.p.random(this.p.width / 4, (this.p.width / 4) * 3),
				this.p.height / 1
			)
			const myTree: Tree = new Tree(this.p, start, this.direction)
			this.trees[i] = myTree
			this.count[i] = myTree.treeSize
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		let size: number = 10
		for (let j: number = 0; j < this.treeMax; j++) {
			this.trees[j].swing()
		}

		this.p.stroke(255, 200)
		for (let j: number = 0; j < this.treeMax; j++) {
			for (let i: number = 1; i < this.count[j]; i++) {
				this.p.strokeWeight(
					this.trees[j].twig[this.trees[j].map[i].x].thickness[
						this.trees[j].map[i].y
					]
				)
				this.p.line(
					this.trees[j].twig[this.trees[j].map[i].x].location[
						this.trees[j].map[i].y - 1
					].x,
					this.trees[j].twig[this.trees[j].map[i].x].location[
						this.trees[j].map[i].y - 1
					].y,
					this.trees[j].twig[this.trees[j].map[i].x].location[
						this.trees[j].map[i].y
					].x,
					this.trees[j].twig[this.trees[j].map[i].x].location[
						this.trees[j].map[i].y
					].y
				)
			}
		}

		this.p.noStroke()
		size -= 0.4
		if (size <= 12) size = 10
		for (let j: number = 0; j < this.treeMax; j++) {
			for (let i: number = 0; i < this.trees[j].twig.length; i++) {
				const num: number = this.trees[j].twig[i].location.length - 1
				this.p.ellipse(
					this.trees[j].twig[i].location[num].x,
					this.trees[j].twig[i].location[num].y,
					size,
					size
				)
			}
		}
	}
}

class Branch {
	p: p5
	location: p5.Vector[]
	thickness: number[]
	baseIndex: number[][]
	isCandidate: boolean
	dTheta: number[]

	constructor(
		p: p5,
		loc: p5.Vector,
		thic: number,
		id: number,
		branchIndex: number
	) {
		this.p = p
		this.location = []
		this.thickness = []
		this.location[0] = this.p.createVector(loc.x, loc.y)
		this.thickness[0] = thic

		this.baseIndex = new Array(2)
		this.baseIndex[0] = new Array(1)
		this.baseIndex[1] = new Array(1)
		this.baseIndex[0][0] = id
		this.baseIndex[1][0] = branchIndex

		this.isCandidate = false
		this.dTheta = []
	}

	branchRotate(index: number, theta: number, reference: p5.Vector) {
		this.location[index].sub(reference)
		this.rotate2D(this.location[index], theta)
		this.location[index].add(reference)
	}

	rotate2D(v: p5.Vector, theta: number): void {
		const xTemp: number = v.x
		v.x = v.x * this.p.cos(theta) - v.y * this.p.sin(theta)
		v.y = xTemp * this.p.sin(theta) + v.y * this.p.cos(theta)
	}
}

class Frontier {
	p: p5
	location: p5.Vector
	velocity: p5.Vector
	thickness: number
	finished: boolean

	constructor(p: p5, startPoint: p5.Vector, direction: p5.Vector) {
		this.p = p
		this.location = this.p.createVector(startPoint.x, startPoint.y)
		this.velocity = this.p.createVector(direction.x, direction.y)
		this.thickness = this.p.random(10, 20)
		this.finished = false
	}

	update(factor: number): void {
		if (
			this.location.x > -10 &&
			this.location.y > -10 &&
			this.location.x < this.p.width + 10 &&
			this.location.y < this.p.height + 10 &&
			this.thickness > factor
		) {
			this.velocity.normalize()
			const uncertain: p5.Vector = this.p.createVector(
				this.p.random(-1, 1),
				this.p.random(-1, 1)
			)
			uncertain.normalize()
			uncertain.mult(0.2)
			this.velocity.mult(0.8)
			this.velocity.add(uncertain)
			this.velocity.mult(this.p.random(8, 15))
			this.location.add(this.velocity)
		} else {
			this.finished = true
		}
	}
}

class FrontierParent {
	p: p5
	location: p5.Vector
	velocity: p5.Vector
	thickness: number
	finished: boolean

	constructor(p: p5, parent: Frontier) {
		this.p = p
		this.location = parent.location.copy()
		this.velocity = parent.velocity.copy()
		this.thickness = parent.thickness
		parent.thickness = this.thickness
		this.finished = parent.finished
	}

	update(factor: number): void {
		if (
			this.location.x > -10 &&
			this.location.y > -10 &&
			this.location.x < this.p.width + 10 &&
			this.location.y < this.p.height + 10 &&
			this.thickness > factor
		) {
			this.velocity.normalize()
			const uncertain: p5.Vector = this.p.createVector(
				this.p.random(-1, 1),
				this.p.random(-1, 1)
			)
			uncertain.normalize()
			uncertain.mult(0.2)
			this.velocity.mult(0.8)
			this.velocity.add(uncertain)
			this.velocity.mult(this.p.random(8, 15))
			this.location.add(this.velocity)
		} else {
			this.finished = true
		}
	}
}

class Tree {
	p: p5
	BranchLengthFactor: number
	BranchLocationFactor: number
	dtheta: number[]
	treeSize: number
	candNum: number
	candidateIndex: number[]
	amplitude: number[]
	phaseFactor: number[]
	freq: number
	period: number
	dt: number
	time: number
	twig: Branch[]
	map: p5.Vector[]

	constructor(p: p5, startPoint: p5.Vector, direction: p5.Vector) {
		this.p = p
		this.BranchLengthFactor = 0.15
		this.BranchLocationFactor = 0.3
		this.candNum = 3
		this.candidateIndex = new Array(this.candNum)
		this.amplitude = new Array(this.candNum)
		this.phaseFactor = new Array(this.candNum)
		this.dt = 0.025
		this.time = 0
		let id: number = 0
		let growth: boolean = false

		let fr: Frontier[] = []
		fr[id] = new Frontier(this.p, startPoint, direction)

		this.twig = []
		this.twig[id] = new Branch(
			this.p,
			fr[id].location,
			fr[id].thickness,
			id,
			0
		)

		this.map = []
		this.map[0] = this.p.createVector(id, this.twig[id].location.length - 1)

		while (!growth) {
			let growthSum: number = 0
			for (id = 0; id < fr.length; id++) {
				fr[id].update(this.BranchLocationFactor)
				if (!fr[id].finished) {
					this.twig[id].location = this.p.append(
						this.twig[id].location,
						this.p.createVector(
							fr[id].location.x,
							fr[id].location.y
						)
					)
					this.twig[id].thickness = this.p.append(
						this.twig[id].thickness,
						fr[id].thickness
					)
					this.map = this.p.append(
						this.map,
						this.p.createVector(
							id,
							this.twig[id].location.length - 1
						)
					)

					if (this.p.random(0, 1) < this.BranchLengthFactor) {
						// control length of one branch
						fr[id].thickness *= 0.65
						this.twig[id].thickness[
							this.twig[id].thickness.length - 1
						] = fr[id].thickness
						if (fr[id].thickness > this.BranchLocationFactor) {
							// control the number of the locations on all branches, i.e., treeSize.
							fr = this.p.append(
								fr,
								new FrontierParent(this.p, fr[id])
							)
							this.twig = this.p.append(
								this.twig,
								new Branch(
									this.p,
									fr[id].location,
									fr[id].thickness,
									id,
									this.twig[id].location.length - 1
								)
							)
							let _id = id
							if (_id !== 0) {
								for (let _i = 0; _i < 2; _i++) {
									this.twig[this.twig.length - 1].baseIndex[
										_i
									] = this.p.concat(
										this.twig[this.twig.length - 1]
											.baseIndex[_i],
										this.twig[_id].baseIndex[_i]
									)
								}
							}
						}
					} // if (random(0, 1) < 0.2)
				} else growthSum += 1
			}
			if (growthSum == fr.length) {
				this.dtheta = new Array(this.twig.length)
				this.treeSize = this.map.length
				growth = true
			}
		} // while(!growth)

		let _candList: number[] = []
		let _candfloat: number[] = new Array(this.twig.length)
		for (let i: number = 0; i < this.twig.length; i++) {
			_candfloat[i] = this.twig[i].location.length
			_candList.push(_candfloat[i])
		}
		this.candidateIndex[0] = 0
		this.twig[0].isCandidate = true
		this.twig[0].dTheta = new Array(this.twig[0].location.length)
		_candfloat[0] = -1.0
		_candList[0] = -1.0
		for (let i: number = 1; i < this.candNum; i++) {
			let _temp: number = this.p.max(_candfloat)
			this.candidateIndex[i] = _candList.indexOf(_temp)
			this.twig[this.candidateIndex[i]].isCandidate = true
			this.twig[this.candidateIndex[i]].dTheta = new Array(
				this.twig[this.candidateIndex[i]].location.length
			)
			_candfloat[this.candidateIndex[i]] = -1.0
			_candList[this.candidateIndex[i]] = -1.0
		}

		this.amplitude[0] = this.p.random(0.006, 0.012)
		this.phaseFactor[0] = this.p.random(0.6, 1.2)
		this.freq = this.p.random(0.5, 0.8)
		this.period = 1 / this.freq
		for (let i: number = 1; i < this.candNum; i++) {
			this.amplitude[i] = this.amplitude[i - 1] * this.p.random(0.9, 1.4)
			this.phaseFactor[i] =
				this.phaseFactor[i - 1] * this.p.random(0.9, 1.4)
		}
	}

	swing(): void {
		for (let i: number = 0; i < this.candNum; i++) {
			let _num: number = this.twig[this.candidateIndex[i]].location.length
			for (let j: number = 0; j < _num; j++) {
				this.twig[this.candidateIndex[i]].dTheta[j] =
					this.amplitude[i] *
					this.dt *
					this.p.TWO_PI *
					this.freq *
					this.p.cos(
						this.p.TWO_PI * this.freq * this.time -
							(this.phaseFactor[i] * this.p.PI * j) / _num
					)
			}
		}

		for (let id: number = 0; id < this.twig.length; id++) {
			if (this.twig[id].isCandidate) {
				for (
					let _id: number = 1;
					_id < this.twig[id].location.length;
					_id++
				) {
					this.twig[id].branchRotate(
						_id,
						this.twig[id].dTheta[_id],
						this.twig[id].location[0]
					)
				}
			}

			for (let j = 0; j < this.twig[id].baseIndex[0].length; j++) {
				if (
					!this.twig[this.twig[id].baseIndex[0][j]].isCandidate ||
					id == 0
				)
					continue
				else {
					for (
						let k: number = id == 0 ? 1 : 0;
						k < this.twig[id].location.length;
						k++
					) {
						this.twig[id].branchRotate(
							k,
							this.twig[this.twig[id].baseIndex[0][j]].dTheta[
								this.twig[id].baseIndex[1][j]
							],
							this.twig[this.twig[id].baseIndex[0][j]].location[0]
						)
					}
				}
			}
		} // for(int id = 0; id < twig.length; id++)

		this.time += this.dt
		if (this.time >= this.period) this.time -= this.period
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
