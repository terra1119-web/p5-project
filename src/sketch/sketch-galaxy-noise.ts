'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class SketchTest extends Sketch {
	// property
	theShader: p5.Shader
	sourceGraphics: p5.Graphics
	shaderGraphics: p5.Graphics
	ballsCount: number
	balls: Ball[]

	constructor() {
		super({})
		// initialize
		this.ballsCount = 45
		this.balls = []
	}

	setup(): void {
		super.setup()

		const vert = `
			attribute vec3 aPosition;
			attribute vec2 aTexCoord;
			varying vec2 vTexCoord;

			void main() {
				vTexCoord = aTexCoord;
				vec4 positionVec4 = vec4(aPosition, 1.0);
				positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
				gl_Position = positionVec4;
			}
		`

		// noprotect
		const frag = `
			precision highp float;

			varying vec2 vTexCoord;
			uniform vec2 u_resolution;
			const float WIDTH = ${this.p.width}.0;
			const float HEIGHT = ${this.p.height}.0;
			uniform vec3 balls[${this.ballsCount}];
			uniform float lifespan[${this.ballsCount}];
			uniform float mouseX;
			uniform float mouseY;
			uniform float u_time;

			vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

			float snoise(vec2 v){
				const vec4 C = vec4(0.211324865405187, 0.366025403784439,
								-0.577350269189626, 0.024390243902439);
				vec2 i  = floor(v + dot(v, C.yy) );
				vec2 x0 = v -   i + dot(i, C.xx);
				vec2 i1;
				i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
				vec4 x12 = x0.xyxy + C.xxzz;
				x12.xy -= i1;
				i = mod(i, 289.0);
				vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
				+ i.x + vec3(0.0, i1.x, 1.0 ));
				vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
					dot(x12.zw,x12.zw)), 0.0);
				m = m*m ;
				m = m*m ;
				vec3 x = 2.0 * fract(p * C.www) - 1.0;
				vec3 h = abs(x) - 0.5;
				vec3 ox = floor(x + 0.5);
				vec3 a0 = x - ox;
				m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
				vec3 g;
				g.x  = a0.x  * x0.x  + h.x  * x0.y;
				g.yz = a0.yz * x12.xz + h.yz * x12.yw;
				return 130.0 * dot(m, g);
			}

			float random2d(vec2 coord){
				return fract(tan(dot(coord.xy, vec2(12.9898, 72.233))) * 43758.5453);
			}

			void main() {
				vec2 coord = vTexCoord.xy / u_resolution.xy;
				float x = vTexCoord.x * WIDTH;
				float y = vTexCoord.y * HEIGHT;
				float v = 0.0;
				vec3 color = vec3(0.0);
				coord += snoise(coord + u_time * 0.2 + snoise(coord * 2.0 + u_time * 0.1 + snoise(coord * snoise(coord * 10.0 + u_time * 0.5) * 0.1)) * 0.05) * 0.1;
				coord += snoise(coord * 4.0 + u_time * 0.1 + snoise(coord * 4.0 + u_time + snoise(coord * snoise(coord * 5.0 + u_time * 0.44) * 0.1)) * 0.1) * 0.1;
				coord += snoise(coord * 2.0 + u_time * 0.1 + snoise(coord * 1.0 - u_time * 0.1 + snoise(coord * snoise(coord * 15.0 + u_time * 0.2) * 0.1)) * 0.02) * 0.1;
				coord += snoise(coord * 3.0 - u_time * 0.4 - snoise(coord * 1.0 - u_time * 0.5 + snoise(coord * snoise(coord * 15.0 + u_time * 1.2) * 0.1)) * 0.02) * 0.1;

				color.x += snoise(coord - u_time * 0.3 + 0.55) * 0.2 + 0.2;
				color.y += snoise(coord - u_time * 0.3) * 0.3 + 0.3;
				color.z += snoise(coord - u_time * 0.3 - 0.1) * 0.5 + 0.5;
				color += snoise(coord + snoise(coord + u_time * 0.5) * 0.5 + snoise(coord * 10.0 + u_time) * 0.02) * 0.2;
				color += snoise(coord + snoise(coord + 0.5 - u_time * 0.1) * 0.5 + snoise(coord * 7.0 - u_time) * 0.02) * 0.2;
				color += snoise(coord + snoise(coord + 1.5 + u_time * 0.3) * 0.5 + snoise(coord * 5.0 + u_time) * 0.02) * 0.2;
				color += snoise(coord + snoise(coord * 4.0 + 0.9 - u_time * 0.3) * 0.1 + snoise(coord * 5.0 + u_time + 1.5) * 0.02) * 0.2;
				color += snoise(coord + snoise(coord * 2.0 + 1.9 - u_time * 0.3) * 0.1 + snoise(coord * 5.0 + u_time + 5.5) * 0.02) * 0.2;
				gl_FragColor = vec4(color, 1.0);
			}
		`

		this.p.pixelDensity(1)
		this.sourceGraphics = this.p.createGraphics(this.p.width, this.p.height)
		this.shaderGraphics = this.p.createGraphics(
			this.p.width,
			this.p.height,
			this.p.WEBGL
		)
		this.sourceGraphics.background(0)

		this.theShader = this.shaderGraphics.createShader(vert, frag)

		for (let i = 0; i < this.ballsCount; i++) {
			this.balls.push(new Ball(this.p))
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		const dataBalls = []
		const lifespan = []
		for (const ball of this.balls) {
			ball.update()
			dataBalls.push(ball.position.x, ball.position.y, ball.rad)
			lifespan.push(ball.lifespan)
		}
		this.p.background(0)
		this.sourceGraphics.background(0)

		this.shaderGraphics.shader(this.theShader)
		this.theShader.setUniform('u_resolution', [
			this.p.width / this.p.width,
			this.p.height / this.p.height
		])
		this.theShader.setUniform('u_time', this.p.millis() * 0.0005)
		this.theShader.setUniform('u_tex', this.sourceGraphics)
		this.theShader.setUniform('balls', dataBalls)
		this.theShader.setUniform('lifespan', lifespan)

		this.shaderGraphics.rect(
			-this.p.width / 2,
			-this.p.height / 2,
			this.p.width,
			this.p.height
		)
		this.p.blendMode(this.p.ADD)
		this.p.image(this.sourceGraphics, 0, 0)
		this.p.image(this.shaderGraphics, 0, 0)
		this.p.blendMode(this.p.BLEND)
	}
}

class Ball {
	p: p5
	rad: number
	position: p5.Vector
	velocity: p5.Vector
	acc: p5.Vector
	lifespan: number
	lifespanSpeed: number
	dir: number

	constructor(p: p5) {
		this.p = p
		this.rad = this.p.random(1)
		this.position = new p5.Vector(
			this.p.random(this.p.width),
			this.p.random(this.p.height)
		)
		this.velocity = new p5.Vector(
			this.p.random(-1, 1),
			this.p.random(-1, 1)
		)
		this.acc = new p5.Vector(this.p.random(-5, 5), this.p.random(-5, 5))
		this.lifespan = this.p.random(500)
		this.lifespanSpeed = this.p.random(2)
		this.dir = 0
	}

	update() {
		this.lifespan -= this.lifespanSpeed
		if (this.lifespan <= 0.0) {
			this.position = new p5.Vector(
				this.p.random(this.p.width),
				this.p.random(this.p.height)
			)
			this.lifespan = this.p.random(500)
		}

		this.position.add(this.velocity)
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
