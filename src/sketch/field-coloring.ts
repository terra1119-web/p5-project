'use strict'
import * as p5 from 'p5'
import Sketch from '@/class/Sketch'

type PARTICLE_INDEX_TYPE = {
	x: number,
	y: number,
	vx: number,
	vy: number,
	groupId: number,
	id: number,
	radius: number,
	life: number,
	maxLife: number,
}

class SketchTest extends Sketch {
	// property
	marginX: number
	marginY: number
	forceField: number[][]
	movers: number[][]
	moverIndex: number
	PARTICLE_INDEX: PARTICLE_INDEX_TYPE

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
		this.marginX = 0
		this.marginY = 0
		this.moverIndex = 0
		this.PARTICLE_INDEX = {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			groupId: 0,
			id: 0,
			radius: 0,
			life: 0,
			maxLife: 0,
		}
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(1)
		this.p.frameRate(60)
		this.p.colorMode(this.p.HSB, 360, 100, 100, 100)

		const baseFlow: p5.Vector = p5.Vector.fromAngle(this.p.random(this.p.TWO_PI)).mult(this.p.random(0.1, 0.8))
		this.forceField = new Array(this.p.width * this.p.height).fill(this.p.width * this.p.height).map(() => [baseFlow.x, baseFlow.y])

		const minSideLen: number = this.p.min(this.p.width, this.p.height)
		const seed: number = this.p.random(99999)
		for (let kk: number = 6; kk--;) {
			this.p.randomSeed(seed)

			// Add circular flow
			for (let t: number = 10; t--; ) {
				const dir: p5.Vector = p5.Vector.fromAngle(this.p.random(this.p.TWO_PI))
				dir.mult(this.p.random(1)**2*minSideLen * 0.7+ minSideLen * 0.2)
				this.addCircularFlowField(
					this.p.random(1) ** 10 * minSideLen*2 + minSideLen*0.5,
					this.p.width / 2 + dir.x,
					this.p.height / 2 + dir.y,
					(this.p.random(1) > 0.5 ? 1 : -1)
				)
			}

			// limit forces to magnitude of 1
			this.forceField = this.forceField.map(([fx, fy]) => {
				const d: number = this.p.sqrt(fx ** 2 + fy ** 2)
				return [d > 1 ? fx / d : fx, d > 1 ? fy / d : fy]
			})

			// Relax flow field
			this.forceField = this.relaxFlowField(this.forceField)
		}

		// Do some extra relaxation
		this.forceField = this.relaxFlowField(this.forceField, 2)
		this.movers = []
		this.p.background(0)

		// Draw force field
		// for (let j: number = 0; j < this.p.height; j += 10) {
		// 	for (let i: number = 0; i < this.p.width; i += 10) {
		// 	const forceFieldIndex: number = (i | 0) + (j | 0) * this.p.width
		// 	const [fx, fy] = this.forceField[forceFieldIndex]
		// 	if (
		// 		j > this.marginY &&
		// 		j < this.p.height -this. marginY &&
		// 		i > this.marginX &&
		// 		i < this.p.width - this.marginX
		// 	) {
		// 		this.p.stroke(200, 80, this.p.noise(i * 0.005, j * 0.005) ** 3 * 60)
		// 		this.p.strokeWeight(2)
		// 		this.p.point(i, j)
		// 		this.p.line(i, j, i+fx*5, j+fy*5)
		// 	}
		// 	}
		// }
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		const coordScale: number = 0.0005
		let moveScale: number = 0.5
		const moveLimit: number = 0.1
		const forceScale: number = 0.15

		// if (this.p.pmouseX !== this.p.mouseX || this.p.pmouseY !== this.p.mouseY && this.movers.length < 5000) {
		for (let t: number = 5; t--;) {
			const randX: number = this.p.floor(this.p.random(this.p.width))
			const randY: number = this.p.floor(this.p.random(this.p.height))
			// const x: number = this.p.mouseX + this.p.random(-1, 1) * 20
			// const y: number = this.p.mouseY + this.p.random(-1, 1) * 20
			const x: number = randX + this.p.random(-1, 1) * 20
			const y: number = randY + this.p.random(-1, 1) * 20
			this.movers.unshift(this.createParticle(x, y, undefined, undefined, undefined, undefined, undefined, undefined, undefined))
		}
		// }

		let maxWhile: number = 10
		while (this.movers.length && this.movers[this.movers.length - 1][this.PARTICLE_INDEX.life] > this.movers[this.movers.length - 1][this.PARTICLE_INDEX.maxLife] && maxWhile-- > 0) {
			this.movers.pop()
		}

