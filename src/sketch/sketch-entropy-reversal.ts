'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class EntropyReversalSketch extends Sketch {
	gl: WebGLRenderingContext | null
	glProgram: WebGLProgram | null
	posBuffer: WebGLBuffer | null
	uResolutionLoc: WebGLUniformLocation | null
	uTimeLoc: WebGLUniformLocation | null

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: false,
		})
		this.gl = null
		this.glProgram = null
		this.posBuffer = null
		this.uResolutionLoc = null
		this.uTimeLoc = null
	}

	setup(): void {
		if (this.p && (this.p as any).pixelDensity) {
			this.p.pixelDensity(1) // レイマーチングの負荷を下げるため1に固定
		}
		super.setup()
		this.p.noStroke()

		try {
			const dc = (this.p as any).drawingContext as WebGLRenderingContext
			this.gl = dc
			const gl = dc

			const vsSrc = `#version 100
				attribute vec2 aPosition;
				varying vec2 vTexCoord;
				void main() {
					vTexCoord = aPosition * 0.5 + 0.5;
					gl_Position = vec4(aPosition, 0.0, 1.0);
				}
			`

			const fsSrc = `#version 100
				precision highp float;
				varying vec2 vTexCoord;
				uniform vec2 uResolution;
				uniform float uTime;

				// ===== ノイズ関数群 =====
				float hash(float n) { return fract(sin(n)*43758.5453); }
				float noise(in vec3 x) {
					vec3 p = floor(x);
					vec3 f = fract(x);
					f = f*f*(3.0-2.0*f);
					float n = p.x + p.y*57.0 + 113.0*p.z;
					float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
										mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
									mix(mix( hash(n+113.0), hash(n+114.0),f.x),
										mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
					return res;
				}

				// ===== SDF (Signed Distance Field) 関数群 =====
				float sdBox(vec3 p, vec3 b) {
					vec3 q = abs(p) - b;
					return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
				}

				float sdCross(vec3 p) {
					float da = sdBox(p.xyz, vec3(1e5, 1.0, 1.0));
					float db = sdBox(p.yzx, vec3(1.0, 1e5, 1.0));
					float dc = sdBox(p.zxy, vec3(1.0, 1.0, 1e5));
					return min(da,min(db,dc));
				}

				mat2 rot(float a) {
					float s = sin(a), c = cos(a);
					return mat2(c, -s, s, c);
				}

				// ===== 空間全体のマップ関数 =====
				float map(vec3 p, float breakAmt) {
					// 常にゆっくり回転させる
					p.xy *= rot(uTime * 0.1);
					p.yz *= rot(uTime * 0.15);
					
					// ノイズとディスプレイスメントによる「崩壊」の表現
					vec3 pNoise = p * 1.5;
					vec3 noiseVec = vec3(
						noise(pNoise + vec3(uTime, 0.0, 0.0)),
						noise(pNoise + vec3(0.0, uTime, 0.0)),
						noise(pNoise + vec3(0.0, 0.0, uTime))
					) * 2.0 - 1.0;
					
					float fineNoise = noise(p * 8.0 + uTime * 2.0) * 2.0 - 1.0;
					
					// 元の座標をノイズで歪める
					vec3 dispP = p + (noiseVec * 1.5 + fineNoise * 0.5) * breakAmt * 2.5;
					
					// 崩壊が進むにつれて遠心力のように外側に飛散させる
					float distToCenter = length(p);
					dispP -= normalize(p + 0.001) * (distToCenter * breakAmt * 3.0);
					
					// ベース形状 (Menger Sponge のようなフラクタル構築)
					float d = sdBox(dispP, vec3(1.5));
					
					float s = 1.0;
					for(int i = 0; i < 3; i++){
						vec3 a = mod(dispP * s, 2.0) - 1.0;
						s *= 3.0;
						vec3 r = 1.0 - 3.0 * abs(a);
						float c = sdCross(r) / s;
						d = max(d, c);
					}
					
					return d;
				}

				float globalGlow = 0.0; // 蓄積光彩

				// ===== レイマーチング =====
				float raycast(vec3 ro, vec3 rd, float breakAmt) {
					float t = 0.0;
					for(int i = 0; i < 80; i++) {
						vec3 p = ro + rd * t;
						float d = map(p, breakAmt);
						
						// 光彩の加算
						globalGlow += 0.03 / (0.01 + abs(d));

						// オブジェクトに衝突、または描画範囲外になったら終了
						if(d < 0.001 || t > 20.0) break;
						
						// ディスプレイスメントで距離関数が不正確になるアーティファクトを防ぐためステップ幅を縮小
						t += d * (1.0 - breakAmt * 0.5); 
					}
					return t;
				}

				// ===== 法線計算 =====
				vec3 calcNormal(vec3 p, float breakAmt) {
					vec2 e = vec2(0.002, 0.0);
					return normalize(vec3(
						map(p+e.xyy, breakAmt) - map(p-e.xyy, breakAmt),
						map(p+e.yxy, breakAmt) - map(p-e.yxy, breakAmt),
						map(p+e.yyx, breakAmt) - map(p-e.yyx, breakAmt)
					));
				}

				void main() {
					vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);

					// アニメーション周期 (14秒で1ループ)
					float cycleDuration = 14.0;
					float cycle = mod(uTime, cycleDuration) / cycleDuration; 
					
					// 0.0〜0.5で徐々に崩壊し、0.5〜1.0で巻き戻る
					float breakAmt = abs(cycle * 2.0 - 1.0);
					breakAmt = 1.0 - breakAmt;
					breakAmt = smoothstep(0.0, 1.0, breakAmt);
					breakAmt = pow(breakAmt, 1.5); // 加速度的に崩壊

					// カメラ位置
					vec3 ro = vec3(0.0, 0.0, 5.0); 
					
					// 崩壊が激しくなるとカメラも少し揺らす
					ro.x += (noise(vec3(uTime*4.0, 0.0, 0.0)) - 0.5) * breakAmt * 0.5;
					ro.y += (noise(vec3(0.0, uTime*4.0, 0.0)) - 0.5) * breakAmt * 0.5;

					vec3 ta = vec3(0.0, 0.0, 0.0); // 注視点
					vec3 cw = normalize(ta - ro);
					vec3 cu = normalize(cross(cw, vec3(0.0, 1.0, 0.0)));
					vec3 cv = normalize(cross(cu, cw));
					vec3 rd = normalize(uv.x * cu + uv.y * cv + 1.2 * cw); // 視野角調整

					float t = raycast(ro, rd, breakAmt);
					vec3 col = vec3(0.04, 0.05, 0.08); // デフォルトの暗い宇宙のような背景

					if(t < 20.0) {
						vec3 p = ro + rd * t;
						vec3 n = calcNormal(p, breakAmt);
						
						// ライティング
						vec3 light1 = normalize(vec3(1.0, 2.0, 2.0));
						vec3 light2 = normalize(vec3(-2.0, -1.0, -2.0));
						float diff1 = clamp(dot(n, light1), 0.0, 1.0);
						float diff2 = clamp(dot(n, light2), 0.0, 1.0);
						float amb = 0.5 + 0.5 * n.y;
						
						// オブジェクトのベースカラー
						// 時間経過と位置で色が変化
						vec3 objColor = 0.5 + 0.3 * cos(uTime*0.4 + p.xyx * 0.5 + vec3(0.0, 2.0, 4.0));
						
						// 崩壊時には赤やマゼンタ系のエネルギー色に白熱する
						vec3 hotColor = vec3(1.0, 0.2, 0.8) + vec3(1.0, 0.5, 0.2);
						objColor = mix(objColor, hotColor, breakAmt * 0.8);

						col = objColor * ((diff1 + diff2)*0.5 * 0.8 + amb * 0.2);
						
						// リムライト (カメラに対する角度に基づく反射)
						float rim = 1.0 - clamp(dot(n, -rd), 0.0, 1.0);
						col += pow(rim, 3.0) * vec3(0.2, 0.7, 1.0) * (1.0 - breakAmt*0.5);
					}
					
					// 蓄積Glowの加算
					float glowForce = globalGlow * 0.008;
					vec3 glowColor = mix(vec3(0.1, 0.6, 1.0), vec3(1.0, 0.1, 0.4), breakAmt);
					col += glowColor * glowForce;
					
					// トーンマッピング (ACES filmic)
					col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
					
					// ガンマ補正
					col = pow(col, vec3(1.0 / 2.2));

					gl_FragColor = vec4(col, 1.0);
				}
			`

			const vs = gl.createShader(gl.VERTEX_SHADER)!
			const fs = gl.createShader(gl.FRAGMENT_SHADER)!

			gl.shaderSource(vs, vsSrc)
			gl.shaderSource(fs, fsSrc)

			gl.compileShader(vs)
			if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
				console.error('Vertex Shader Error:', gl.getShaderInfoLog(vs))
			}

			gl.compileShader(fs)
			if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
				console.error('Fragment Shader Error:', gl.getShaderInfoLog(fs))
			}

			const prog = gl.createProgram()!
			gl.attachShader(prog, vs)
			gl.attachShader(prog, fs)
			gl.bindAttribLocation(prog, 0, 'aPosition')
			gl.linkProgram(prog)

			if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
				 console.error('Shader Link Error:', gl.getProgramInfoLog(prog))
			}

			this.glProgram = prog

			this.posBuffer = gl.createBuffer()
			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
			const verts = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0])
			gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

			this.uResolutionLoc = gl.getUniformLocation(prog, 'uResolution')
			this.uTimeLoc = gl.getUniformLocation(prog, 'uTime')

		} catch (e) {
			console.warn('WebGL setup failed', e)
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		if (this.gl && this.glProgram && this.posBuffer) {
			const gl = this.gl
			const prog = this.glProgram

			gl.useProgram(prog)
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer)
			gl.enableVertexAttribArray(0)
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

			if (this.uResolutionLoc) {
				gl.uniform2f(this.uResolutionLoc, this.p.width, this.p.height)
			}
			if (this.uTimeLoc) {
				// スケッチロードからの経過時間を秒で渡す
				gl.uniform1f(this.uTimeLoc, this.p.millis() / 1000.0)
			}

			gl.drawArrays(gl.TRIANGLES, 0, 3)

			gl.disableVertexAttribArray(0)
			gl.bindBuffer(gl.ARRAY_BUFFER, null)
		}
	}
}

export default function (): void {
	const sketch: EntropyReversalSketch = new EntropyReversalSketch()
	sketch.init()
}
