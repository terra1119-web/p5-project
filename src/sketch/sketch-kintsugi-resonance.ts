'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

/**
 * Adobe クールモダンな配色パターン（サイバーカラー）
 * - パターン1: 高彩度ディープブルー(#1B03A3), ネオンピンク(#FF1493), ネオングリーン(#00FF00)
 * - パターン2: 鮮やかブルー(#0088FF), 明るいピンク(#FF00AA), スレートグレー(#708090)
 * - パターン3: ネイビー(#082567), ネオンレッドピンク(#FA245F), ハイイエロー(#FFFF66)
 */
const CYBER_PALETTE = {
	navy: [8, 37, 103], // #082567
	deepBlue: [27, 3, 163], // #1B03A3
	electricBlue: [0, 136, 255], // #0088FF
	neonPink: [255, 0, 170], // #FF00AA
	redPink: [250, 36, 95], // #FA245F
	deepPink: [255, 20, 147], // #FF1493
	cyberYellow: [255, 255, 102], // #FFFF66
	slateGray: [112, 128, 144], // #708090
	neonGreen: [0, 255, 136], // #00FF88
}

interface Shard {
	id: number
	// Rest state (unbroken crystal)
	restPos: p5.Vector
	restRot: p5.Vector
	// Local vertices relative to shard center (4 vertices: 3 outer face, 1 inner apex)
	localVerts: [p5.Vector, p5.Vector, p5.Vector, p5.Vector]
	// Current physics state
	pos: p5.Vector
	vel: p5.Vector
	rot: p5.Vector
	rotVel: p5.Vector
	// Drift destination when silent
	driftPos: p5.Vector
	driftRotVel: p5.Vector
	// Visual properties
	outerColor: [number, number, number]
	innerColor: [number, number, number]
	cohesion: number // 0 (dispersed) to 1 (repaired)
}

interface Seam {
	shardA: number
	shardB: number
	// Midpoint on shard A and shard B
	offsetA: p5.Vector
	offsetB: p5.Vector
	localEdgeA1: p5.Vector
	localEdgeA2: p5.Vector
	localEdgeB1: p5.Vector
	localEdgeB2: p5.Vector
}

interface Spark {
	pos: p5.Vector
	vel: p5.Vector
	life: number
	maxLife: number
	size: number
	color: [number, number, number]
}

interface Shockwave {
	radius: number
	maxRadius: number
	alpha: number
	rotX: number
	rotY: number
	color: [number, number, number]
}

class SketchKintsugiResonance extends Sketch {
	private shards: Shard[] = []
	private seams: Seam[] = []
	private sparks: Spark[] = []
	private shockwaves: Shockwave[] = []

	private smoothVolume: number = 0
	private smoothBass: number = 0
	private smoothMid: number = 0
	private smoothTreble: number = 0
	private noiseFloor: number = 0.04

	private rotX: number = 0
	private rotY: number = 0
	private targetRotX: number = 0
	private targetRotY: number = 0

	private camDist: number = 550
	private lastPulseTime: number = 0

	constructor() {
		super({
			renderer: 'WEBGL',
			use2D: false,
			useMic: true,
		})
	}

	setup(): void {
		if (this.p && (this.p as any).pixelDensity) {
			this.p.pixelDensity(1)
		}
		super.setup()
		if (!this.p) return

		this.p.colorMode(this.p.RGB)
		this.buildGeometry()
	}

