'use strict'
import p5 from 'p5'
import Sketch from '@/class/Sketch'

class SketchTest extends Sketch {
	// property
	boids: Boid[]
	preds: Predator[]
	boidNum: number
	predNum: number
	obstRad: number
	flocking: boolean
	arrow: boolean
	circle: boolean
	predBool: boolean
	obsBool: boolean

	constructor() {
		super({})
		// initialize
		this.boids = []
		this.preds = []
		this.boidNum = 130
		this.predNum = 1
		this.obstRad = 60
		this.flocking = true
		this.arrow = true
		this.circle = false
		this.predBool = true
		this.obsBool = false
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		for (let i: number = 0; i < this.boidNum; i++) {
			//Make boidNum boids.
			this.boids.push(
				new Boid(
					this.p,
					new p5.Vector(
						this.p.random(0, this.p.width),
						this.p.random(0, this.p.height)
					)
				)
			)
		}
		for (let j: number = 0; j < this.predNum; j++) {
			//Make predNum predators.
			this.preds.push(
				new Predator(
					this.p,
					new p5.Vector(
						this.p.random(0, this.p.width),
						this.p.random(0, this.p.height)
					)
				)
			)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.fill(0, 64)
		this.p.rect(0, 0, this.p.width, this.p.height)

		this.boids.forEach(boid => {
			//Cycle through all the boids and to the following for each:
			if (this.predBool) {
				//Flee from each predator.
				this.preds.forEach(pred => {
					let predBoid = pred.getLoc()
					boid.repelForce(predBoid, this.obstRad)
				})
			}
			if (this.obsBool) {
				//Flee from mouse.
				// mouse = new PVector(mouseX, mouseY);
				// boid.repelForce(mouse, obstRad);
			}
			if (this.flocking) {
				//Execute flocking rules.
				boid.flockForce(this.boids)
			}

			boid.display(this.circle, this.arrow)
		})

		this.preds.forEach(pred => {
			if (this.flocking) {
				pred.flockForce(this.boids)
				this.preds.forEach(otherpred => {
					//Predators should not run into other predators.
					if (otherpred.getLoc() != pred.getLoc()) {
						pred.repelForce(otherpred.getLoc(), 30.0)
					}
				})
			}
			pred.display()
		})
	}
}

class Boid {
	p: p5
	loc: p5.Vector
	vec: p5.Vector
	acc: p5.Vector
	mass: number
	maxForce: number

	constructor(p: p5, location: p5.Vector) {
		this.p = p
		this.loc = location
		this.vec = new p5.Vector()
		this.acc = new p5.Vector()
		this.mass = Math.floor(this.p.random(10, 30))
		this.maxForce = 6
	}

	flockForce(boids: Boid[]): void {
		//The three behaviours that result in flocking; Defined below.
		this.avoidForce(boids)
		this.approachForce(boids)
		this.alignForce(boids)
	}

	update(): void {
		//Calculate the next position of the boid.
		this.vec.add(this.acc)
		this.loc.add(this.vec)
		this.acc.mult(0) //Reset acc every time update() is called.
		this.vec.limit(5) //Arbitrary limit on speed.
		//Make canvas doughnut-shaped.
		if (this.loc.x <= 0) {
			this.loc.x = this.p.width
		}
		if (this.loc.x > this.p.width) {
			this.loc.x = 0
		}
		if (this.loc.y <= 0) {
			this.loc.y = this.p.height
		}
		if (this.loc.y > this.p.height) {
			this.loc.y = 0
		}
	}

	applyF(force: p5.Vector): void {
		force.div(this.mass)
		this.acc.add(force)
	}

	display(circle: boolean, arrow: boolean): void {
		this.update()
		this.p.fill(255, 255, 255)
		this.p.noStroke()
		if (circle) {
			this.p.ellipse(this.loc.x, this.loc.y, this.mass, this.mass) //Show boid as circle of radius 'mass'.
		}
		if (arrow) {
			//Draw vel-vector, scaled by arvitrary factor 3.
			this.p.stroke(255, 255, 255)
			this.p.strokeWeight(5)
			this.p.line(
				this.loc.x,
				this.loc.y,
				this.loc.x + 5 * this.vec.x,
				this.loc.y + 5 * this.vec.y
			)
		}
	}

	avoidForce(boids: Boid[]): void {
		//Applies a force to the boid that makes
		//him avoid the average position of other boids.
		let count: number = 0 //Keep track of how many boids are too close.
		const locSum: p5.Vector = new p5.Vector() //To store positions of the ones that are too close.

		boids.forEach(other => {
			const separation: number = this.mass + 20 //Desired separation from other boids. Arbitrarily linked to mass.

			const dist: p5.Vector = p5.Vector.sub(other.getLoc(), this.loc) //distance to other boid.
			const d: number = dist.mag()

			if (d != 0 && d < separation) {
				//If closer than desired, and not self.
				const otherLoc: p5.Vector = other.getLoc()
				locSum.add(otherLoc) //All locs from closeby boids are added.
				count++
			}
		})

		if (count > 0) {
			//Don't divide by zero.
			locSum.div(count) //Divide by number of positions that were added (to create average).
			const avoidVec: p5.Vector = p5.Vector.sub(this.loc, locSum) //AvoidVec connects loc and average loc.
			avoidVec.limit(this.maxForce * 2.5) //Weigh by factor arbitrary factor 2.5.
			this.applyF(avoidVec)
		}
	}

