'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

type parseDataOptions = {
	data: string
	bezierDetail2: number
	bezierDetail3: number
	parseScale: number
	lineSegmentLength: number
}

type mergePointsOptions = {
	threshold: number
	closed: boolean
}

type getSVGContoursOptions = {
	svgData: string
	scaleFactor: number
	bezierDetail2: number
	bezierDetail3: number
	lineSegmentLengthRatio: number
	spacingMinLengthRatio: number
	mergeThresholdRatio: number
}

type evenlySpacingOptions = {
	minLength: number
	closed: boolean
}

class SketchTest extends Sketch {
	// property
	fish: string
	fishCurve: any[]
	fishPaths: any[]
	units: FlowUnit[]
	maxUnitQuantity: number
	baseImg: p5.Graphics
	// bg: any
	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: false
		})
		// initialize
		this.fish =
			'M 0.938 -0.025 Q 0.700 0.191 0.354 0.216 Q 0.131 0.401 -0.154 0.369 Q -0.014 0.291 0.015 0.145 Q -0.125 0.035 -0.388 0.017 Q -0.519 0.038 -0.623 0.113 Q -0.726 0.189 -0.895 0.182 Q -0.729 0.117 -0.729 0.009 Q -0.729 -0.099 -0.912 -0.180 Q -0.654 -0.145 -0.509 -0.074 Q -0.363 -0.003 -0.172 -0.149 Q -0.054 -0.238 0.029 -0.257 Q 0.028 -0.385 -0.097 -0.476 Q 0.188 -0.450 0.378 -0.294 Q 0.709 -0.216 0.938 -0.025'
		this.fishPaths = []
		this.units = []
		this.maxUnitQuantity = 40
	}

	preload(): void {
		super.preload()
	}

	setup(): void {
		super.setup()

		this.p.pixelDensity(1)
		this.baseImg = this.p.createGraphics(this.p.width, this.p.height)
		this.baseImg.noStroke()

		const fishContours = this.getSVGContours({
			svgData: this.fish,
			scaleFactor: 1,
			bezierDetail2: 8,
			bezierDetail3: 5,
			lineSegmentLengthRatio: 1 / 64,
			spacingMinLengthRatio: 1 / 40,
			mergeThresholdRatio: 1 / 100
		})

		this.fishCurve = fishContours[0]

		for (let k = 0; k < 120; k++) {
			this.fishPaths.push(this.createFishPath(k))
		}

		// 工字繋ぎ
		// bg = createGraphics(800, 640)
		// kouji_tsunagi(bg)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.baseImg.background(0, 60)
		for (const u of this.units) {
			u.updateUnit()
			u.drawUnit()
		}
		for (let i = this.units.length - 1; i >= 0; i--) {
			if (!this.units[i].alive) {
				this.units.splice(i, 1)
			}
		}
		if (
			this.units.length < this.maxUnitQuantity &&
			this.p.frameCount % 10 === 0
		) {
			this.units.push(this.createUnit())
		}

		this.p.image(this.baseImg, 0, 0)
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

	createUnit() {
		// サイズと寿命を比例させる
		const fishSize = this.p.random(20, 44)
		return new FlowUnit(this.p, this.baseImg, this.fishPaths, {
			x: this.p.random(0.1, 0.9) * this.p.width,
			y: this.p.random(0.1, 0.9) * this.p.height,
			appearDuration: this.p.floor(this.p.random(60, 180)),
			vanishDuration: this.p.floor(this.p.random(100, 220)),
			life: fishSize * 22,
			velocity: this.p.random(1, 3),
			direction: this.p.random(6.28),
			acceleFactor: this.p.random(0.1, 0.2),
			noiseFactor: this.p.random(0.01, 0.05),
			noiseIndex: this.p.floor(this.p.random(9999)),
			fishSize: fishSize
		})
	}

	createFishPath(c) {
		const startAngle = (this.p.PI / 6) * this.p.sin((c * this.p.TAU) / 60)
		let x = 300 + 20 * this.p.cos(startAngle)
		let y = 20 * this.p.sin(startAngle)
		let _angle = -startAngle * 0.6
		const modifyArray = []
		//beginShape();
		//vertex(x,y);
		modifyArray.push({ x: x, y: y, angle: _angle })
		for (let k = 0; k < 640; k++) {
			x -= this.p.cos(_angle)
			y -= this.p.sin(_angle)
			const factor =
				0.000006 + 0.000002 * this.p.sin((c * this.p.TAU) / 120)
			_angle += factor * k * this.p.sin((c * this.p.TAU) / 60)
			//vertex(x,y);
			modifyArray.push({ x: x, y: y, angle: _angle })
		}

		//const result = [];
		const resultPath = new Path2D()

		for (let i = 0; i < this.fishCurve.length; i++) {
			const v = this.fishCurve[i]
			const n = this.p.floor(320 - v.x * 320)
			const f = this.p.fract(320 - v.x * 320)
			const data1 = modifyArray[n]
			const data2 = modifyArray[n + 1]
			const lerpedX = (1 - f) * data1.x + f * data2.x
			const lerpedY = (1 - f) * data1.y + f * data2.y
			const lerpedAngle = (1 - f) * data1.angle + f * data2.angle
			const w = this.p.createVector(
				lerpedX / 320 + v.y * this.p.cos(lerpedAngle + this.p.PI / 2),
				lerpedY / 320 + v.y * this.p.sin(lerpedAngle + this.p.PI / 2)
			)
			if (i === 0) {
				resultPath.moveTo(w.x, w.y)
			} else {
				resultPath.lineTo(w.x, w.y)
			}
		}
		return resultPath
	}

	parseData(options: parseDataOptions) {
		const {
			data = 'M 0 0',
			bezierDetail2 = 8,
			bezierDetail3 = 5,
			parseScale = 1,
			lineSegmentLength = 1
		} = options
		const cmdData = data.split(' ')
		const result = []
		let subData = []
		for (let i = 0; i < cmdData.length; i++) {
			switch (cmdData[i]) {
				case 'M':
					if (subData.length > 0) result.push(subData.slice())
					subData.length = 0
					subData.push(
						this.p
							.createVector(
								Number(cmdData[i + 1]),
								Number(cmdData[i + 2])
							)
							.mult(parseScale)
					)
					i += 2
					break
				case 'L':
					const p = subData[subData.length - 1]
					const q = this.p
						.createVector(
							Number(cmdData[i + 1]),
							Number(cmdData[i + 2])
						)
						.mult(parseScale)
					const lineLength = q.dist(p)
					for (
						let lengthSum = 0;
						lengthSum < lineLength;
						lengthSum += lineSegmentLength
					) {
						subData.push(
							p5.Vector.lerp(p, q, lengthSum / lineLength)
						)
					}
					subData.push(q)
					i += 2
					break
				case 'Q':
					const p0 = subData[subData.length - 1]
					const a0 = Number(cmdData[i + 1]) * parseScale
					const b0 = Number(cmdData[i + 2]) * parseScale
					const c0 = Number(cmdData[i + 3]) * parseScale
					const d0 = Number(cmdData[i + 4]) * parseScale
					for (let k = 1; k <= bezierDetail2; k++) {
						const t = k / bezierDetail2
						subData.push(
							this.p.createVector(
								(1 - t) * (1 - t) * p0.x +
									2 * t * (1 - t) * a0 +
									t * t * c0,
								(1 - t) * (1 - t) * p0.y +
									2 * t * (1 - t) * b0 +
									t * t * d0
							)
						)
					}
					i += 4
					break
				case 'C':
					const p1 = subData[subData.length - 1]
					const a1 = Number(cmdData[i + 1]) * parseScale
					const b1 = Number(cmdData[i + 2]) * parseScale
					const c1 = Number(cmdData[i + 3]) * parseScale
					const d1 = Number(cmdData[i + 4]) * parseScale
					const e1 = Number(cmdData[i + 5]) * parseScale
					const f1 = Number(cmdData[i + 6]) * parseScale
					for (let k = 1; k <= bezierDetail3; k++) {
						const t = k / bezierDetail3
						subData.push(
							this.p.createVector(
								(1 - t) * (1 - t) * (1 - t) * p1.x +
									3 * t * (1 - t) * (1 - t) * a1 +
									3 * t * t * (1 - t) * c1 +
									t * t * t * e1,
								(1 - t) * (1 - t) * (1 - t) * p1.y +
									3 * t * (1 - t) * (1 - t) * b1 +
									3 * t * t * (1 - t) * d1 +
									t * t * t * f1
							)
						)
					}
					i += 6
					break
				case 'Z':
					// 最初の点を追加するんだけど、subData[0]を直接ぶち込むと
					// 頭とおしりが同じベクトルになってしまうので、
					// copy()を取らないといけないんですね
					// Lでつなぎます。
					const p2 = subData[subData.length - 1]
					const q2 = subData[0].copy()
					const lineLength2 = q2.dist(p2)
					for (
						let lengthSum = 0;
						lengthSum < lineLength2;
						lengthSum += lineSegmentLength
					) {
						subData.push(
							p5.Vector.lerp(p2, q2, lengthSum / lineLength2)
						)
					}
					subData.push(q2)
					//result.push(subData.slice());
					break
			}
		}
		// Mが出てこない場合はパス終了
		result.push(subData.slice())
		return result
	}

	// merging
	// threshold: 非常に近い（というか同じ）点が連続していたら排除する
	mergePoints(points, options: mergePointsOptions) {
		const { threshold = 0.000001, closed = false } = options

		for (let i = points.length - 1; i >= 1; i--) {
			const p = points[i]
			const q = points[i - 1]
			if (p.dist(q) < threshold) {
				//console.log("merge");
				points.splice(i, 1)
			}
		}
		if (closed) {
			// 頭に戻る場合はそれも排除する
			if (points[0].dist(points[points.length - 1]) < threshold) {
				points.pop()
			}
		}
	}

	// closedはすべてに適用される
	mergePointsAll(contours, options) {
		for (let contour of contours) {
			this.mergePoints(contour, options)
		}
	}

	// 等間隔化にもclosed optionを導入したいな
	evenlySpacing(points, options: evenlySpacingOptions) {
		const { minLength = 1, closed = false } = options
		// minLengthより長い長さがある場合に、点を挿入する
		let newPoints = []
		newPoints.push(points[0])

		for (let i = 1; i < points.length; i++) {
			// iとi-1の距離を調べてminより小さければそのままiを入れて終了
			// 大きければ間も含めていくつか点を入れる
			// ここも後ろから入れないとおかしなことになるので注意！！って思ったけど
			// ああそうか、バグの原因それか...このやり方なら問題ないです。
			const d = points[i].dist(points[i - 1])
			if (d < minLength) {
				newPoints.push(points[i])
			} else {
				const m = Math.floor(d / minLength) + 1
				for (let k = 1; k <= m; k++) {
					newPoints.push(
						p5.Vector.lerp(points[i - 1], points[i], k / m)
					)
				}
			}
		}

		// 線の長さの総和を求めると同時に長さの列を取得
		let lengthArray = []
		for (let i = 0; i < newPoints.length - 1; i++) {
			const d = newPoints[i].dist(newPoints[i + 1])
			lengthArray.push(d)
		}

		// minLengthを超えるたびにそれを引く、を繰り返す
		// もしくは？
		// lastPointという概念を用意。最初はnewPoints[0]から始める。
		// localSumが閾値未満であれば新しい点でlastPointをおきかえる
		// 超えた場合はlastPointと新しい点を(localSum-minLength)/distanceでlerpして
		// ??違う、(minLength-(localSum-distance))/distanceか。
		// あるいはlocalSum + distance > minLengthかどうか見るとか。<とか。
		let localSum = 0
		const result = [newPoints[0]]
		const lastPoint = this.p.createVector()
		lastPoint.set(result[0])
		for (let i = 1; i < newPoints.length; i++) {
			const distance = newPoints[i].dist(lastPoint)
			if (localSum + distance < minLength) {
				lastPoint.set(newPoints[i])
				localSum += distance
			} else {
				// オーバーした場合はlerpで該当する点を求める
				const ratio = (minLength - localSum) / distance
				const middlePoint = p5.Vector.lerp(
					lastPoint,
					newPoints[i],
					ratio
				)
				result.push(middlePoint)
				lastPoint.set(middlePoint)
				// localSumを初期化
				localSum = 0
			}
		}

		// closed caseでOKでした。オプション用意するの忘れてた。バカ。

		// pointsをresultで書き換える
		points.length = 0
		for (let i = 0; i < result.length; i++) {
			points.push(result[i])
		}

		// closedの場合はおしりもチェック...？？
		if (closed) {
			const endPoint = points[points.length - 1]
			const beginPoint = points[0]
			const distance = endPoint.dist(beginPoint)
			if (distance > minLength) {
				// たとえば2.1と1の場合は3分割するが1.9と1の場合は2分割する
				const m = this.p.floor(distance / minLength) + 1
				for (let k = 1; k < m; k++) {
					points.push(p5.Vector.lerp(endPoint, beginPoint, k / m))
				}
			}
		}
	}

	evenlySpacingAll(contours, minLength) {
		for (let contour of contours) {
			this.evenlySpacing(contour, minLength)
		}
	}

	// -------------------------------------------------------------------

	// 閉曲線(closed)前提
	getSVGContours(params: getSVGContoursOptions) {
		const {
			svgData = 'M 0 0 L 1 0 L 1 1 L 0 1 Z',
			scaleFactor = 200,
			bezierDetail2 = 8,
			bezierDetail3 = 5,
			lineSegmentLengthRatio = 1 / 64,
			spacingMinLengthRatio = 1 / 40,
			mergeThresholdRatio = 1 / 100
		} = params
		const svgContours = this.parseData({
			data: svgData,
			parseScale: scaleFactor,
			bezierDetail2: bezierDetail2,
			bezierDetail3: bezierDetail3,
			lineSegmentLength: lineSegmentLengthRatio * scaleFactor
		})

		this.mergePointsAll(svgContours, { closed: true })
		this.evenlySpacingAll(svgContours, {
			minLength: spacingMinLengthRatio * scaleFactor,
			closed: true
		})
		this.mergePointsAll(svgContours, {
			threshold: mergeThresholdRatio * scaleFactor,
			closed: true
		})

		return svgContours
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}

class FlowUnit {
	p: p5
	baseImg: p5.Graphics
	fishPaths: any[]
	position: p5.Vector
	appearDuration: number
	vanishDuration: number
	life: number
	properFrameCount: number
	velocity: number
	direction: number
	acceleFactor: number
	noiseFactor: number
	noiseIndex: number
	fishSize: number
	fishScale: { w: number; h: number }
	alive: boolean

	constructor(p, baseImg, fishPaths, params: any = {}) {
		this.p = p
		this.baseImg = baseImg
		this.fishPaths = fishPaths
		const {
			x = this.p.width / 2,
			y = this.p.height / 2,
			appearDuration = 120,
			vanishDuration = 180,
			life = 700,
			velocity = 2,
			direction = 0,
			acceleFactor = 0.15,
			noiseFactor = 0.02,
			noiseIndex = 0,
			fishSize = 32
		} = params
		this.position = this.p.createVector(x, y)
		this.appearDuration = appearDuration
		this.vanishDuration = vanishDuration
		this.life = life
		this.properFrameCount = 0
		this.velocity = velocity
		this.direction = direction
		this.acceleFactor = acceleFactor
		this.noiseFactor = noiseFactor
		this.noiseIndex = noiseIndex
		this.fishSize = fishSize
		this.fishScale = { w: 1.8 * fishSize, h: 1.0 * fishSize }
		this.alive = true
	}

	updateUnit() {
		this.direction +=
			this.acceleFactor *
			(this.p.noise(
				this.noiseIndex,
				this.properFrameCount * this.noiseFactor
			) -
				0.5)
		this.position.add(
			this.velocity * this.p.cos(this.direction),
			this.velocity * this.p.sin(this.direction)
		)

		if (this.position.x < 0) this.position.x += this.p.width
		if (this.position.y < 0) this.position.y += this.p.height
		if (this.position.x > this.p.width) this.position.x -= this.p.width
		if (this.position.y > this.p.height) this.position.y -= this.p.height
		/*
    if(this.position.x < -vanishMargin) this.alive = false;
    if(this.position.x > width+vanishMargin) this.alive = false;
    if(this.position.y < -vanishMargin) this.alive = false;
    if(this.position.y > height+vanishMargin) this.alive = false;
    */
		this.properFrameCount++
		if (this.properFrameCount > this.life) this.alive = false
	}
	drawUnit() {
		if (this.appearDuration > this.properFrameCount) {
			const appearAlphaValue =
				(255 * this.properFrameCount) / this.appearDuration
			this.baseImg.fill(255, appearAlphaValue)
		} else if (this.properFrameCount > this.life - this.vanishDuration) {
			const vanishAlphaValue =
				(255 * (this.life - this.properFrameCount)) /
				this.vanishDuration
			this.baseImg.fill(255, vanishAlphaValue)
		} else {
			this.baseImg.fill(255)
		}
		const centers = this.getCenters(
			this.position.x,
			this.position.y,
			this.fishScale.w,
			this.fishScale.h,
			this.direction
		)
		for (const c of centers) {
			this.baseImg.push()
			this.baseImg.translate(c.x, c.y)
			this.baseImg.rotate(this.direction)
			this.baseImg.scale(this.fishSize)
			this.baseImg.drawingContext.fill(
				this.fishPaths[this.properFrameCount % 120]
			)
			this.baseImg.pop()
		}
	}

	getCenters(x, y, w, h, angle = 0) {
		const result = [{ x: x, y: y }]
		const corners = [
			{ x: w / 2, y: 0 },
			{ x: 0, y: h / 2 },
			{ x: -w / 2, y: 0 },
			{ x: 0, y: -h / 2 }
		]
		for (const c of corners) {
			const a = c.x
			const b = c.y
			c.x = x + a * this.p.cos(angle) - b * this.p.sin(angle)
			c.y = y + a * this.p.sin(angle) + b * this.p.cos(angle)
		}
		const directions = [
			{ x: -this.p.width, y: -this.p.height },
			{ x: 0, y: -this.p.height },
			{ x: this.p.width, y: -this.p.height },
			{ x: this.p.width, y: 0 },
			{ x: this.p.width, y: this.p.height },
			{ x: 0, y: this.p.height },
			{ x: -this.p.width, y: this.p.height },
			{ x: -this.p.width, y: 0 }
		]
		// directionsからひとつ取ってそれをどれかのコーナーに適用する
		// たとえば上向きを適用してキャンバス内に入るなら下にはみ出してるから
		// 上向きを(x,y)に適用したものをresultにぶちこむ
		// その判定がミスった場合に
		// 下側の...この場合は(0,height)と(width,height)が矩形内にあるかどうか調べる
		// というのもねぇ
		// 4頂点が下にはみ出してなくても斜めで角がかすってあれする場合があるんでね。
		const canvasCorners = [
			{ x: 0, y: 0 },
			{ x: this.p.width, y: 0 },
			{ x: this.p.width, y: this.p.height },
			{ x: 0, y: this.p.height }
		]
		const canvasCornerIndicesArray = [
			[2],
			[2, 3],
			[3],
			[3, 0],
			[0],
			[0, 1],
			[1],
			[1, 2]
		]
		for (let i = 0; i < 8; i++) {
			const d = directions[i]
			let check = false
			for (const c of corners) {
				if (c.x + d.x < 0 || c.x + d.x > this.p.width) continue
				if (c.y + d.y < 0 || c.y + d.y > this.p.height) continue
				check = true
				break
			}
			const indices = canvasCornerIndicesArray[i]
			for (let k = 0; k < indices.length; k++) {
				const cc = canvasCorners[indices[k]]
				if (this.pointInTheRect(cc.x, cc.y, x, y, w, h, angle)) {
					check = true
					break
				}
			}
			if (check) {
				result.push({ x: x + d.x, y: y + d.y })
				continue
			}
		}
		return result
	}

	// (x,y)が(cx,cy)中心(w,h)サイズangle回転の中に入るかどうかのチェック
	pointInTheRect(x, y, cx, cy, w, h, angle = 0) {
		// 難しくなくて、(x-cx,y-cy)と(cos,sin)や(-sin,cos)の内積を取ればいい
		const ipX = (x - cx) * this.p.cos(angle) + (y - cy) * this.p.sin(angle)
		const ipY = -(x - cx) * this.p.sin(angle) + (y - cy) * this.p.cos(angle)
		if (this.p.abs(ipX) > w / 2) return false
		if (this.p.abs(ipY) > h / 2) return false
		return true
	}
}
