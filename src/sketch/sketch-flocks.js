'use strict'
import Sketch from '@/class/Sketch.js'

// variables
const boids = []
const preds = []
const boidNum = 180
const predNum = 1
const obstRad = 60

let flocking = true
let arrow = true
let circle = false
let predBool = true
let obsBool = false

class SketchTest extends Sketch {
	preload (s) {
		super.preload(s)
	}

	setup (s) {
		super.setup(s)

		s.background(0)

		for (let i = 0; i < boidNum; i++) { //Make boidNum boids.
			boids.add(new Boid(new s.PVector(s.random(0, s.width), s.random(0, s.height))))
		}
		for (let j = 0; j < predNum; j++) { //Make predNum predators.
			preds.add(new Predator(new s.PVector(s.random(0, s.width), s.random(0, s.height)), 80))
		}
	}

	draw (s) {
		super.draw(s)

		s.background(0);
		s.fill(0, 64);
		s.rect(0, 0, s.width, s.height)

		for (boid in boids) { //Cycle through all the boids and to the following for each:

			if (predBool) { //Flee from each predator.
				for (pred in preds) {
					let predBoid = pred.getLoc();
					boid.repelForce(predBoid, obstRad);
				}
			}
			if (obsBool) { //Flee from mouse.
				// mouse = new PVector(mouseX, mouseY);
				// boid.repelForce(mouse, obstRad);
			}
			if (flocking) { //Execute flocking rules.
				boid.flockForce(boids);
			}

			boid.display(circle, arrow); //Draw to screen.

		}
		// for (pred) {
		//Predators use the same flocking behaviour as boids, but they use it to chase rather than flock.
		if (flocking) {
			pred.flockForce(boids);
			for (otherpred in preds){ //Predators should not run into other predators.
				if (otherpred.getLoc() != pred.getLoc()){
					pred.repelForce(otherpred.getLoc(), 30.0);
				}
			}
		}
		pred.display();
		// }
	}

	mousePressed (s) {
		super.mousePressed(s)
	}

	keyTyped (s) {
		super.keyTyped(s)
	}

	keyPressed (s) {
		super.keyPressed(s)
	}

	doubleClicked (s) {
		super.doubleClicked(s)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}

class Boid {
	constructor (location, s) {
		this.loc = location
		this.vec = new s.PVector()
		this.acc = new s.PVector()
		this.mass = s.Math.floor(s.random(10, 30))
		this.maxForce = 6
		this.s = s
	}

	flockForce(boids) {
		//The three behaviours that result in flocking; Defined below.
		this.avoidForce(boids);
		this.approachForce(boids);
		this.alignForce(boids);
	}

	update() {
		//Calculate the next position of the boid.
		this.vel.add(this.acc);
		this.loc.add(this.vel);
		this.acc.mult(0); //Reset acc every time update() is called.
		this.vel.limit(5); //Arbitrary limit on speed.
		//Make canvas doughnut-shaped.
		if (this.loc.x <= 0) {
			this.loc.x = this.s.width;
		}
		if (this.loc.x > this.s.width) {
			this.loc.x = 0;
		}
		if (this.loc.y <= 0) {
			this.loc.y = this.s.height;
		}
		if (this.loc.y > this.s.height) {
			this.loc.y = 0;
		}
	}

	applyF(force) {
		//F=ma
		force.div(this.mass);
		this.acc.add(force);
	}

	display(circle, arrow) {
		this.update();
		this.s.fill(255, 255, 255);
		this.s.noStroke();
		if (circle) {
			this.s.ellipse(this.loc.x, this.loc.y, this.mass, this.mass); //Show boid as circle of radius 'mass'.
		}
		if (arrow) {
			//Draw vel-vector, scaled by arvitrary factor 3.
			this.s.stroke(255, 255, 255);
			this.s.strokeWeight(5);
			this.s.line(this.loc.x, this.loc.y, this.loc.x + 5 * this.vel.x, this.loc.y + 5 * this.vel.y);
			//Uncomment to display arrows instead of lines.
			//    pushMatrix();
			//    translate(loc.x+3*vel.x, loc.y+3*vel.y);
			//    rotate(vel.heading());
			//    line(0, 0, -5, -5);
			//    line(0, 0, -5, 5);
			//    popMatrix();
		}
	}

