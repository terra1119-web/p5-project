(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{11:function(s,t,i){"use strict";i.r(t);var e=i(15);let h,a;let r=0;let d=1;class n extends e.a{setup(s){super.setup(),s.pixelDensity(s.displayDensity()),s.width<s.height?(h=.25*s.width,a=.089*s.width):(h=.25*s.height,a=.089*s.height),s.rectMode(s.CENTER),s.noFill(),s.colorMode(s.HSB,255,255,255,255)}draw(s){super.draw(),s.background(0),s.rotate(-r/5*.002);for(let t=0;t<100;t++)s.stroke(255,s.map(t,60,100,255,0)),s.push(),s.translate(0,0,-a*t+r),s.rotate(s.PI/60*t),this.drawFigure(s),s.pop();r+=5*d,r>100*a?d=-1:r<0&&(d=1)}drawFigure(s){s.beginShape();for(let t=0;t<3;t++){const i=h*s.cos(s.TWO_PI/3*t),e=h*s.sin(s.TWO_PI/3*t);s.vertex(i,e)}s.endShape(s.CLOSE)}}t.default=function(){new n("WEBGL",!1).init()}},15:function(s,t,i){"use strict";i.d(t,"a",(function(){return r}));var e=i(16),h=i.n(e),a=i(0);class r{constructor(s="P2D",t=!0){this.renderer=s,this.use2D=t,this.sketch,this.s,this.w=window.innerWidth,this.h=window.innerHeight,this.alpha=0,this.graphic=null,this.canvas,this.fadeFlag=!1,this.startFade=this.startFade.bind(this),this.dispose=this.dispose.bind(this)}setup(){const s="WEBGL"===this.renderer?this.s.WEBGL:this.s.P2D;this.s.createCanvas(this.w,this.h,s),this.graphic=this.s.createGraphics(this.w,this.h),this.graphic.hide(),window.addEventListener("fade",this.startFade,!1)}draw(){"WEBGL"===this.renderer&&this.use2D&&this.s.translate(-this.s.width/2,-this.s.height/2,0),this.fadeFlag&&(this.graphic.clear(),this.graphic.fill(0,this.alpha),this.graphic.rect(0,0,this.graphic.width,this.graphic.height),this.alpha+=2,this.alpha>a.a.ALPHA_MAX&&this.dispose())}preload(){}mousePressed(){}keyTyped(s){32!==s.keyCode||this.fadeFlag||this.startFade()}keyPressed(){}doubleClicked(){}init(){this.sketch=s=>{this.s=s,this.s.preload=()=>this.preload(this.s),this.s.setup=()=>this.setup(this.s),this.s.draw=()=>this.draw(this.s),this.s.mousePressed=()=>this.mousePressed(this.s),this.s.keyTyped=()=>this.keyTyped(this.s),this.s.keyPressed=()=>this.keyPressed(this.s),this.s.doubleClicked=()=>this.doubleClicked(this.s)},this.canvas=new h.a(this.sketch,"canvas")}startFade(){this.graphic.show(),this.fadeFlag=!0}dispose(){this.graphic.remove(),this.graphic=null,this.s.remove(),this.s=null,this.sketch=null,this.canvas=null;const s=new Event("finish");window.dispatchEvent(s),window.removeEventListener("fade",this.startFade,!1)}get getSketch(){return this.s}}}}]);