'use strict'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
  constructor() {
    super({})
    // variables
    this.treeMax = 3
    this.trees = []
    // this.startPoint
    this.drection
    this.count = []
    this.colorInt = 250
  }

  setup() {
    super.setup()

    this.p.background(0)

    this.p.stroke(80, 0, 50, 200)
    this.p.fill(250, this.colorInt, this.colorInt, 220)
    this.p.ellipseMode(this.p.CENTER)
    this.p.smooth()
    this.drection = this.p.createVector(0, -this.p.height)
    for (let i = 0; i < this.treeMax; i++) {
      const start = this.p.createVector(this.p.random(this.p.width / 4, this.p.width / 4 * 3), this.p.height / 1)
      const myTree = new tree(this.p, start, this.drection)
      this.trees[i] = myTree
      this.count[i] = myTree.treeSize
    }
  }

  draw() {
    super.draw()
    if (!this.p) return

    this.p.background(0)
    let j
    let size = 12
    for (j = 0; j < this.treeMax; j++) {
      this.trees[j].swing()
    }

    this.p.stroke(255, 200)
    for (j = 0; j < this.treeMax; j++) {
      for (let i = 1; i < this.count[j]; i++) {
        this.p.strokeWeight(this.trees[j].twig[this.trees[j].map[i].x].thickness[this.trees[j].map[i].y])
        this.p.line(this.trees[j].twig[this.trees[j].map[i].x].location[this.trees[j].map[i].y - 1].x, this.trees[j].twig[this.trees[j].map[i].x].location[this.trees[j].map[i].y - 1].y,
          this.trees[j].twig[this.trees[j].map[i].x].location[this.trees[j].map[i].y].x, this.trees[j].twig[this.trees[j].map[i].x].location[this.trees[j].map[i].y].y)
      }
    }

    this.p.noStroke()
    size -= 0.4;
    if (size <= 12) size = 12
    for (j = 0; j < this.treeMax; j++) {
      for (let i = 0; i < this.trees[j].twig.length; i++) {
        let num = this.trees[j].twig[i].location.length - 1
        this.p.ellipse(this.trees[j].twig[i].location[num].x, this.trees[j].twig[i].location[num].y, size, size)
      }
    }
  }
}

class branch {
  constructor(p, loc, thic, id, branchIndex) {
    this.p = p
    this.location = this.p.createVector(1)
    this.thickness = [1]
    this.location[0] = this.p.createVector(loc.x, loc.y)
    this.thickness[0] = thic

    this.baseIndex[0] = [1]
    this.baseIndex[1] = [1]
    this.baseIndex[0][0] = id
    this.baseIndex[1][0] = branchIndex

    this.isCandidate = false
    this.dTheta
  }

  branchRotate(index, theta, reference) {
    this.location[index].sub(reference)
    this.rotate2D(this.location[index], theta)
    this.location[index].add(reference)
  }

  rotate2D(v, theta) {
    const xTemp = v.x
    v.x = v.x * this.p.cos(theta) - v.y * this.p.sin(theta)
    v.y = xTemp * this.p.sin(theta) + v.y * this.p.cos(theta)
  }
}

class frontier {
  constructor(p, startPoint, direction) {
    this.p = p
    this.location = this.p.createVector(startPoint.x, startPoint.y)
    this.velocity = this.p.createVector(direction.x, direction.y)
    this.thickness = this.p.random(10, 20)
    this.finished = false
  }