	/**
	 * 測地二十面体（Geodesic Icosahedron）をベースに、
	 * サイバークリスタルの3D四面体シャード群を構築
	 */
	private buildGeometry(): void {
		const p = this.p
		const phi = (1 + Math.sqrt(5)) / 2
		const radius = 170

		// 二十面体の基本12頂点
		const rawVerts: p5.Vector[] = [
			p.createVector(-1, phi, 0),
			p.createVector(1, phi, 0),
			p.createVector(-1, -phi, 0),
			p.createVector(1, -phi, 0),
			p.createVector(0, -1, phi),
			p.createVector(0, 1, phi),
			p.createVector(0, -1, -phi),
			p.createVector(0, 1, -phi),
			p.createVector(phi, 0, -1),
			p.createVector(phi, 0, 1),
			p.createVector(-phi, 0, -1),
			p.createVector(-phi, 0, 1),
		].map(v => v.normalize().mult(radius))

		// 二十面体の20面インデックス
		const rawFaces: [number, number, number][] = [
			[0, 11, 5],
			[0, 5, 1],
			[0, 1, 7],
			[0, 7, 10],
			[0, 10, 11],
			[1, 5, 9],
			[5, 11, 4],
			[11, 10, 2],
			[10, 7, 6],
			[7, 1, 8],
			[3, 9, 4],
			[3, 4, 2],
			[3, 2, 6],
			[3, 6, 8],
			[3, 8, 9],
			[4, 9, 5],
			[2, 4, 11],
			[6, 2, 10],
			[8, 6, 7],
			[9, 8, 1],
		]

		// 各面を4分割（細分化）して80個の多面体シャードを生成
		const subFaces: [p5.Vector, p5.Vector, p5.Vector][] = []
		const midCache = new Map<string, p5.Vector>()

		const getMidpoint = (v1: p5.Vector, v2: p5.Vector): p5.Vector => {
			const key =
				v1.x < v2.x || (v1.x === v2.x && v1.y < v2.y)
					? `${v1.x.toFixed(2)},${v1.y.toFixed(2)},${v1.z.toFixed(2)}-${v2.x.toFixed(2)},${v2.y.toFixed(2)},${v2.z.toFixed(2)}`
					: `${v2.x.toFixed(2)},${v2.y.toFixed(2)},${v2.z.toFixed(2)}-${v1.x.toFixed(2)},${v1.y.toFixed(2)},${v1.z.toFixed(2)}`

			if (midCache.has(key)) return midCache.get(key)!.copy()

			const mid = p5.Vector.add(v1, v2).mult(0.5).normalize().mult(radius)
			midCache.set(key, mid)
			return mid.copy()
		}

		for (const [i1, i2, i3] of rawFaces) {
			const v1 = rawVerts[i1]
			const v2 = rawVerts[i2]
			const v3 = rawVerts[i3]

			const a = getMidpoint(v1, v2)
			const b = getMidpoint(v2, v3)
			const c = getMidpoint(v3, v1)

			subFaces.push([v1.copy(), a.copy(), c.copy()])
			subFaces.push([v2.copy(), b.copy(), a.copy()])
			subFaces.push([v3.copy(), c.copy(), b.copy()])
			subFaces.push([a.copy(), b.copy(), c.copy()])
		}

		// 各サブフェイスから立体の四面体シャードを構築
		this.shards = subFaces.map(([v1, v2, v3], id) => {
			// 外面三角形の中心
			const faceCenter = p5.Vector.add(v1, v2).add(v3).mult(1 / 3)
			// シャードの重心（中心に向けて少し内側へ）
			const restPos = faceCenter.copy().mult(0.72)
			// 内側の頂点（結晶の核に近い位置）
			const innerApex = faceCenter.copy().mult(0.18)

			// シャード重心からのローカル座標に変換
			const l1 = p5.Vector.sub(v1, restPos)
			const l2 = p5.Vector.sub(v2, restPos)
			const l3 = p5.Vector.sub(v3, restPos)
			const l4 = p5.Vector.sub(innerApex, restPos)

			// ひび割れ目標位置（外側への法線方向）:
			// 「控えめにひび割れる程度（微小音: 約12〜20px）から、広がりを少し拡大（大音量: 約95〜140px）」
			const outwardDir = restPos.copy().normalize()
			const crackDistance = p.random(95, 135)
			const crackOffset = outwardDir.copy().mult(crackDistance).add(
				p.createVector(
					p.random(-18, 18),
					p.random(-18, 18),
					p.random(-18, 18)
				)
			)
			const driftPos = p5.Vector.add(restPos, crackOffset)

			// 初期状態は完全な未破損結晶からスタート
			const pos = restPos.copy()

			// サイバー配色: 外面はスレートグレー(#708090)＋ネイビー(#082567)のダークサイバー鉱石
			const outerR = Math.round(p.random(10, 18))
			const outerG = Math.round(p.random(18, 30))
			const outerB = Math.round(p.random(38, 56))

			// 内面は割れた断面の高彩度ディープブルー(#1B03A3)
			const innerR = Math.round(p.random(20, 32))
			const innerG = Math.round(p.random(5, 18))
			const innerB = Math.round(p.random(130, 175))

			return {
				id,
				restPos,
				restRot: p.createVector(0, 0, 0),
				localVerts: [l1, l2, l3, l4],
				pos,
				vel: p.createVector(0, 0, 0),
				rot: p.createVector(0, 0, 0),
				rotVel: p.createVector(0, 0, 0),
				driftPos,
				driftRotVel: p.createVector(
					p.random(-0.015, 0.015),
					p.random(-0.015, 0.015),
					p.random(-0.015, 0.015)
				),
				outerColor: [outerR, outerG, outerB],
				innerColor: [innerR, innerG, innerB],
				cohesion: 1,
			}
		})

		// 隣接するシャード同士のサーフェスシーム（金継ぎ接合エッジ）を検出
		this.seams = []
		for (let i = 0; i < this.shards.length; i++) {
			for (let j = i + 1; j < this.shards.length; j++) {
				const sA = this.shards[i]
				const sB = this.shards[j]
				const distRest = p5.Vector.dist(sA.restPos, sB.restPos)
				if (distRest < 72) {
					// 両シャードの外面頂点同士で最も接近しているペア（共有エッジ）を探索
					const outerA = [
						p5.Vector.add(sA.restPos, sA.localVerts[0]),
						p5.Vector.add(sA.restPos, sA.localVerts[1]),
						p5.Vector.add(sA.restPos, sA.localVerts[2]),
					]
					const outerB = [
						p5.Vector.add(sB.restPos, sB.localVerts[0]),
						p5.Vector.add(sB.restPos, sB.localVerts[1]),
						p5.Vector.add(sB.restPos, sB.localVerts[2]),
					]

					// 共有されている2頂点を検出
					const sharedVerts: p5.Vector[] = []
					for (const va of outerA) {
						for (const vb of outerB) {
							if (p5.Vector.dist(va, vb) < 4.0) {
								sharedVerts.push(p5.Vector.add(va, vb).mult(0.5))
								break
							}
						}
					}

					if (sharedVerts.length >= 2) {
						// エッジの中点と両端点を表面（半径約161）に少し押し出す
						const p1 = sharedVerts[0].copy().normalize().mult(161)
						const p2 = sharedVerts[1].copy().normalize().mult(161)
						const edgeCenter = p5.Vector.add(p1, p2).mult(0.5).normalize().mult(161.5)

						this.seams.push({
							shardA: i,
							shardB: j,
							offsetA: p5.Vector.sub(edgeCenter, sA.restPos),
							offsetB: p5.Vector.sub(edgeCenter, sB.restPos),
							localEdgeA1: p5.Vector.sub(p1, sA.restPos),
							localEdgeA2: p5.Vector.sub(p2, sA.restPos),
							localEdgeB1: p5.Vector.sub(p1, sB.restPos),
							localEdgeB2: p5.Vector.sub(p2, sB.restPos),
						})
					}
				}
			}
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return
		const p = this.p

		// 1. 音響データの高感度取得（全音域：声・手拍子・指パッチン・打楽器・環境音を公平に検出）
		const rawVol = this.getVolume()
		const bands = this.getVolumeEachBand()
		// bands = [treble, highMid, mid, lowMid, bass] (0〜255)

		const eTreble = (bands[0] || 0) / 255
		const eHighMid = (bands[1] || 0) / 255
		const eMid = (bands[2] || 0) / 255
		const eLowMid = (bands[3] || 0) / 255
		const eBass = (bands[4] || 0) / 255

		const peakBand = Math.max(eTreble, eHighMid, eMid, eLowMid, eBass)
		const avgBand = (eTreble + eHighMid + eMid + eLowMid + eBass) / 5
		const currentSound = Math.max(rawVol * 2.4, peakBand * 0.8, avgBand * 0.9)

		// バックグラウンドノイズフロアの動的適応（静かな部屋では閾値を下げ、騒がしい部屋では適応）
		if (currentSound < this.noiseFloor * 1.5) {
			this.noiseFloor = p.lerp(this.noiseFloor, currentSound, 0.02)
		}
		this.noiseFloor = p.constrain(this.noiseFloor, 0.015, 0.12)

		// ノイズフロアを超えた意図的な音響エネルギーのみを増幅
		const soundMargin = currentSound - (this.noiseFloor + 0.018)
		let targetVol = 0
		if (soundMargin > 0) {
			targetVol = p.constrain(p.map(soundMargin, 0, 0.28, 0, 1.5), 0, 1.8)
		}

		// 音が鳴った時は高速アタック（0.36）、音が止んだ時は素早く静寂へ（0.12）
		const lerpRate = targetVol > this.smoothVolume ? 0.36 : 0.12
		this.smoothVolume = p.lerp(this.smoothVolume, targetVol, lerpRate)

		this.smoothBass = p.lerp(this.smoothBass, targetVol > 0 ? eBass : 0, 0.18)
		this.smoothMid = p.lerp(this.smoothMid, targetVol > 0 ? eMid : 0, 0.18)
		this.smoothTreble = p.lerp(this.smoothTreble, targetVol > 0 ? eTreble : 0, 0.22)

		// 2. サイバー空間の背景（ダークネイビーの宇宙）
		p.background(6, 10, 26)

		// マウス操作によるカメラのインタラクティブ回転
		if (p.mouseIsPressed) {
			this.targetRotY += (p.mouseX - p.pmouseX) * 0.008
			this.targetRotX -= (p.mouseY - p.pmouseY) * 0.008
		}
		this.targetRotY += 0.004

		this.rotX = p.lerp(this.rotX, this.targetRotX, 0.08)
		this.rotY = p.lerp(this.rotY, this.targetRotY, 0.08)

		// バス音による画面の微小シェイク
		const shakeX =
			this.smoothBass > 0.45 ? p.random(-5, 5) * this.smoothBass : 0
		const shakeY =
			this.smoothBass > 0.45 ? p.random(-5, 5) * this.smoothBass : 0

		p.camera(
			shakeX,
			shakeY,
			this.camDist,
			0,
			0,
			0,
			0,
			1,
			0
		)

		// 3. サイバーライティング設定
		p.ambientLight(30, 42, 75)

		// 中心核からの動的サイバーライト（静寂時は淡いピンク、音響時はハイイエローへ発光）
		const lightLerp = p.constrain(this.smoothVolume, 0, 1)
		const coreLightR = p.lerp(CYBER_PALETTE.neonPink[0], CYBER_PALETTE.cyberYellow[0], lightLerp)
		const coreLightG = p.lerp(CYBER_PALETTE.neonPink[1], CYBER_PALETTE.cyberYellow[1], lightLerp)
		const coreLightB = p.lerp(CYBER_PALETTE.neonPink[2], CYBER_PALETTE.cyberYellow[2], lightLerp)
		const lightIntensity = p.constrain(this.smoothVolume * 260 + 80, 80, 255)
		p.pointLight(
			(coreLightR * lightIntensity) / 255,
			(coreLightG * lightIntensity) / 255,
			(coreLightB * lightIntensity) / 255,
			0,
			0,
			0
		)

		// 右上からのエレクトリックブルー(#0088FF) リムライト
		p.directionalLight(CYBER_PALETTE.electricBlue[0] * 0.95, CYBER_PALETTE.electricBlue[1] * 0.95, CYBER_PALETTE.electricBlue[2] * 0.95, 0.7, 0.8, -0.6)
		// 左下からのネオンレッドピンク(#FA245F) フィルライト
		p.directionalLight(CYBER_PALETTE.redPink[0] * 0.75, CYBER_PALETTE.redPink[1] * 0.75, CYBER_PALETTE.redPink[2] * 0.75, -0.7, -0.6, 0.5)
		// 正面上方からのスレートグレー(#708090) ハイライト
		p.directionalLight(CYBER_PALETTE.slateGray[0] * 0.8, CYBER_PALETTE.slateGray[1] * 0.8, CYBER_PALETTE.slateGray[2] * 0.8, 0, 0.4, -1.0)

		p.push()
		p.rotateX(this.rotX)
		p.rotateY(this.rotY)

		// 輪郭をやわらかくぼやかす多層サイバーオーラ（光のベール）
		this.drawAtmosphereHalo()

		// 4. シャードの物理シミュレーションと描画
		this.updateAndDrawShards()

		// 5. サイバー金継ぎの光脈（ネオンピンク & ハイイエロー）の描画
		this.drawKintsugiSeams()

		// 6. サイバー粒子スパーク
		this.updateAndDrawSparks()

		// 7. 音響ショックウェーブリング
		this.updateAndDrawShockwaves()

		// 8. 中心核（サイバーレゾナンス・コア）の描画
		this.drawResonanceCore()

		p.pop()

		// バスや大音量時にサイバーショックウェーブをトリガー
		const now = p.millis()
		if (
			this.smoothBass > 0.55 &&
			this.smoothVolume > 0.28 &&
			now - this.lastPulseTime > 260
		) {
			const waveColor =
				this.shockwaves.length % 2 === 0
					? (CYBER_PALETTE.neonPink as [number, number, number])
					: (CYBER_PALETTE.electricBlue as [number, number, number])

			this.shockwaves.push({
				radius: 25,
				maxRadius: p.random(360, 520),
				alpha: 250,
				rotX: p.random(-Math.PI, Math.PI),
				rotY: p.random(-Math.PI, Math.PI),
				color: waveColor,
			})
			this.lastPulseTime = now
		}
	}

	/**
	 * 各シャードの物理演算と描画
	 * 「音に反応して割れる」:
	 *   - 静寂時: 元の完全な結晶へ磁気的に引き戻され、一体化して穏やかに回転
	 *   - 音響時: 音量・周波数エネルギーに応じて外側へ激しく飛散・破裂（Shatter）
	 * 「図形の輪郭をぼやかす」:
	 *   - ハードなワイヤーフレームや境界線(stroke)を完全排除
	 *   - 各ファセットを光沢感ある半透明ガラス質で描写し、外郭にぼやけた光のフォグシェルを重ねることで境界をソフトにブレンド
	 */
	private updateAndDrawShards(): void {
		const p = this.p
		const vol = this.smoothVolume
		const isShattering = vol > 0.035

		for (const shard of this.shards) {
			if (isShattering) {
				// 「控えめにひび割れる程度（vol小: ~12〜20px）から、少し広げた割れ目（vol大: ~95〜140px）」
				const crackScale = p.constrain(p.map(vol, 0.035, 0.75, 0.14, 1.05), 0.10, 1.15)
				const shatterTarget = p5.Vector.lerp(shard.restPos, shard.driftPos, crackScale)
				const blastForce = p5.Vector.sub(shatterTarget, shard.pos).mult(0.18)
				shard.vel.add(blastForce)
				shard.vel.mult(0.82)

				// ひび割れに伴う微小な傾き・揺らぎ
				shard.rot.add(shard.driftRotVel.copy().mult(vol * 2.2))
			} else {
				// 静寂時: 元の位置へスムーズに閉じる（ひび割れが閉合）
				const returnForce = p5.Vector.sub(shard.restPos, shard.pos).mult(0.16)
				shard.vel.add(returnForce)
				shard.vel.mult(0.80)

				// 静止角度 (0,0,0) へと綺麗にアライメント
				shard.rot.x = p.lerp(shard.rot.x, 0, 0.18)
				shard.rot.y = p.lerp(shard.rot.y, 0, 0.18)
				shard.rot.z = p.lerp(shard.rot.z, 0, 0.18)
				shard.rotVel.mult(0.80)
			}

			shard.pos.add(shard.vel)

			const distFromRest = p5.Vector.dist(shard.pos, shard.restPos)
			const targetCohesion = p.constrain(
				p.map(distFromRest, 2, 60, 1, 0),
				0,
				1
			)
			shard.cohesion = p.lerp(shard.cohesion, targetCohesion, 0.20)

			// シャードの描画
			p.push()
			p.translate(shard.pos.x, shard.pos.y, shard.pos.z)
			p.rotateX(shard.rot.x)
			p.rotateY(shard.rot.y)
			p.rotateZ(shard.rot.z)

			const [v1, v2, v3, vApex] = shard.localVerts

			// 輪郭をぼかすため、ハードな境界線（stroke）は完全に排除
			p.noStroke()

			// 外面（スレートグレー〜ネイビーブルーの光沢感あるサイバー鉱石）
			// 静寂時は深みのあるスレートネイビー、割れると光を反射して輝く
			const baseR = p.lerp(28, CYBER_PALETTE.slateGray[0], 0.4)
			const baseG = p.lerp(46, CYBER_PALETTE.slateGray[1], 0.4)
			const baseB = p.lerp(105, CYBER_PALETTE.electricBlue[2], 0.35)

			p.specularMaterial(baseR, baseG, baseB)
			p.shininess(30)
			p.fill(baseR, baseG, baseB, 225)

			p.beginShape(p.TRIANGLES)
			p.vertex(v1.x, v1.y, v1.z)
			p.vertex(v2.x, v2.y, v2.z)
			p.vertex(v3.x, v3.y, v3.z)
			p.endShape()

			// 内面3面（割れた断面: 割れると深部からネオンピンクとエレクトリックブルーのエネルギーが露出）
			const glowEnergy = p.constrain(vol * 1.8 + (1 - shard.cohesion) * 0.9, 0, 1)
			const inR = p.lerp(CYBER_PALETTE.deepBlue[0], CYBER_PALETTE.neonPink[0], glowEnergy * 0.8)
			const inG = p.lerp(CYBER_PALETTE.deepBlue[1], CYBER_PALETTE.redPink[1], glowEnergy * 0.5)
			const inB = p.lerp(CYBER_PALETTE.deepBlue[2], CYBER_PALETTE.electricBlue[2], glowEnergy)

			p.specularMaterial(inR, inG, inB)
			p.shininess(45)
			p.fill(inR, inG, inB, 210)

			p.beginShape(p.TRIANGLES)
			// 断面 1
			p.vertex(v1.x, v1.y, v1.z)
			p.vertex(v2.x, v2.y, v2.z)
			p.vertex(vApex.x, vApex.y, vApex.z)
			// 断面 2
			p.vertex(v2.x, v2.y, v2.z)
			p.vertex(v3.x, v3.y, v3.z)
			p.vertex(vApex.x, vApex.y, vApex.z)
			// 断面 3
			p.vertex(v3.x, v3.y, v3.z)
			p.vertex(v1.x, v1.y, v1.z)
			p.vertex(vApex.x, vApex.y, vApex.z)
			p.endShape()

			// 輪郭を柔らかくぼかすマルチパス金継ぎグローライン（Additive Blend）
			// ハードな境界線を排除し、ソフトな光のベールで輪郭を包み込む
			const edgeAlpha = p.constrain((0.35 + (1 - shard.cohesion) * 0.65 + vol * 0.9) * 255, 60, 255)

			const gl = (p as any)._renderer?.GL || (p as any).drawingContext
			if (gl && gl.enable && gl.blendFunc && gl.depthMask) {
				gl.enable(gl.BLEND)
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
				gl.depthMask(false)
			}

			// 1. 最外層ネオンピンクのソフトグロー（太さ 10.0, 透過で輪郭を柔らかくぼかす）
			p.stroke(CYBER_PALETTE.neonPink[0], CYBER_PALETTE.neonPink[1], CYBER_PALETTE.neonPink[2], edgeAlpha * 0.28)
			p.strokeWeight(10.0)
			p.line(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
			p.line(v2.x, v2.y, v2.z, v3.x, v3.y, v3.z)
			p.line(v3.x, v3.y, v3.z, v1.x, v1.y, v1.z)

			// 2. 中間マゼンタ・エレクトリックブルー光（太さ 4.2）
			p.stroke(CYBER_PALETTE.redPink[0], CYBER_PALETTE.redPink[1], CYBER_PALETTE.redPink[2], edgeAlpha * 0.68)
			p.strokeWeight(4.2)
			p.line(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
			p.line(v2.x, v2.y, v2.z, v3.x, v3.y, v3.z)
			p.line(v3.x, v3.y, v3.z, v1.x, v1.y, v1.z)

			// 3. コアのサイバーイエロー超高輝度レーザー（太さ 1.4）
			p.stroke(CYBER_PALETTE.cyberYellow[0], CYBER_PALETTE.cyberYellow[1], CYBER_PALETTE.cyberYellow[2], edgeAlpha * 0.95)
			p.strokeWeight(1.4)
			p.line(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
			p.line(v2.x, v2.y, v2.z, v3.x, v3.y, v3.z)
			p.line(v3.x, v3.y, v3.z, v1.x, v1.y, v1.z)

			if (gl && gl.blendFunc && gl.depthMask) {
				gl.depthMask(true)
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
			}

			p.pop()
		}
	}

	/**
	 * サイバー金継ぎ（Cyber Kintsugi）の破片間光脈フィラメント
	 * 音響によって割れた破片同士を繋ぎ止める超高輝度レーザーとスパーク
	 */
	private drawKintsugiSeams(): void {
		const p = this.p
		const vol = this.smoothVolume
		if (vol < 0.035) return

		const gl = (p as any)._renderer?.GL || (p as any).drawingContext
		if (gl && gl.blendFunc && gl.depthMask) {
			gl.enable(gl.BLEND)
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
			gl.depthMask(false)
		}

		for (const seam of this.seams) {
			const sA = this.shards[seam.shardA]
			const sB = this.shards[seam.shardB]
			const sepA = p5.Vector.dist(sA.pos, sA.restPos)
			const sepB = p5.Vector.dist(sB.pos, sB.restPos)
			const crackAmount = (sepA + sepB) * 0.5

			// 破片がひび割れ離れている時（crackAmount > 2.5px）に架橋レーザーとスパークが発光
			if (crackAmount > 2.5) {
				const stretch = p.constrain(p.map(crackAmount, 2.5, 95, 0.35, 1.0), 0.3, 1.0)
				const intensity = stretch * (vol * 2.2 + 0.6)
				const alpha = p.constrain(intensity * 255, 30, 255)

				// 1. 最外郭のぼやけたネオンピンクオーラ
				p.stroke(CYBER_PALETTE.neonPink[0], CYBER_PALETTE.neonPink[1], CYBER_PALETTE.neonPink[2], alpha * 0.32)
				p.strokeWeight(10.0)
				p.line(sA.pos.x, sA.pos.y, sA.pos.z, sB.pos.x, sB.pos.y, sB.pos.z)

				// 2. 中間マゼンタ光
				p.stroke(CYBER_PALETTE.redPink[0], CYBER_PALETTE.redPink[1], CYBER_PALETTE.redPink[2], alpha * 0.72)
				p.strokeWeight(4.2)
				p.line(sA.pos.x, sA.pos.y, sA.pos.z, sB.pos.x, sB.pos.y, sB.pos.z)

				// 3. コアのサイバーイエロー超高輝度レーザー
				p.stroke(CYBER_PALETTE.cyberYellow[0], CYBER_PALETTE.cyberYellow[1], CYBER_PALETTE.cyberYellow[2], alpha * 0.95)
				p.strokeWeight(1.5)
				p.line(sA.pos.x, sA.pos.y, sA.pos.z, sB.pos.x, sB.pos.y, sB.pos.z)

				// 割れ目からの光粒子スパーク
				if (crackAmount > 10 && p.random() < this.smoothTreble * 0.75) {
					this.emitSpark(
						p5.Vector.lerp(sA.pos, sB.pos, p.random()),
						p5.Vector.sub(sB.pos, sA.pos).normalize()
					)
				}
			}
		}

		if (gl && gl.blendFunc && gl.depthMask) {
			gl.depthMask(true)
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		}
	}

	/**
	 * 輪郭をやわらかくぼやかす多層フォグオーラ（ボリューメトリック・ネビュラグロー）
	 * ※ depthMask(false) により後続のシャード描画を遮蔽しない
	 */
	private drawAtmosphereHalo(): void {
		const p = this.p
		const vol = this.smoothVolume
		const breathing = Math.sin(p.frameCount * 0.03) * 8
		const pulse = vol * 50 + breathing

		const gl = (p as any)._renderer?.GL || (p as any).drawingContext
		if (gl && gl.blendFunc && gl.depthMask) {
			gl.enable(gl.BLEND)
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
			gl.depthMask(false)
		}

		p.push()
		p.noStroke()

		// レイヤー1: 背景に溶け込ませる柔らかなディープブルーオーラ
		p.fill(CYBER_PALETTE.deepBlue[0], CYBER_PALETTE.deepBlue[1], CYBER_PALETTE.deepBlue[2], 24)
		p.sphere(300 + pulse, 10, 8)

		// レイヤー2: エレクトリックブルーの霧
		p.fill(CYBER_PALETTE.electricBlue[0], CYBER_PALETTE.electricBlue[1], CYBER_PALETTE.electricBlue[2], 18 + vol * 25)
		p.sphere(240 + pulse * 0.7, 10, 8)

		// レイヤー3: ネオンピンクのコアオーラ
		p.fill(CYBER_PALETTE.neonPink[0], CYBER_PALETTE.neonPink[1], CYBER_PALETTE.neonPink[2], 14 + vol * 30)
		p.sphere(190 + pulse * 0.5, 10, 8)

		p.pop()

		if (gl && gl.blendFunc && gl.depthMask) {
			gl.depthMask(true)
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		}
	}

	/**
	 * 接合部から飛び交うサイバーパーティクル（イエロー、ピンク、ブルー、グリーン）
	 */
	private emitSpark(spawnPos: p5.Vector, dir: p5.Vector): void {
		const p = this.p
		if (this.sparks.length > 260) return

		const spread = p.createVector(
			p.random(-2.0, 2.0),
			p.random(-2.0, 2.0),
			p.random(-2.0, 2.0)
		)
		const vel = p5.Vector.add(dir.mult(p.random(-1.2, 1.2)), spread).mult(
			p.random(1.6, 4.5)
		)

		const colorPick = p.random()
		let sparkColor: [number, number, number]
		if (colorPick < 0.45) {
			sparkColor = CYBER_PALETTE.cyberYellow as [number, number, number]
		} else if (colorPick < 0.75) {
			sparkColor = CYBER_PALETTE.neonPink as [number, number, number]
		} else if (colorPick < 0.9) {
			sparkColor = CYBER_PALETTE.electricBlue as [number, number, number]
		} else {
			sparkColor = CYBER_PALETTE.neonGreen as [number, number, number]
		}

		this.sparks.push({
			pos: spawnPos.copy(),
			vel,
			life: 0,
			maxLife: p.random(25, 55),
			size: p.random(2.0, 4.8),
			color: sparkColor,
		})
	}

	private updateAndDrawSparks(): void {
		const p = this.p
		const gl = (p as any)._renderer?.GL || (p as any).drawingContext
		if (gl && gl.blendFunc) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
		}

		for (let i = this.sparks.length - 1; i >= 0; i--) {
			const s = this.sparks[i]
			s.life++
			if (s.life >= s.maxLife) {
				this.sparks.splice(i, 1)
				continue
			}

			s.vel.mult(0.95)
			s.vel.y -= 0.05
			s.pos.add(s.vel)

			const progress = s.life / s.maxLife
			const alpha = p.map(progress, 0, 0.2, 0, 255) * (1 - progress)

			p.push()
			p.translate(s.pos.x, s.pos.y, s.pos.z)
			p.noStroke()
			p.fill(s.color[0], s.color[1], s.color[2], alpha)
			p.sphere(s.size * (1 - progress * 0.4), 4, 3)
			p.pop()
		}

		if (gl && gl.blendFunc) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		}
	}

	/**
	 * 音響ショックウェーブ（多角形サイバーリング）
	 */
	private updateAndDrawShockwaves(): void {
		const p = this.p
		p.noFill()

		const gl = (p as any)._renderer?.GL || (p as any).drawingContext
		if (gl && gl.blendFunc) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
		}

		for (let i = this.shockwaves.length - 1; i >= 0; i--) {
			const sw = this.shockwaves[i]
			sw.radius += 11.0
			sw.alpha *= 0.94

			if (sw.radius > sw.maxRadius || sw.alpha < 2) {
				this.shockwaves.splice(i, 1)
				continue
			}

			p.push()
			p.rotateX(sw.rotX)
			p.rotateY(sw.rotY)
			p.stroke(sw.color[0], sw.color[1], sw.color[2], sw.alpha)
			p.strokeWeight(p.map(sw.radius, 25, sw.maxRadius, 3.0, 0.8))

			p.beginShape()
			const segments = 28
			for (let j = 0; j <= segments; j++) {
				const angle = (j / segments) * Math.PI * 2
				const r = sw.radius * (1 + 0.04 * p.sin(angle * 8))
				p.vertex(p.cos(angle) * r, p.sin(angle) * r, 0)
			}
			p.endShape()

			p.pop()
		}

		if (gl && gl.blendFunc) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		}
	}

