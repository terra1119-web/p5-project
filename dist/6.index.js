(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{15:function(s,t,e){"use strict";e.d(t,"a",(function(){return r}));var i=e(16),h=e.n(i),a=e(0);class r{constructor(s="P2D",t=!0){this.renderer=s,this.use2D=t,this.sketch,this.s,this.w=window.innerWidth,this.h=window.innerHeight,this.alpha=0,this.graphic=null,this.canvas,this.fadeFlag=!1,this.startFade=this.startFade.bind(this),this.dispose=this.dispose.bind(this)}setup(){const s="WEBGL"===this.renderer?this.s.WEBGL:this.s.P2D;this.s.createCanvas(this.w,this.h,s),this.graphic=this.s.createGraphics(this.w,this.h),this.graphic.hide(),window.addEventListener("fade",this.startFade,!1)}draw(){"WEBGL"===this.renderer&&this.use2D&&this.s.translate(-this.s.width/2,-this.s.height/2,0),this.fadeFlag&&(this.graphic.clear(),this.graphic.fill(0,this.alpha),this.graphic.rect(0,0,this.graphic.width,this.graphic.height),this.alpha+=2,this.alpha>a.a.ALPHA_MAX&&this.dispose())}preload(){}mousePressed(){}keyTyped(s){32!==s.keyCode||this.fadeFlag||this.startFade()}keyPressed(){}doubleClicked(){}init(){this.sketch=s=>{this.s=s,this.s.preload=()=>this.preload(this.s),this.s.setup=()=>this.setup(this.s),this.s.draw=()=>this.draw(this.s),this.s.mousePressed=()=>this.mousePressed(this.s),this.s.keyTyped=()=>this.keyTyped(this.s),this.s.keyPressed=()=>this.keyPressed(this.s),this.s.doubleClicked=()=>this.doubleClicked(this.s)},this.canvas=new h.a(this.sketch,"canvas")}startFade(){this.graphic.show(),this.fadeFlag=!0}dispose(){this.graphic.remove(),this.graphic=null,this.s.remove(),this.s=null,this.sketch=null,this.canvas=null;const s=new Event("finish");window.dispatchEvent(s),window.removeEventListener("fade",this.startFade,!1)}get getSketch(){return this.s}}},6:function(s,t,e){"use strict";e.r(t);var i=e(15);let h=0,a=0,r=0,d=0,n=5;const o="Hallo Welt, ich kann gerade nicht... vielleicht morgen?";let c=0,l=0,p=0;class u extends i.a{setup(s){super.setup(),s.background(0),s.smooth(),s.cursor(s.CROSS),h=s.random(s.width),a=s.random(s.height),s.textAlign(s.LEFT),s.fill(255),r=s.random(s.width),d=s.random(s.height)}draw(s){super.draw(),p++,p>10&&(this.initPoint(s),p=0),s.fill(s.random(255));let t=s.dist(h,a,r,d);s.textFont("Georgia"),s.textSize(3+t/2);const e=o.charAt(l);if(n=s.textWidth(e),t>n){const t=s.atan2(d-a,r-h);s.push(),s.translate(h,a),s.rotate(t+s.random(c)),s.text(e,0,0),s.pop(),l++,l>o.length-1&&(l=0),h+=s.cos(t)*n,a+=s.sin(t)*n}}mousePressed(s){super.mousePressed(),h=s.mouseX,a=s.mouseY}keyTyped(s){super.keyTyped(s),"s"!=s.key&&"S"!=s.key||s.save("P_2_3_3_01.png")}keyPressed(s){super.keyPressed(),s.keyCode!=s.DELETE&&s.keyCode!=s.BACKSPACE||s.background(255),s.keyCode==s.UP_ARROW&&(c+=.1),s.keyCode==s.DOWN_ARROW&&(c-=.1)}doubleClicked(s){super.doubleClicked(),s.remove()}initPoint(s){r=s.random(s.width),d=s.random(s.height)}}t.default=function(){(new u).init()}}}]);