	avoidForce(boids) {
		//Applies a force to the boid that makes
		//him avoid the average position of other boids.
		let count = 0; //Keep track of how many boids are too close.
		let locSum = new this.s.PVector(); //To store positions of the ones that are too close.

		// for (other) {
		let separation = this.mass + 20; //Desired separation from other boids. Arbitrarily linked to mass.

		let dist = this.s.PVector.sub(other.getLoc(), this.loc); //distance to other boid.
		let d = dist.mag();

		if (d != 0 && d < separation) { //If closer than desired, and not self.
			let otherLoc = other.getLoc();
			locSum.add(otherLoc); //All locs from closeby boids are added.
			count ++;
		}
		// }
		if (count > 0) { //Don't divide by zero.
			locSum.div(count); //Divide by number of positions that were added (to create average).
			let avoidVec = this.s.PVector.sub(this.loc, locSum); //AvoidVec connects loc and average loc.
			avoidVec.limit(this.maxForce*2.5); //Weigh by factor arbitrary factor 2.5.
			this.applyF(avoidVec);
		}
	}

	approachForce(boids) {
		let count = 0; //Keep track of how many boids are within sight.
		let locSum = new this.s.PVector(); //To store locations of boids in sight.
		//Algorhithm analogous to avoidForve().
		// for (other) {

		let approachRadius = this.mass + 60; //Radius in which to look for other boids.
		let dist = this.s.PVector.sub(other.getLoc(), loc);
		let d = dist.mag();

		if (d != 0 && d < approachRadius) {
			let otherLoc = other.getLoc();
			locSum.add(otherLoc);
			count ++;
		}
		// }
		if (count>0) {
			locSum.div(count);
			let approachVec = this.s.PVector.sub(locSum, loc);
			approachVec.limit(maxForce);
			this.applyF(approachVec);
		}
	}

	alignForce(boids) {

		let count = 0; //Keep track of how many boids are in sight.
		let velSum = new this.s.PVector(); //To store vels of boids in sight.
		//Algorhithm analogous to approach- and avoidForce.
		// for (other) {
		let alignRadius = this.mass + 100;
		let dist = this.sPVector.sub(boids.getLoc(), this.loc);
		let d = dist.mag();

		if (d != 0 && d < alignRadius) {
			let otherVel = boids.getVel();
			velSum.add(otherVel);
			count ++;
		}
		// }
		if (count>0) {
			velSum.div(count);
			let alignVec = velSum;
			alignVec.limit(this.maxForce);
			this.applyF(alignVec);
		}
	}

	repelForce(obstacle, radius) {
		//Force that drives boid away from obstacle.

		let futPos = this.s.PVector.add(this.loc, this.vel); //Calculate future position for more effective behavior.
		let dist = this.s.PVector.sub(obstacle, futPos);
		let d = dist.mag();

		if (d <= radius) {
			let repelVec = this.s.PVector.sub(loc, obstacle);
			repelVec.normalize();
			if (d != 0) { //Don't divide by zero.
				let scale = 1.0/d; //The closer to the obstacle, the stronger the force.
				repelVec.normalize();
				repelVec.mult(this.maxForce*7);
				if (repelVec.mag() < 0) { //Don't let the boids turn around to avoid the obstacle.
					repelVec.y = 0;
				}
			}
			this.applyF(repelVec);
		}
	}

	//Easy way to acces loc and vel for any boid.
	getLoc() {
		return this.loc;
	}