		this.movers = this.movers.map((mover: number[]) => {
			const [x, y, vx, vy, huu, i, radius, life, maxLife] = mover

			if (life > maxLife) {
				return mover
			}

			const t: number = life / maxLife

			const glow: boolean = i % 20 === 0

			const fadeIn: number = this.p.constrain(this.p.map(t, 0, 0.1, 0, 1), 0, 1)
			const fadeOut: number = this.p.constrain(this.p.map(t, 0.1, 1, 1, 0), 0, 1)

			this.p.strokeWeight(radius * fadeIn * fadeOut)
			moveScale = 0.5
			const forceFieldIndex: number = (x | 0) + (y | 0) * this.p.width
			let [fx, fy] = this.forceField[forceFieldIndex] || [1, 0]
			if (x < 0 || x > this.p.width || y < 0 || y > this.p.height) {
				fx = 1
				fy = 0
			}
			const _huu: number = this.p.abs(this.p.createVector(fx, fy).heading())
			const vel: p5.Vector = this.p.createVector(fx * moveScale, fy * moveScale)
			.limit(moveLimit)
			.mult(5)
			.mult(i % 2 === 0 ? -1 : 1)
			if (
				x > this.marginX &&
				x < this.p.width - this.marginX &&
				y > this.marginY &&
				y < this.p.height - this.marginY
			) {
				const huuhuu: number = i % 11 === 0 ? 0 : 1
				this.p.stroke(
					(huu * 30 + 30 + huuhuu * 160 + this.p.frameCount / 100) % 360,
					glow ? 20 : (90 + ((i * 777.77) % 50)) * (1 - huu) ** 2,
					glow ? 100 : (120 - ((i * 333) % 70)) * (1 - huu * 0.85) - _huu * 20
				)
				this.p.line(x, y, x + vel.x, y + vel.y)
			}

			return this.createParticle(
				x + vel.x,
				y + vel.y,
				vx * 0.75 + fx * forceScale,
				vy * 0.75 + fy * forceScale,
				huu,
				i,
				radius,
				life + 1,
				maxLife
			)
		})
	}

	createParticle(x: number, y: number, vx: number, vy: number, groupId: number, id: number, radius: number, life: number, maxLife: number): number[] {
		return [
			x, // x
			y, // y
			vx || 0, // velocity x
			vy || 0, // velocity y
			groupId === undefined ? this.p.random(2) | 0 : groupId, // group identifier
			id === undefined ? this.moverIndex++ : id, // identifier (running number)
			radius === undefined ? this.p.random(1, 5) : radius, // size
			life === undefined ? 0 : life, // life
			maxLife === undefined ? this.p.random(60, 320) : maxLife, // Time to live
		]
	}

	addCircularFlowField(radius: number, x: number, y: number, dir: number = 1) {
		const cr: number = radius
		const cOffX: number = this.p.floor(x)
		const cOffY: number = this.p.floor(y)
		for (let cy: number = 0; cy < cr * 2; cy++) {
			for (let cx: number = 0; cx < cr * 2; cx++) {
				const centeredX: number = cx - cr
				const centeredY: number = cy - cr
				const offnx: number = (cOffX + centeredX) | 0
				const offny: number = (cOffY + centeredY) | 0
				if (offnx > 0 && offnx < this.p.width && offny > 0 && offny < this.p.height) {
					const sqrtD: number = centeredX ** 2 + centeredY ** 2
					if (sqrtD < cr ** 2) {
						const d: number = this.p.sqrt(sqrtD)
						const dt: number = d / cr
						const nx: number = centeredX / d
						const ny: number = centeredY / d
						const forceFieldIndex: number = offnx + offny * this.p.width
						if (forceFieldIndex >= 0 && forceFieldIndex < this.forceField.length) {
							const [fx, fy] = this.forceField[forceFieldIndex]
							const nfx: number = fx - ny * (1 - dt) * dir
							const nfy: number = fy + nx * (1 - dt) * dir
							//const nfd = 1 - (1 - sqrt(nfx ** 2 + nfy ** 2)) ** 100;
							this.forceField[forceFieldIndex] = [nfx, nfy]
						}
					}
				}
			}
		}
	}

	relaxFlowField(flowField: number[][], times: number = 1): number[][] {
		let _flowField: number[][] = flowField
		for (let t: number = times; t--;) {
			_flowField = _flowField.map(([fx, fy], index) => {
				const x: number = index % this.p.width
				const y: number = this.p.floor(index / this.p.width)
				if (y === 0 || y === this.p.height - 1 || x === 0 || x === this.p.width - 1) {
					return [fx, fy]
				}
				const up: number[] = this.forceField[index - this.p.width]
				const right: number[] = this.forceField[index + 1]
				const down: number[] = this.forceField[index + this.p.width]
				const left: number[] = this.forceField[index - 1]

				const newForce: p5.Vector = this.p.createVector(
					fx * 0.5 +
						up[0] * 0.125 +
						right[0] * 0.125 +
						down[0] * 0.125 +
						left[0] * 0.125,
					fy * 0.5 +
						up[1] * 0.125 +
						right[1] * 0.125 +
						down[1] * 0.125 +
						left[1] * 0.125
				).normalize()
				return [newForce.x, newForce.y]
			})
		}
		return _flowField
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}