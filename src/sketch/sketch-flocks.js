'use strict'
import P5 from 'p5'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
	constructor () {
		super()
		// variables
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

	setup () {
		super.setup()

		this.p.background(0)
		for (let i = 0; i < this.boidNum; i++) { //Make boidNum boids.
			this.boids.push(new Boid(this.p, new P5.Vector(this.p.random(0, this.p.width), this.p.random(0, this.p.height))))
		}
		for (let j = 0; j < this.predNum; j++) { //Make predNum predators.
			this.preds.push(new Predator(this.p, new P5.Vector(this.p.random(0, this.p.width), this.p.random(0, this.p.height)), 80))
		}
	}

	draw () {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		this.p.fill(0, 64)
		this.p.rect(0, 0, this.p.width, this.p.height)

		this.boids.forEach(boid => { //Cycle through all the boids and to the following for each:
			if (this.predBool) { //Flee from each predator.
				this.preds.forEach(pred => {
					let predBoid = pred.getLoc()
					boid.repelForce(predBoid, this.obstRad)
				})
			}
			if (this.obsBool) { //Flee from mouse.
				// mouse = new PVector(mouseX, mouseY);
				// boid.repelForce(mouse, obstRad);
			}
			if (this.flocking) { //Execute flocking rules.
				boid.flockForce(this.boids)
			}

			boid.display(this.circle, this.arrow)
		})

		this.preds.forEach(pred => {
			if (this.flocking) {
				pred.flockForce(this.boids)
				this.preds.forEach(otherpred => { //Predators should not run into other predators.
					if (otherpred.getLoc() != pred.getLoc()){
						pred.repelForce(otherpred.getLoc(), 30.0)
					}
				})
			}
			pred.display()
		})
	}
}

class Boid {
	constructor (p, location) {
		this.p = p
		this.loc = location
		this.vec = new P5.Vector()
		this.acc = new P5.Vector()
		this.mass = Math.floor(this.p.random(10, 30))
		this.maxForce = 6
	}

	flockForce (boids) {
		//The three behaviours that result in flocking; Defined below.
		this.avoidForce(boids)
		this.approachForce(boids)
		this.alignForce(boids)
	}

	update () {
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

	applyF (force) {
		force.div(this.mass)
		this.acc.add(force)
	}

	display (circle, arrow) {
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
			this.p.line(this.loc.x, this.loc.y, this.loc.x + 5 * this.vec.x, this.loc.y + 5 * this.vec.y)
		}
	}

	avoidForce (boids) {
		//Applies a force to the boid that makes
		//him avoid the average position of other boids.
		let count = 0 //Keep track of how many boids are too close.
		let locSum = new P5.Vector() //To store positions of the ones that are too close.

		boids.forEach(other => {
			let separation = this.mass + 20 //Desired separation from other boids. Arbitrarily linked to mass.

			let dist = P5.Vector.sub(other.getLoc(), this.loc) //distance to other boid.
			let d = dist.mag()

			if (d != 0 && d < separation) { //If closer than desired, and not self.
				let otherLoc = other.getLoc()
				locSum.add(otherLoc) //All locs from closeby boids are added.
				count ++
			}
		})

		if (count > 0) { //Don't divide by zero.
			locSum.div(count) //Divide by number of positions that were added (to create average).
			let avoidVec = P5.Vector.sub(this.loc, locSum) //AvoidVec connects loc and average loc.
			avoidVec.limit(this.maxForce*2.5) //Weigh by factor arbitrary factor 2.5.
			this.applyF(avoidVec)
		}
	}

	approachForce (boids) {
		let count = 0 //Keep track of how many boids are within sight.
		let locSum = new P5.Vector() //To store locations of boids in sight.
		//Algorhithm analogous to avoidForve().
		boids.forEach(other => {
			let approachRadius = this.mass + 60 //Radius in which to look for other boids.
			let dist = P5.Vector.sub(other.getLoc(), this.loc)
			let d = dist.mag()

			if (d != 0 && d < approachRadius) {
				let otherLoc = other.getLoc()
				locSum.add(otherLoc)
				count ++
			}
		})

		if (count > 0) {
			locSum.div(count)
			let approachVec = P5.Vector.sub(locSum, this.loc)
			approachVec.limit(this.maxForce)
			this.applyF(approachVec)
		}
	}

	alignForce (boids) {
		let count = 0 //Keep track of how many boids are in sight.
		let velSum = new P5.Vector() //To store vels of boids in sight.
		//Algorhithm analogous to approach- and avoidForce.
		boids.forEach(other => {
			let alignRadius = this.mass + 100;
			let dist = P5.Vector.sub(other.getLoc(), this.loc);
			let d = dist.mag();

			if (d != 0 && d < alignRadius) {
				let otherVel = other.getVel()
				velSum.add(otherVel)
				count ++
			}
		})

		if (count > 0) {
			velSum.div(count)
			let alignVec = velSum
			alignVec.limit(this.maxForce)
			this.applyF(alignVec)
		}
	}

	repelForce (obstacle, radius) {
		//Force that drives boid away from obstacle.
		let futPos = P5.Vector.add(this.loc, this.vec) //Calculate future position for more effective behavior.
		let dist = P5.Vector.sub(obstacle, futPos)
		let d = dist.mag()

		if (d <= radius) {
			let repelVec = P5.Vector.sub(this.loc, obstacle)
			repelVec.normalize()
			if (d != 0) { //Don't divide by zero.
				// let scale = 1.0/d; //The closer to the obstacle, the stronger the force.
				repelVec.normalize()
				repelVec.mult(this.maxForce * 7)
				if (repelVec.mag() < 0) { //Don't let the boids turn around to avoid the obstacle.
					repelVec.y = 0
				}
			}
			this.applyF(repelVec)
		}
	}

	//Easy way to acces loc and vel for any boid.
	getLoc () {
		return this.loc
	}

	getVel () {
		return this.vec
	}
}

class Predator extends Boid { //Predators are just boids with some extra characteristics.
	constructor (p, location) {
		super(p, location)
		this.maxForce = 10
		this.mass = Math.floor(this.p.random(70, 100))
	}

	display () {
		this.update()
		this.p.fill(255, 0, 0)
		this.p.noStroke()
		this.p.ellipse(this.loc.x, this.loc.y, this.mass, this.mass)
	}

	update () { //Same as for boid, but with different vel.limit().
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

	approachForce (boids) { //Same as for boid, but with bigger approachRadius.
		let count = 0
		let locSum = new P5.Vector()

		boids.forEach(other => {
			let approachRadius = this.mass + 260
			let dist = P5.Vector.sub(other.getLoc(), this.loc)
			let d = dist.mag()

			if (d != 0 && d < approachRadius) {
				let otherLoc = other.getLoc()
				locSum.add(otherLoc)
				count ++
			}
		})

		if (count > 0) {
			locSum.div(count)
			let approachVec = P5.Vector.sub(locSum, this.loc)
			approachVec.limit(this.maxForce)
			this.applyF(approachVec)
		}
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}