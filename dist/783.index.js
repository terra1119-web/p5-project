"use strict";(self.webpackChunkp5_project=self.webpackChunkp5_project||[]).push([[783],{910:(s,t,i)=>{i.d(t,{Z:()=>a});var h=i(35),e=i.n(h),p=i(851),r=i(906);class a{constructor({renderer:s="P2D",use2D:t=!0,useMic:i=!1}){this.renderer=s,this.use2D=t,this.p,this.w=window.innerWidth,this.h=window.innerHeight,this.alpha=0,this.graphic=null,this.canvas,this.fadeFlag=!1,this.startFade=this.startFade.bind(this),this.dispose=this.dispose.bind(this),this.useMic=i,this.mic,this.meter}setup(){const s="WEBGL"===this.renderer?this.p.WEBGL:this.p.P2D;this.p.createCanvas(this.w,this.h,s),this.graphic=this.p.createGraphics(this.w,this.h),this.graphic.hide(),window.addEventListener("fade",this.startFade,!1),this.useMic&&(this.meter=new p.Yu,this.mic=new p.Xv,this.mic.open(),this.mic.connect(this.meter))}draw(){"WEBGL"===this.renderer&&this.use2D&&this.p.translate(-this.p.width/2,-this.p.height/2,0),this.fadeFlag&&(this.graphic.clear(),this.graphic.fill(0,this.alpha),this.graphic.rect(0,0,this.graphic.width,this.graphic.height),this.alpha+=2,this.alpha>r.s.ALPHA_MAX&&this.dispose())}preload(){}mousePressed(){}keyTyped(){32!==this.p.keyCode||this.fadeFlag||this.startFade()}keyPressed(){}doubleClicked(){this.p.saveCanvas("sketch","png")}init(){this.canvas=new(e())((s=>{this.p=s,this.p.preload=()=>this.preload(),this.p.setup=()=>this.setup(),this.p.draw=()=>this.draw(),this.p.mousePressed=()=>this.mousePressed(),this.p.keyTyped=()=>this.keyTyped(),this.p.keyPressed=()=>this.keyPressed(),this.p.doubleClicked=()=>this.doubleClicked()}),"canvas")}startFade(){this.graphic.show(),this.fadeFlag=!0}dispose(){this.graphic.remove(),this.graphic=null,this.p.remove(),this.p=null,this.sketch=null,this.canvas=null,this.useMic&&this.mic.close(),this.mic=null,window.removeEventListener("fade",this.startFade,!1);const s=new Event("finish");window.dispatchEvent(s)}get getSketch(){return this.p}get getVolume(){return this.meter.getValue()}}},783:(s,t,i)=>{i.r(t),i.d(t,{default:()=>p});var h=i(910);class e extends h.Z{constructor(){super({useMic:!0}),this.a=0,this.r=0}setup(){super.setup(),this.p.background(0),this.p.stroke(255),this.p.noFill(),this.p.strokeWeight(.05)}draw(){if(super.draw(),!this.p)return;this.p.background(0),this.p.translate(.5*this.p.width,.5*this.p.height);for(let s=-3;s<=3;s++)this.p.stroke(255,255,255,100),this.conchoid(this.a+s),this.conchoid(this.a+s);this.a=100*this.p.sin(this.p.frameCount/360);for(let s=-3;s<=3;s++)this.conchoid(this.a+s);const s=this.p.map(this.getVolume,-50,0,-30,100);this.a=100*this.p.sin(s/360)}conchoid(s){this.p.beginShape();for(let t=0;t<360;t++){const i=this.p.width/60*(1/this.p.cos(t)+s*this.p.cos(t))*this.p.cos(t),h=this.p.width/60*(1/this.p.cos(t)+s*this.p.cos(t))*this.p.sin(t);this.p.vertex(h,i)}this.p.endShape(),this.p.rotate(this.r),this.r++}}function p(){(new e).init()}}}]);