	getVel() {
		return this.vel;
	}
}
/*
import deadpixel.keystone.*;

Keystone ks;
CornerPinSurface surface;
PGraphics offscreen;

ArrayList<Boid> boids = new ArrayList<Boid>(); //To store all boids in.
ArrayList<Predator> preds = new ArrayList<Predator>(); //To store all predators in.
int boidNum = 180; //Initial number of boids created.
int predNum = 1; //Initial number of predators created.
PVector mouse; //Mouse-vector to use as obstacle.
float obstRad = 60; //Radius of mouse-obstacle.
int boolT = 0; //Keeps track of time to improve user-input.

boolean flocking = true; //Toggle flocking.
boolean arrow = true; //Toggle arrows.
boolean circle = false; //Toggle circles.
boolean predBool = true; //Toggle predators.
boolean obsBool = false; //Toggle obstacles.

void setup() {
  background(0);
  fullScreen(P3D, 2);

  ks = new Keystone(this);
  surface = ks.createCornerPinSurface(width, height, 20);
  offscreen = createGraphics(width, height, P3D);
  offscreen.beginDraw();
  offscreen.background(0);
  offscreen.endDraw();
  surface.render(offscreen);

  for (int i=0; i<boidNum; i++) { //Make boidNum boids.
    boids.add( new Boid(new PVector(random(0, offscreen.width), random(0, offscreen.height))));
  }
  for (int j=0; j<predNum; j++) { //Make predNum predators.
    preds.add(new Predator(new PVector(random(0, offscreen.width), random(0, offscreen.height)), 80));
  }

  try {
    ks.load();
  } catch(NullPointerException e){}
}

void draw() {
  background(0);

  offscreen.beginDraw();
  offscreen.fill(0, 64);
  offscreen.rect(0, 0, offscreen.width, offscreen.height);

  //if (mousePressed) { //Add boid by clicking.
  //  boids.add(new Boid(new PVector(mouseX, mouseY)));
  //}

  for (Boid boid: boids) { //Cycle through all the boids and to the following for each:

    if (predBool) { //Flee from each predator.
      for (Predator pred: preds) {
        PVector predBoid = pred.getLoc();
        boid.repelForce(predBoid, obstRad);
      }
    }
    if (obsBool) { //Flee from mouse.
      mouse = new PVector(mouseX, mouseY);
      boid.repelForce(mouse, obstRad);
    }
    if (flocking) { //Execute flocking rules.
      boid.flockForce(boids);
    }

    boid.display(circle, arrow); //Draw to screen.

  }
  for (Predator pred: preds) {
    //Predators use the same flocking behaviour as boids, but they use it to chase rather than flock.
    if (flocking) {
      pred.flockForce(boids);
      for (Predator otherpred: preds){ //Predators should not run into other predators.
        if (otherpred.getLoc() != pred.getLoc()){
          pred.repelForce(otherpred.getLoc(), 30.0);
        }
      }
    }
    pred.display();
  }

  offscreen.endDraw();
  surface.render(offscreen);
}

void keyPressed() {
  switch(key) {
  case 'c':
    // enter/leave calibration mode, where surfaces can be warped
    // and moved
    ks.toggleCalibration();
    break;

  case 'l':
    // loads the saved layout
    ks.load();
    break;

  case 's':
    // saves the layout
    ks.save();
    break;
  }
}

class Boid {

  PVector loc;
  PVector vel;
  PVector acc;
  int mass; //to calculate accelerarion and radius of sphere.
  int maxForce = 6; //determines how much effect the different forces have on the acceleration.

  Boid(PVector location) {
    loc = location; //Boids start with given location and no vel or acc.
    vel = new PVector();
    acc = new PVector();
    mass = int(random(10, 30));
  }

  void flockForce(ArrayList<Boid> boids) {
    //The three behaviours that result in flocking; Defined below.
    avoidForce(boids);
    approachForce(boids);
    alignForce(boids);
  }

  void update() {
    //Calculate the next position of the boid.
    vel.add(acc);
    loc.add(vel);
    acc.mult(0); //Reset acc every time update() is called.
    vel.limit(5); //Arbitrary limit on speed.
    //Make canvas doughnut-shaped.
    if (loc.x <= 0) {
      loc.x = offscreen.width;
    }
    if (loc.x > offscreen.width) {
      loc.x = 0;
    }
    if (loc.y <= 0) {
      loc.y = offscreen.height;
    }
    if (loc.y > offscreen.height) {
      loc.y = 0;
    }
  }

  void applyF(PVector force) {
    //F=ma
    force.div(mass);
    acc.add(force);
  }

  void display(boolean circle, boolean arrow) {
    update();
    offscreen.fill(255, 255, 255);
    offscreen.noStroke();
    if (circle) {
      offscreen.ellipse(loc.x, loc.y, mass, mass); //Show boid as circle of radius 'mass'.
    }
    if (arrow) {
      //Draw vel-vector, scaled by arvitrary factor 3.
      offscreen.stroke(255, 255, 255);
      offscreen.strokeWeight(5);
      offscreen.line(loc.x, loc.y, loc.x + 5*vel.x, loc.y + 5*vel.y);
      //Uncomment to display arrows instead of lines.
      //    pushMatrix();
      //    translate(loc.x+3*vel.x, loc.y+3*vel.y);
      //    rotate(vel.heading());
      //    line(0, 0, -5, -5);
      //    line(0, 0, -5, 5);
      //    popMatrix();
    }
  }

  void avoidForce(ArrayList<Boid> boids) {
    //Applies a force to the boid that makes
    //him avoid the average position of other boids.
    float count = 0; //Keep track of how many boids are too close.
    PVector locSum = new PVector(); //To store positions of the ones that are too close.

    for (Boid other: boids) {
      int separation = mass + 20; //Desired separation from other boids. Arbitrarily linked to mass.

      PVector dist = PVector.sub(other.getLoc(), loc); //distance to other boid.
      float d = dist.mag();

      if (d != 0 && d < separation) { //If closer than desired, and not self.
        PVector otherLoc = other.getLoc();
        locSum.add(otherLoc); //All locs from closeby boids are added.
        count ++;
      }
    }
    if (count>0) { //Don't divide by zero.
      locSum.div(count); //Divide by number of positions that were added (to create average).
      PVector avoidVec = PVector.sub(loc, locSum); //AvoidVec connects loc and average loc.
      avoidVec.limit(maxForce*2.5); //Weigh by factor arbitrary factor 2.5.
      applyF(avoidVec);
    }
  }

  void approachForce(ArrayList<Boid> boids) {
    float count = 0; //Keep track of how many boids are within sight.
    PVector locSum = new PVector(); //To store locations of boids in sight.
    //Algorhithm analogous to avoidForve().
    for (Boid other: boids) {

      int approachRadius = mass + 60; //Radius in which to look for other boids.
      PVector dist = PVector.sub(other.getLoc(), loc);
      float d = dist.mag();

      if (d != 0 && d < approachRadius) {
        PVector otherLoc = other.getLoc();
        locSum.add(otherLoc);
        count ++;
      }
    }
    if (count>0) {
      locSum.div(count);
      PVector approachVec = PVector.sub(locSum, loc);
      approachVec.limit(maxForce);
      applyF(approachVec);
    }
  }

  void alignForce(ArrayList<Boid> boids) {

    float count = 0; //Keep track of how many boids are in sight.
    PVector velSum = new PVector(); //To store vels of boids in sight.
    //Algorhithm analogous to approach- and avoidForce.
    for (Boid other: boids) {
      int alignRadius = mass + 100;
      PVector dist = PVector.sub(other.getLoc(), loc);
      float d = dist.mag();

      if (d != 0 && d < alignRadius) {
        PVector otherVel = other.getVel();
        velSum.add(otherVel);
        count ++;
      }
    }
    if (count>0) {
      velSum.div(count);
      PVector alignVec = velSum;
      alignVec.limit(maxForce);
      applyF(alignVec);
    }
  }

  void repelForce(PVector obstacle, float radius) {
    //Force that drives boid away from obstacle.

    PVector futPos = PVector.add(loc, vel); //Calculate future position for more effective behavior.
    PVector dist = PVector.sub(obstacle, futPos);
    float d = dist.mag();

    if (d <= radius) {
      PVector repelVec = PVector.sub(loc, obstacle);
      repelVec.normalize();
      if (d != 0) { //Don't divide by zero.
        float scale = 1.0/d; //The closer to the obstacle, the stronger the force.
        repelVec.normalize();
        repelVec.mult(maxForce*7);
        if (repelVec.mag() < 0) { //Don't let the boids turn around to avoid the obstacle.
          repelVec.y = 0;
        }
      }
      applyF(repelVec);
    }
  }

  //Easy way to acces loc and vel for any boid.
  PVector getLoc() {
    return loc;
  }

  PVector getVel() {
    return vel;
  }
}


class Predator extends Boid { //Predators are just boids with some extra characteristics.
  float maxForce = 10; //Predators are better at steering.
  Predator(PVector location, int scope) {
    super(location);
    mass = int(random(70, 100)); //Predators are bigger and have more mass.
  }

  void display() {
    update();
    offscreen.fill(255, 0, 0);
    offscreen.noStroke();
    offscreen.ellipse(loc.x, loc.y, mass, mass);
  }

  void update() { //Same as for boid, but with different vel.limit().
    //Calculate the next position of the boid.
    vel.add(acc);
    loc.add(vel);
    acc.mult(0); //Reset acc every time update() is called.
    vel.limit(6); //Arbitrary limit on speed, hihger for a predator.
    //Make canvas doughnut-shaped.
    if (loc.x<=0) {
      loc.x = offscreen.width;
    }
    if (loc.x>offscreen.width) {
      loc.x = 0;
    }
    if (loc.y<=0) {
      loc.y = offscreen.height;
    }
    if (loc.y>offscreen.height) {
      loc.y = 0;
    }
  }

  void approachForce(ArrayList<Boid> boids) { //Same as for boid, but with bigger approachRadius.
    float count = 0;
    PVector locSum = new PVector();

    for (Boid other: boids) {

      int approachRadius = mass + 260;
      PVector dist = PVector.sub(other.getLoc(), loc);
      float d = dist.mag();

      if (d != 0 && d<approachRadius) {
        PVector otherLoc = other.getLoc();
        locSum.add(otherLoc);
        count ++;
      }
    }
    if (count>0) {
      locSum.div(count);
      PVector approachVec = PVector.sub(locSum, loc);
      approachVec.limit(maxForce);
      applyF(approachVec);
    }
  }
}

*/