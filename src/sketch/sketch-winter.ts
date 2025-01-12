'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

// p5.RendererGL.prototype._initContext = function () {
// 	try {
// 		this.drawingContext =
// 			this.canvas.getContext('webgl2', this._pInst._glAttributes) ||
// 			this.canvas.getContext(
// 				'experimental-webgl',
// 				this._pInst._glAttributes
// 			)
// 		if (this.drawingContext === null) {
// 			throw new Error('Error creating webgl context')
// 		} else {
// 			const gl = this.drawingContext
// 			gl.enable(gl.DEPTH_TEST)
// 			gl.depthFunc(gl.LEQUAL)
// 			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
// 			this._viewport = this.drawingContext.getParameter(
// 				this.drawingContext.VIEWPORT
// 			)
// 		}
// 	} catch (er) {
// 		throw er
// 	}
// }

class SketchTest extends Sketch {
	// property
	theShader: p5.Shader

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: false
		})
		// initialize
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(1)

		const vert = `#version 300 es
			in vec3 aPosition;
			void main() { gl_Position=vec4(aPosition*2.-1., 1.0); }
		`

		const frag = `#version 300 es
			precision highp float;
			out vec4 O;
			uniform float time;
			uniform vec2 resolution;
			#define FC gl_FragCoord.xy
			#define R resolution
			#define T time
			#define MN min(R.x,R.y)
			float rnd(vec2 p) {
				p=fract(p*vec2(12.9898,78.233));
				p+=dot(p,p+34.56);
				return fract(p.x*p.y);
			}
			float sf(vec2 p, float f, float r) {
				float k=sin(f)*.2; mat2 m=mat2(cos(.5*r*T-vec4(0,11,33,0)));
				p*=44.*m;
				p=vec2(atan(p.x,p.y),length(p));
				p.y+=(.2-k)*floor(cos(p.x*6.)*15.);
				p.y+=(.1-k)*floor(cos(p.x*30.)*10.);
				p.y-=fract(cos(p.x*30.)*2.);
				p=vec2(p.y*cos(p.x),p.y*sin(p.x));
				float d=length(p), t=.0;
				if(d<.8) t=1.;
				return t;
			}
			vec3 snowflake(vec2 p, float f, float r){
				return vec3(
					sf(p-4./MN,f,r),
					sf(p,f,r),
					sf(p+4./MN,f,r)
				);
			}
			vec3 snow(vec2 p, float r){
				vec2 id=floor(p*.5+.5);
				p.y+=T*(1.+rnd(id.xx))*.5;
				p=mod(p+.5,2.)-1.;
				p.x+=.1*cos(dot(p,vec2(3))+T*rnd(id.xx));
				return snowflake(p,1.,r*.5)
					+snowflake(p+vec2(.2,-.1),3.,r)
					+snowflake(p+vec2(-.2,.4),9.,r*2.)
					+snowflake(p+vec2(-.2,-.25),6.,r*1.2)
					+snowflake(p+vec2(.5,-.5),5.,-r*1.3)*2.;

			}
			void main() {
				vec2 uv=(FC-.5*R)/MN;
				vec3 col=vec3(0);
				col+=snow(uv*5.,.4);
				col+=snow(uv*4.+vec2(.5,0),.8);
				col+=snow(uv*2.+vec2(.5,0),1.);
				col=mix(col,vec3(.08*rnd(uv)),min(1.,1.2*length(uv-vec2(sin(T)*.125,0))));
				O=vec4(col,1);
			}
		`
		this.theShader = this.p.createShader(vert, frag)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.shader(this.theShader)
		this.theShader.setUniform('resolution', [this.p.width, this.p.height])
		this.theShader.setUniform('time', this.p.millis() / 1000.0)
		this.p.rect(0, 0, this.p.width, this.p.height)
	}

	mousePressed(): void {
		super.mousePressed()
	}

	keyTyped(): void {
		super.keyTyped()
	}

	keyPressed(): void {
		super.keyPressed()
	}

	doubleClicked(): void {
		super.doubleClicked()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