	/**
	 * 中心核（サイバーレゾナンス・コア）
	 */
	private drawResonanceCore(): void {
		const p = this.p
		const vol = this.smoothVolume
		const pulse = p.sin(p.frameCount * 0.08) * 5

		const coreRadius = p.map(vol, 0, 1, 16, 42) + pulse
		const alpha = p.constrain(p.map(vol, 0, 1, 150, 255), 120, 255)

		const gl = (p as any)._renderer?.GL || (p as any).drawingContext
		if (gl && gl.blendFunc) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
		}

		p.push()
		p.noStroke()

		// 内側の高輝度サイバーイエローコア
		p.fill(CYBER_PALETTE.cyberYellow[0], CYBER_PALETTE.cyberYellow[1], CYBER_PALETTE.cyberYellow[2], alpha)
		p.sphere(coreRadius * 0.55, 10, 10)

		// 外側のネオンピンクオーラ
		p.fill(CYBER_PALETTE.neonPink[0], CYBER_PALETTE.neonPink[1], CYBER_PALETTE.neonPink[2], alpha * 0.55)
		p.sphere(coreRadius, 12, 12)

		p.pop()

		if (gl && gl.blendFunc) {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		}
	}

	/**
	 * マウスクリック時の処理
	 * ※ クリックでの音量インパルスは排除し、Web Audioの再開のみを行う
	 */
	mousePressed(): void {
		super.mousePressed()
		if (this.p) {
			this.p.userStartAudio()
			const ctx = (this.p as any).getAudioContext?.()
			if (ctx && ctx.state === 'suspended') {
				ctx.resume().catch(() => {})
			}
		}
	}
}

export default function (): void {
	const sketch = new SketchKintsugiResonance()
	sketch.init()
}