	approachForce(boids: Boid[]): void {
		let count: number = 0 //Keep track of how many boids are within sight.
		const locSum: p5.Vector = new p5.Vector() //To store locations of boids in sight.
		//Algorhithm analogous to avoidForve().
		boids.forEach(other => {
			const approachRadius: number = this.mass + 60 //Radius in which to look for other boids.
			const dist: p5.Vector = p5.Vector.sub(other.getLoc(), this.loc)
			const d: number = dist.mag()

			if (d != 0 && d < approachRadius) {
				const otherLoc: p5.Vector = other.getLoc()
				locSum.add(otherLoc)
				count++
			}
		})

		if (count > 0) {
			locSum.div(count)
			const approachVec: p5.Vector = p5.Vector.sub(locSum, this.loc)
			approachVec.limit(this.maxForce)
			this.applyF(approachVec)
		}
	}

	alignForce(boids: Boid[]): void {
		let count: number = 0 //Keep track of how many boids are in sight.
		const velSum: p5.Vector = new p5.Vector() //To store vels of boids in sight.
		//Algorhithm analogous to approach- and avoidForce.
		boids.forEach(other => {
			const alignRadius: number = this.mass + 100
			const dist: p5.Vector = p5.Vector.sub(other.getLoc(), this.loc)
			const d: number = dist.mag()

			if (d != 0 && d < alignRadius) {
				const otherVel: p5.Vector = other.getVel()
				velSum.add(otherVel)
				count++
			}
		})

		if (count > 0) {
			velSum.div(count)
			const alignVec: p5.Vector = velSum
			alignVec.limit(this.maxForce)
			this.applyF(alignVec)
		}
	}

	repelForce(obstacle: p5.Vector, radius: number): void {
		//Force that drives boid away from obstacle.
		const futPos: p5.Vector = p5.Vector.add(this.loc, this.vec) //Calculate future position for more effective behavior.
		const dist: p5.Vector = p5.Vector.sub(obstacle, futPos)
		const d: number = dist.mag()

		if (d <= radius) {
			const repelVec: p5.Vector = p5.Vector.sub(this.loc, obstacle)
			repelVec.normalize()
			if (d != 0) {
				//Don't divide by zero.
				// let scale = 1.0/d; //The closer to the obstacle, the stronger the force.
				repelVec.normalize()
				repelVec.mult(this.maxForce * 7)
				if (repelVec.mag() < 0) {
					//Don't let the boids turn around to avoid the obstacle.
					repelVec.y = 0
				}
			}
			this.applyF(repelVec)
		}
	}

	//Easy way to acces loc and vel for any boid.
	getLoc(): p5.Vector {
		return this.loc
	}

	getVel(): p5.Vector {
		return this.vec
	}
}

class Predator extends Boid {
	//Predators are just boids with some extra characteristics.
	constructor(p: p5, location: p5.Vector) {
		super(p, location)
		this.maxForce = 10
		this.mass = Math.floor(this.p.random(70, 100))
	}

	display(): void {
		this.update()
		this.p.fill(255, 0, 0)
		this.p.noStroke()
		this.p.ellipse(this.loc.x, this.loc.y, this.mass, this.mass)
	}

	update(): void {
		//Same as for boid, but with different vel.limit().
		//Calculate the next position of the boid.
		this.vec.add(this.acc)
		this.loc.add(this.vec)
		this.acc.mult(0) //Reset acc every time update() is called.
		this.vec.limit(6) //Arbitrary limit on speed, hihger for a predator.
		//Make canvas doughnut-shaped.
		if (this.loc.x <= 0) {
			this.loc.x = this.p.width
		}
		if (this.loc.x > this.p.width) {
			this.loc.x = 0
		}
		if (this.loc.y <= 0) {
			this.loc.y = this.p.height
		}
		if (this.loc.y > this.p.height) {
			this.loc.y = 0
		}
	}

	approachForce(boids: Boid[]): void {
		//Same as for boid, but with bigger approachRadius.
		let count = 0
		const locSum: p5.Vector = new p5.Vector()

		boids.forEach(other => {
			const approachRadius: number = this.mass + 260
			const dist: p5.Vector = p5.Vector.sub(other.getLoc(), this.loc)
			const d: number = dist.mag()

			if (d != 0 && d < approachRadius) {
				const otherLoc: p5.Vector = other.getLoc()
				locSum.add(otherLoc)
				count++
			}
		})

		if (count > 0) {
			locSum.div(count)
			const approachVec: p5.Vector = p5.Vector.sub(locSum, this.loc)
			approachVec.limit(this.maxForce)
			this.applyF(approachVec)
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