  update(factor) {
    if (this.location.x > -10 &
      this.location.y > -10 &
      this.location.x < this.p.width + 10 &
      this.location.y < this.p.height + 10 &
      this.thickness > factor) {
      this.velocity.normalize()
      const uncertain = this.p.createVector(this.p.random(-1, 1), this.p.random(-1, 1))
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

class frontierParent {
  constructor(p, parent) {
    this.p = p
    this.location = parent.location.get()
    this.velocity = parent.velocity.get()
    this.thickness = parent.thickness
    parent.thickness = this.thickness
    this.finished = parent.finished
  }

  update(factor) {
    if (this.location.x > -10 &
      this.location.y > -10 &
      this.location.x < this.p.width + 10 &
      this.location.y < this.p.height + 10 &
      this.thickness > factor) {
      this.velocity.normalize()
      const uncertain = this.p.createVector(this.p.random(-1, 1), this.p.random(-1, 1))
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

class tree {
  constructor(p, startPoint, direction) {
    this.p = p
    this.BranchLengthFactor = 0.15
    this.BranchLocationFactor = 0.3
    this.dtheta
    this.treeSize
    this.candNum = 3
    this.candidateIndex = new Array(this.candNum)
    this.amplitude = new Array(this.candNum)
    this.phaseFactor = new Array(this.candNum)
    this.freq
    this.period
    this.dt = 0.025
    this.time = 0
    let id = 0
    let growth = false

    // let fr = new frontierParent(s, 1)
    let fr = []
    fr[id] = new frontier(this.p, startPoint, direction)

    this.twig = new branch(this.p, 1)
    this.twig[id] = new branch(this.p, fr[id].location, fr[id].thickness, id, 0)

    this.map = this.p.createVector(1)
    this.map[0] = this.p.createVector(id, this.twig[id].location.length - 1)

    while (!growth) {
      let growthSum = 0
      for (id = 0; id < fr.length; id++) {
        fr[id].update(this.BranchLocationFactor)
        if (!fr[id].finished) {
          this.twig[id].location = this.p.append(this.twig[id].location, this.p.createVector(fr[id].location.x, fr[id].location.y))
          this.twig[id].thickness = this.p.append(this.twig[id].thickness, fr[id].thickness)
          this.map = this.p.append(this.map, this.p.createVector(id, this.twig[id].location.length - 1))

          if (this.p.random(0, 1) < this.BranchLengthFactor) { // control length of one branch
            fr[id].thickness *= 0.65;
            this.twig[id].thickness[this.twig[id].thickness.length - 1] = fr[id].thickness
            if (fr[id].thickness > this.BranchLocationFactor) { // control the number of the locations on all branches, i.e., treeSize.
              fr = this.p.append(fr, new frontierParent(this.p, fr[id]))
              this.twig = this.p.append(this.twig, new branch(this.p, fr[id].location, fr[id].thickness, id, this.twig[id].location.length - 1))
              let _id = id
              if (_id != 0)
                for (let _i = 0; _i < 2; _i++) this.twig[this.twig.length - 1].baseIndex[_i] = this.p.concat(this.twig[this.twig.length - 1].baseIndex[_i], this.twig[_id].baseIndex[_i])
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

    let _candList = []
    let _candfloat = new Array(this.twig.length)
    for (let i = 0; i < this.twig.length; i++) {
      _candfloat[i] = this.twig[i].location.length
      _candList.add(_candfloat[i])
    }
    this.candidateIndex[0] = 0
    this.twig[0].isCandidate = true
    this.twig[0].dTheta = new Array(this.twig[0].location.length)
    _candfloat[0] = -1.0
    _candList.set(0, -1.0)
    for (let i = 1; i < this.candNum; i++) {
      let _temp = this.p.max(_candfloat)
      this.candidateIndex[i] = _candList.indexOf(_temp)
      this.twig[this.candidateIndex[i]].isCandidate = true
      this.twig[this.candidateIndex[i]].dTheta = new Array(this.twig[this.candidateIndex[i]].location.length)
      _candfloat[this.candidateIndex[i]] = -1.0
      _candList.set(this.candidateIndex[i], -1.0)
    }

    this.amplitude[0] = this.p.random(0.006, 0.012)
    this.phaseFactor[0] = this.p.random(0.6, 1.2)
    this.freq = this.p.random(0.5, 0.8)
    this.period = 1 / this.freq
    for (let i = 1; i < this.candNum; i++) {
      this.amplitude[i] = this.amplitude[i - 1] * this.p.random(0.9, 1.4)
      this.phaseFactor[i] = this.phaseFactor[i - 1] * this.p.random(0.9, 1.4)
    }
  }

  swing() {
    for (let i = 0; i < this.candNum; i++) {
      let _num = this.twig[this.candidateIndex[i]].location.length
      for (let j = 0; j < _num; j++) {
        this.twig[this.candidateIndex[i]].dTheta[j] = this.amplitude[i] * this.dt * this.p.TWO_PI * this.freq * this.p.cos(this.p.TWO_PI * this.freq * this.time - this.phaseFactor[i] * this.p.PI * j / _num)
      }
    }

    for (let id = 0; id < this.twig.length; id++) {
      if (this.twig[id].isCandidate) {
        for (let _id = 1; _id < this.twig[id].location.length; _id++) {
          this.twig[id].branchRotate(_id, this.twig[id].dTheta[_id], this.twig[id].location[0])
        }
      }

      for (let j = 0; j < this.twig[id].baseIndex[0].length; j++) {
        if (!this.twig[this.twig[id].baseIndex[0][j]].isCandidate | id == 0) continue
        else {
          for (let k = (id == 0) ? 1 : 0; k < this.twig[id].location.length; k++) {
            this.twig[id].branchRotate(k, this.twig[this.twig[id].baseIndex[0][j]].dTheta[this.twig[id].baseIndex[1][j]], this.twig[this.twig[id].baseIndex[0][j]].location[0])
          }
        }
      }
    } // for(int id = 0; id < twig.length; id++)

    this.time += this.dt
    if (this.time >= this.period) this.time -= this.period
  }
}

export default function () {
  const sketch = new SketchTest()
  sketch.init()
}

/*
import deadpixel.keystone.*;
import ddf.minim.analysis.*;
import ddf.minim.*;

Keystone ks;
CornerPinSurface surface;
PGraphics offscreen;

final int BUFSIZE = 512;
Minim minim;
AudioInput in;

int treeMax = 3;
tree trees[] = new tree[treeMax];
PVector startPoint;
PVector drection;
int count[] = new int[treeMax];
int colorInt = 250;
float volume = 0;

void setup() {
  fullScreen(P3D, 2);
  background(0);
  frameRate(30);

  ks = new Keystone(this);
  surface = ks.createCornerPinSurface(width, height, 20);
  offscreen = createGraphics(width, height, P3D);
  offscreen.beginDraw();
  offscreen.background(0);

  offscreen.stroke(80, 0, 50, 200);
  offscreen.fill(250, colorInt, colorInt, 220);
  offscreen.ellipseMode(CENTER);
  offscreen.smooth();
  drection = new PVector(0, -height);
  for (int i = 0; i < treeMax; i ++) {
    PVector start = new PVector(random(width/4, width/4*3), height/1);
    tree myTree = new tree(start, drection);
    trees[i] = myTree;
    count[i] = myTree.treeSize;
  }

  offscreen.endDraw();
  surface.render(offscreen);

  minim = new Minim(this);
  in = minim.getLineIn(Minim.MONO, BUFSIZE);

  try {
    ks.load();
  } catch(NullPointerException e){}
}

void draw() {
  background(0);
  offscreen.beginDraw();
  offscreen.background(0);
  int j;
  float size = 12;
  for (j = 0; j < treeMax; j ++) {
    trees[j].swing();
  }

  offscreen.stroke(255, 200);
  for (j = 0; j < treeMax; j ++) {
    for(int i = 1; i < count[j]; i ++) {
      offscreen.strokeWeight(trees[j].twig[(int)trees[j].map[i].x].thickness[(int)trees[j].map[i].y]);
      offscreen.line(trees[j].twig[(int)trees[j].map[i].x].location[(int)trees[j].map[i].y - 1].x, trees[j].twig[(int)trees[j].map[i].x].location[(int)trees[j].map[i].y - 1].y,
           trees[j].twig[(int)trees[j].map[i].x].location[(int)trees[j].map[i].y].x, trees[j].twig[(int)trees[j].map[i].x].location[(int)trees[j].map[i].y].y);
    }
  }

  offscreen.noStroke();
  volume = map(in.mix.level(), 0, 0.5, 0, 250);
  if (volume > 120) {
    offscreen.fill(250, random(volume), random(volume), 220);
    size = map(volume, 0, 250, 0, 16);
  }
  size -= 0.4;
  if (size <= 12) size = 12;
  for (j = 0; j < treeMax; j ++) {
    for(int i = 0; i < trees[j].twig.length; i++) {
      int num = trees[j].twig[i].location.length - 1;
      offscreen.ellipse(trees[j].twig[i].location[num].x, trees[j].twig[i].location[num].y, size, size);
    }
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

void stop() {
  in.close();
  minim.stop();
  super.stop();
}

class branch {
  PVector[] location;
  float[] thickness;
  int[][] baseIndex = new int[2][];
  boolean isCandidate = false;
  float[] dTheta;

  branch(PVector loc, float thic, int id, int branchIndex) {
    location = new PVector[1];
    thickness = new float[1];
    location[0] = new PVector(loc.x, loc.y);
    thickness[0] = thic;

    baseIndex[0] = new int[1];
    baseIndex[1] = new int[1];
    baseIndex[0][0] = id;
    baseIndex[1][0] = branchIndex;
  }
  void branchRotate(int index, float theta, PVector reference) {
    location[index].sub(reference);
    rotate2D(location[index], theta);
    location[index].add(reference);
  }

  void rotate2D(PVector v, float theta) {
    float xTemp = v.x;
    v.x = v.x * cos(theta) - v.y * sin(theta);
    v.y = xTemp * sin(theta) + v.y * cos(theta);
  }
}

class frontier {
  PVector location;
  PVector velocity;
  float thickness;
  boolean finished;

  frontier(PVector startPoint, PVector direction) {
    location = new PVector(startPoint.x, startPoint.y);
    velocity = new PVector(direction.x, direction.y);
    thickness = random(10, 20);
    finished = false;
  }

  frontier(frontier parent) {
    location = parent.location.get();
    velocity = parent.velocity.get();
    thickness = parent.thickness;
    parent.thickness = thickness;
    finished = parent.finished;
  }

  void update(float factor) {
    if(  location.x > -10
       & location.y > -10
       & location.x < width + 10
       & location.y < height + 10
       & thickness > factor) {
      velocity.normalize();
      PVector uncertain = new PVector(random(-1, 1), random(-1, 1));
      uncertain.normalize();
      uncertain.mult(0.2);
      velocity.mult(0.8);
      velocity.add(uncertain);
      velocity.mult(random(8, 15));
      location.add(velocity);
    } else {
      finished = true;
    }
  } // void update()
}

class tree {
  PVector[] map;
  branch[] twig;
  int treeSize;
  float BranchLengthFactor = 0.15;
  float BranchLocationFactor = 0.3;

  float dt = 0.025;
  float time = 0;
  float[] dtheta;

  int candNum = 3;
  int[] candidateIndex = new int[candNum];
  float[] amplitude = new float[candNum];
  float[] phaseFactor = new float[candNum];
  float freq;
  float period;

  tree(PVector startPoint, PVector direction) {
    int id = 0;
    boolean growth = false;

    frontier[] fr = new frontier[1];
    fr[id] = new frontier(startPoint, direction);

    twig = new branch[1];
    twig[id] = new branch(fr[id].location, fr[id].thickness, id, 0);

    map = new PVector[1];
    map[0] = new PVector(id, twig[id].location.length - 1);

    while(!growth) {
      int growthSum = 0;
      for(id = 0; id < fr.length; id++) {
        fr[id].update(BranchLocationFactor);
        if(!fr[id].finished) {
          twig[id].location = (PVector[]) append(twig[id].location, new PVector(fr[id].location.x, fr[id].location.y));
          twig[id].thickness = (float[]) append(twig[id].thickness, fr[id].thickness);
          map = (PVector[]) append(map, new PVector(id, twig[id].location.length - 1));

          if (random(0, 1) < BranchLengthFactor) { // control length of one branch
            fr[id].thickness *= 0.65;
            twig[id].thickness[twig[id].thickness.length - 1] = fr[id].thickness;
            if( fr[id].thickness > BranchLocationFactor) { // control the number of the locations on all branches, i.e., treeSize.
              fr = (frontier[]) append(fr, new frontier(fr[id]));
              twig = (branch[]) append(twig, new branch(fr[id].location, fr[id].thickness, id, twig[id].location.length - 1));
              int _id = id;
              if(_id != 0)  for(int _i = 0; _i < 2; _i++)  twig[twig.length - 1].baseIndex[_i] = concat(twig[twig.length - 1].baseIndex[_i], twig[_id].baseIndex[_i]);
            }
          } // if (random(0, 1) < 0.2)
        } else growthSum += 1;
      }
      if(growthSum == fr.length) {
        dtheta = new float[twig.length];
        treeSize = map.length;
        growth = true;
      }
    } // while(!growth)

    ArrayList<Float> _candList = new ArrayList<Float>();
    float[] _candfloat = new float[twig.length];
    for(int i = 0; i < twig.length; i++) {
      _candfloat[i] = (float)twig[i].location.length;
      _candList.add(_candfloat[i]);
    }
    candidateIndex[0] = 0;
    twig[0].isCandidate = true;
    twig[0].dTheta = new float[twig[0].location.length];
    _candfloat[0] = -1.0;
    _candList.set(0, -1.0);
    for(int i = 1; i < candNum; i++) {
      float _temp = max(_candfloat);
      candidateIndex[i] = _candList.indexOf(_temp);
      twig[candidateIndex[i]].isCandidate = true;
      twig[candidateIndex[i]].dTheta = new float[twig[candidateIndex[i]].location.length];
      _candfloat[candidateIndex[i]] = -1.0;
      _candList.set(candidateIndex[i], -1.0);
    }
//    println(candidateIndex);

    amplitude[0] = random(0.006, 0.012);
    phaseFactor[0] = random(0.6, 1.2);
    freq = random(0.5, 0.8);
    period = 1 / freq;
    for(int i = 1; i < candNum; i++) {
      amplitude[i] = amplitude[i-1] * random(0.9, 1.4);
      phaseFactor[i] = phaseFactor[i-1] * random(0.9, 1.4);
    }
  }

  void swing() {
    for(int i = 0; i < candNum; i++) {
      int _num = twig[candidateIndex[i]].location.length;
      for(int j = 0; j < _num; j++) {
        twig[candidateIndex[i]].dTheta[j] = amplitude[i] * dt * TWO_PI * freq * cos(TWO_PI * freq * time - phaseFactor[i] * PI * (float)j / (float)_num);
      }
    }

    for(int id = 0; id < twig.length; id++) {
      if(twig[id].isCandidate) {
        for(int _id = 1; _id < twig[id].location.length; _id++) {
          twig[id].branchRotate(_id, twig[id].dTheta[_id], twig[id].location[0]);
        }
      }

      for(int j = 0; j < twig[id].baseIndex[0].length; j++) {
        if(!twig[twig[id].baseIndex[0][j]].isCandidate | id == 0) continue;
        else {
          for(int k = (id == 0) ? 1 : 0; k < twig[id].location.length; k++) {
            twig[id].branchRotate(k, twig[twig[id].baseIndex[0][j]].dTheta[twig[id].baseIndex[1][j]], twig[twig[id].baseIndex[0][j]].location[0]);
          }
        }
      }
    } // for(int id = 0; id < twig.length; id++)

    time += dt;
    if(time >= period) time -= period;
  }
}
*/