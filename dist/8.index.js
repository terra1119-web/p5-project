(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{15:function(t,s,i){"use strict";i.d(s,"a",(function(){return r}));var e=i(16),h=i.n(e),a=i(0);class r{constructor(t="P2D",s=!0){this.renderer=t,this.use2D=s,this.sketch,this.s,this.w=window.innerWidth,this.h=window.innerHeight,this.alpha=0,this.graphic=null,this.canvas,this.fadeFlag=!1,this.startFade=this.startFade.bind(this),this.dispose=this.dispose.bind(this)}setup(){const t="WEBGL"===this.renderer?this.s.WEBGL:this.s.P2D;this.s.createCanvas(this.w,this.h,t),this.graphic=this.s.createGraphics(this.w,this.h),this.graphic.hide(),window.addEventListener("fade",this.startFade,!1)}draw(){"WEBGL"===this.renderer&&this.use2D&&this.s.translate(-this.s.width/2,-this.s.height/2,0),this.fadeFlag&&(this.graphic.clear(),this.graphic.fill(0,this.alpha),this.graphic.rect(0,0,this.graphic.width,this.graphic.height),this.alpha+=2,this.alpha>a.a.ALPHA_MAX&&this.dispose())}preload(){}mousePressed(){}keyTyped(t){32!==t.keyCode||this.fadeFlag||this.startFade()}keyPressed(){}doubleClicked(){}init(){this.sketch=t=>{this.s=t,this.s.preload=()=>this.preload(this.s),this.s.setup=()=>this.setup(this.s),this.s.draw=()=>this.draw(this.s),this.s.mousePressed=()=>this.mousePressed(this.s),this.s.keyTyped=()=>this.keyTyped(this.s),this.s.keyPressed=()=>this.keyPressed(this.s),this.s.doubleClicked=()=>this.doubleClicked(this.s)},this.canvas=new h.a(this.sketch,"canvas")}startFade(){this.graphic.show(),this.fadeFlag=!0}dispose(){this.graphic.remove(),this.graphic=null,this.s.remove(),this.s=null,this.sketch=null,this.canvas=null;const t=new Event("finish");window.dispatchEvent(t),window.removeEventListener("fade",this.startFade,!1)}get getSketch(){return this.s}}},8:function(t,s,i){"use strict";i.r(s);var e=i(16),h=i.n(e),a=i(15);let r,o,c=100,n=[];class d{constructor(t,s,i){this.mass=1,this.location=t.createVector(t.random(t.width),t.random(t.height)),this.velocity=t.createVector(0,0),this.accelaration=t.createVector(s,i),this.img,this.s=t}update(){this.velocity.add(this.accelaration),this.velocity.mult(1-o),this.location.add(this.velocity),this.accelaration.set(0,0)}display(t){t.image(this.img,this.location.x,this.location.y)}attract(t,s){const i=new h.a.Vector.sub(t.location,this.location);let e=i.mag();e=s.constrain(e,4,1e3),i.normalize();const a=r*this.mass*t.mass/s.pow(e,2);return i.mult(a),i}applyForce(t){const s=new h.a.Vector.div(t,this.mass);this.accelaration.add(s)}wallThrough(t){this.location.x>t.width&&(this.location.x=0),this.location.x<0&&(this.location.x=t.width),this.location.y>t.height&&(this.location.y=0),this.location.y<0&&(this.location.y=t.height)}createParticleImage(t){this.img=t.createImage(400,400);const s=t.pow(10,1.9),i=t.random(100,255),e=t.random(100,255),h=t.random(100,255);this.img.loadPixels();for(let a=0;a<400;a++)for(let r=0;r<400;r++){const o=(t.sq(200-r)+t.sq(200-a))/s,c=t.color(i/o,e/o,h/o);this.img.set(r,a,c)}return this.img.updatePixels(),this.img}}class l extends a.a{setup(t){super.setup(),t.blendMode(t.ADD),t.imageMode(t.CENTER),t.frameRate(60),t.background(0);for(let s=0;s<c;s++)n[s]=new d(t),n[s].createParticleImage(t);r=10,o=.01}draw(t){super.draw(),t.clear(),t.background(0),t.noStroke();for(let i=0;i<c;i++)for(let e=0;e<c;e++)if(i!=e){var s=n[i].attract(n[e],t);n[i].applyForce(s)}for(let s=0;s<c;s++)n[s].update(),n[s].wallThrough(t),n[s].display(t)}mouseClicked(t){n.push(new d(t.mouseX,t.mouseY,0,0)),n[c].createParticleImage(t),c++}}s.default=function(){(new l).init()}}}]);