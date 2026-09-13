'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

interface CoralLobe {
	baseAngle: number
	angleSpread: number
	innerRadius: number
	maxRadius: number
	numRibs: number
	phase: number
	speed: number
	hueBase: number
	ruffleFreq: number
	ruffleAmp: number
	depthOffset: number
}

interface SporeParticle {
	x: number
	y: number
	vx: number
	vy: number
	life: number
	maxLife: number
	size: number
	hue: number
	brightness: number
	seed: number
}

interface Tendril {
	startAngle: number
	length: number
	speed: number
	seed: number
	hue: number
}

class BioluminescentCoralSketch extends Sketch {
	private lobes: CoralLobe[] = []
	private spores: SporeParticle[] = []
	private tendrils: Tendril[] = []
	private time: number = 0

	// Smoothed audio parameters
	private smoothedBass: number = 0
	private smoothedMid: number = 0
	private smoothedTreble: number = 0
	private smoothedVol: number = 0
	private dynamicHue: number = 185
	private prevVol: number = 0
	private prevBass: number = 0

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: true,
		})
	}

	setup(): void {
		super.setup()
		if (!this.p) return

		this.p.colorMode(this.p.HSB, 360, 100, 100, 1)
		this.p.background(0)

		this.initLobes()
		this.initTendrils()
		this.initSpores()
	}

	private initLobes(): void {
		if (!this.p) return
		this.lobes = []

		const minDim = Math.min(this.p.width, this.p.height)
		
		// 8 organically curved, ruffled lettuce-coral lobes
		const lobeConfigs = [
			// 1. Top-Left Electric Cyan Ruffle
			{ baseAngle: -Math.PI * 0.72, angleSpread: 1.35, innerR: minDim * 0.04, maxR: minDim * 0.38, ribs: 110, phase: 0.0, speed: 0.5, hue: 175, rFreq: 8, rAmp: 50, depth: 0 },
			// 2. Top-Right Violet / Purple Ruffle
			{ baseAngle: -Math.PI * 0.22, angleSpread: 1.25, innerR: minDim * 0.05, maxR: minDim * 0.35, ribs: 95, phase: 1.2, speed: 0.45, hue: 275, rFreq: 7, rAmp: 45, depth: 1 },
			// 3. Right Neon Magenta / Hot Pink Ruffle
			{ baseAngle: Math.PI * 0.15, angleSpread: 1.30, innerR: minDim * 0.04, maxR: minDim * 0.39, ribs: 105, phase: 2.4, speed: 0.52, hue: 325, rFreq: 9, rAmp: 55, depth: 2 },
			// 4. Bottom-Right Teal / Aqua Ruffle
			{ baseAngle: Math.PI * 0.55, angleSpread: 1.20, innerR: minDim * 0.04, maxR: minDim * 0.34, ribs: 90, phase: 3.6, speed: 0.42, hue: 165, rFreq: 7, rAmp: 42, depth: 3 },
			// 5. Bottom Cyan Main Ruffle (Large front prominent lobe)
			{ baseAngle: Math.PI * 0.88, angleSpread: 1.45, innerR: minDim * 0.04, maxR: minDim * 0.42, ribs: 120, phase: 4.8, speed: 0.60, hue: 182, rFreq: 10, rAmp: 60, depth: 4 },
			// 6. Left Deep Purple / Violet Lobe
			{ baseAngle: Math.PI * 1.32, angleSpread: 1.25, innerR: minDim * 0.05, maxR: minDim * 0.36, ribs: 95, phase: 5.5, speed: 0.48, hue: 265, rFreq: 8, rAmp: 46, depth: 5 },
			// 7. Intermediate Upper Magenta Crest
			{ baseAngle: -Math.PI * 0.48, angleSpread: 0.95, innerR: minDim * 0.03, maxR: minDim * 0.28, ribs: 70, phase: 3.1, speed: 0.55, hue: 310, rFreq: 6, rAmp: 35, depth: 6 },
			// 8. Center Swirling Vortex Core Ruffle
			{ baseAngle: 0, angleSpread: Math.PI * 2, innerR: minDim * 0.02, maxR: minDim * 0.19, ribs: 130, phase: 0.5, speed: 0.75, hue: 295, rFreq: 12, rAmp: 28, depth: 7 },
		]

		for (const c of lobeConfigs) {
			this.lobes.push({
				baseAngle: c.baseAngle,
				angleSpread: c.angleSpread,
				innerRadius: c.innerR,
				maxRadius: c.maxR,
				numRibs: c.ribs,
				phase: c.phase,
				speed: c.speed,
				hueBase: c.hue,
				ruffleFreq: c.rFreq,
				ruffleAmp: c.rAmp,
				depthOffset: c.depth,
			})
		}
	}

	private initTendrils(): void {
		if (!this.p) return
		this.tendrils = []
		const minDim = Math.min(this.p.width, this.p.height)
		const count = 48
		for (let i = 0; i < count; i++) {
			this.tendrils.push({
				startAngle: (this.p.TWO_PI / count) * i + this.p.random(-0.1, 0.1),
				length: this.p.random(minDim * 0.35, minDim * 0.75),
				speed: this.p.random(0.4, 0.9),
				seed: this.p.random(1000),
				hue: (i % 2 === 0 ? 175 : 315) + this.p.random(-15, 15),
			})
		}
	}

	private initSpores(): void {
		if (!this.p) return
		this.spores = []
		const count = 600
		for (let i = 0; i < count; i++) {
			const angle = this.p.random(this.p.TWO_PI)
			const dist = this.p.random(10, Math.min(this.p.width, this.p.height) * 0.70)
			this.spores.push({
				x: this.p.width / 2 + Math.cos(angle) * dist,
				y: this.p.height / 2 + Math.sin(angle) * dist,
				vx: this.p.random(-0.6, 0.6),
				vy: this.p.random(-0.6, 0.6),
				life: this.p.random(0.2, 1.0),
				maxLife: this.p.random(0.002, 0.006),
				size: this.p.random(1.2, 4.8),
				hue: this.p.random(160, 335),
				brightness: this.p.random(85, 100),
				seed: this.p.random(1000),
			})
		}
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		// 1. Audio Processing & Smoothing
		const bands = this.getVolumeEachBand()
		const rawTreble = bands[0] || 0
		const rawHighMid = bands[1] || 0
		const rawMid = bands[2] || 0
		const rawLowMid = bands[3] || 0
		const rawBass = bands[4] || 0
		const rawVol = this.getVolume() || 0
		const targetHue = this.getHue()

		const normBass = this.p.map(rawBass, 0, 255, 0, 1.0)
		const normMid = this.p.map(rawMid, 0, 255, 0, 1.0)
		const normTreble = this.p.map(rawTreble, 0, 255, 0, 1.0)
		const normHighMid = this.p.map(rawHighMid, 0, 255, 0, 1.0)

		const volDelta = rawVol - this.prevVol
		const bassDelta = normBass - this.prevBass
		this.prevVol = rawVol
		this.prevBass = normBass

		this.smoothedBass = this.p.lerp(this.smoothedBass, normBass, 0.15)
		this.smoothedMid = this.p.lerp(this.smoothedMid, normMid, 0.12)
		this.smoothedTreble = this.p.lerp(this.smoothedTreble, normTreble, 0.22)
		this.smoothedVol = this.p.lerp(this.smoothedVol, rawVol, 0.15)

		if (targetHue > 0) {
			this.dynamicHue = this.p.lerp(this.dynamicHue, targetHue, 0.04)
		}

		this.time += 0.012 + this.smoothedVol * 0.045

		// 2. Pitch Black Deep Sea background with soft motion trail fade
		this.p.blendMode(this.p.BLEND)
		this.p.noStroke()
		this.p.fill(0, 0, 0, 0.25)
		this.p.rect(0, 0, this.p.width, this.p.height)

		const cx = this.p.width / 2
		const cy = this.p.height / 2

		// 3. Fast Additive Blending for All Bioluminescent Elements
		this.p.blendMode(this.p.ADD)

		// 3a. Draw Dense Ambient Bioluminescent Spores / Plankton
		this.updateAndDrawSpores(cx, cy)

		// 3b. Draw Ethereal Outer Tendrils
		this.drawTendrils(cx, cy)

		// 3c. Draw Dense Pleated Ruffled Coral Frills (Core Visual)
		this.drawCoralFrills(cx, cy)

		// 3d. Draw Glowing Vortex Core
		this.drawCoreAndSynapses(cx, cy)

		// 4. 音声トランジェント・ビート・音量スパイクによる胞子バースト（マウス操作の代替）
		if (volDelta > 0.05 || bassDelta > 0.18 || this.smoothedTreble > 0.35 || this.smoothedVol > 0.22) {
			const burstCount = Math.floor(this.p.map(volDelta * 2 + bassDelta + this.smoothedTreble + this.smoothedVol, 0.05, 1.5, 8, 45))
			this.emitSporeBurst(cx, cy, burstCount)
		}

		// Reset blend mode for base p5 compatibility
		this.p.blendMode(this.p.BLEND)
	}

	private drawTendrils(cx: number, cy: number): void {
		if (!this.p) return

		this.p.push()
		this.p.translate(cx, cy)
		this.p.noFill()

		for (const t of this.tendrils) {
			const numPoints = 20
			const currentHue = (t.hue + (this.dynamicHue - 185) + 360) % 360

			this.p.strokeWeight(1.0 + this.smoothedTreble * 1.5)
			this.p.stroke(currentHue, 85, 100, 0.32 + this.smoothedMid * 0.3)

			this.p.beginShape()
			for (let i = 0; i < numPoints; i++) {
				const frac = i / numPoints
				const r = this.p.lerp(Math.min(this.p.width, this.p.height) * 0.10, t.length, frac)

				const n = this.p.noise(
					Math.cos(t.startAngle) * 1.5 + frac * 2.5 + t.seed,
					Math.sin(t.startAngle) * 1.5 + this.time * t.speed
				)
				const angleOffset = this.p.map(n, 0, 1, -0.7, 0.7) * (1.0 + this.smoothedMid * 1.2)
				const finalAngle = t.startAngle + angleOffset + Math.sin(this.time * 2 + frac * 6) * 0.18

				const px = Math.cos(finalAngle) * r * (1.0 + this.smoothedBass * 0.15)
				const py = Math.sin(finalAngle) * r * (1.0 + this.smoothedBass * 0.15)
				this.p.curveVertex(px, py)
			}
			this.p.endShape()
		}

		this.p.pop()
	}

	private drawCoralFrills(cx: number, cy: number): void {
		if (!this.p) return

		this.p.push()
		this.p.translate(cx, cy)

		// マイク音声による有機的な揺らぎ・呼吸シフト（マウス追従を廃止し音響連動に置換）
		const driftPhase = this.time * 0.7
		const audioShiftPower = 18 + this.smoothedBass * 55 + this.smoothedVol * 40
		const audioShiftX = Math.cos(driftPhase) * audioShiftPower
		const audioShiftY = Math.sin(driftPhase * 1.3) * audioShiftPower

		for (let lIdx = 0; lIdx < this.lobes.length; lIdx++) {
			const lobe = this.lobes[lIdx]
			const lobeHue = (lobe.hueBase + (this.dynamicHue - 185) + 360) % 360
			const bassBoost = 1.0 + this.smoothedBass * 0.35
			const midWave = this.smoothedMid * 24.0

			const halfSpread = lobe.angleSpread / 2
			const outerEdgePoints: { x: number; y: number }[] = []

			// 1. Draw dense pleated striations / flow ribs (高密度な発光プリーツ)
			this.p.noFill()
			for (let i = 0; i < lobe.numRibs; i++) {
				const frac = i / (lobe.numRibs - 1)
				const normA = (frac - 0.5) * 2.0
				const angle = lobe.baseAngle + normA * halfSpread

				// Smooth continuous harmonic ruffling
				const anglePhase = normA * Math.PI
				const ruffleH1 = Math.sin(anglePhase * lobe.ruffleFreq + this.time * lobe.speed * 2.5 + lobe.phase)
				const ruffleH2 = Math.sin(anglePhase * (lobe.ruffleFreq * 0.5) + this.time * 1.5)
				const ruffleH3 = Math.cos(anglePhase * (lobe.ruffleFreq * 1.5) + this.time * 2.0)
				const combinedRuffle = (ruffleH1 * 0.55 + ruffleH2 * 0.25 + ruffleH3 * 0.2) * (lobe.ruffleAmp + midWave)

				const bellCurve = Math.cos(normA * (Math.PI * 0.45))
				const maxR = (lobe.innerRadius + (lobe.maxRadius - lobe.innerRadius) * bellCurve + combinedRuffle) * bassBoost

				// Beautiful alternating multi-tone glow
				const ribHue = (lobeHue + normA * 22 + Math.sin(this.time + frac * 8) * 12 + 360) % 360
				const ribAlpha = this.p.map(Math.abs(normA), 0, 1, 0.35, 0.12) * (0.8 + this.smoothedVol * 0.6)

				this.p.strokeWeight(0.9 + this.smoothedMid * 0.7)
				this.p.stroke(ribHue, 88, 100, ribAlpha)

				const steps = 16
				this.p.beginShape()
				for (let s = 0; s <= steps; s++) {
					const sFrac = s / steps
					const r = this.p.lerp(lobe.innerRadius, maxR, Math.pow(sFrac, 1.18))
					// Curvature following the natural ruffle fold
					const foldSway = combinedRuffle * 0.015 * Math.sin(sFrac * Math.PI)
					const wave = Math.sin(sFrac * 6.0 + this.time * 3.0 + normA * 4.0) * (3.0 + midWave * 0.25) * sFrac
					const curAngle = angle + foldSway + wave / (r + 12)

					const px = Math.cos(curAngle) * r + audioShiftX * sFrac
					const py = Math.sin(curAngle) * r + audioShiftY * sFrac

					this.p.curveVertex(px, py)

					if (s === steps) {
						outerEdgePoints.push({ x: px, y: py })
					}
				}
				this.p.endShape()
			}

			// 2. Draw Radiant Crest Outline (強烈に発光する波打つ外縁ハイライト)
			if (outerEdgePoints.length > 2) {
				// Pass A: Wide diffused neon rim
				this.p.strokeWeight(4.8 + this.smoothedBass * 3.0)
				this.p.stroke(lobeHue, 95, 100, 0.38)
				this.p.beginShape()
				for (const pt of outerEdgePoints) {
					this.p.curveVertex(pt.x, pt.y)
				}
				this.p.endShape()

				// Pass B: Intense crisp bright core highlight
				this.p.strokeWeight(1.8 + this.smoothedTreble * 1.5)
				this.p.stroke(lobeHue, 35, 100, 0.95)
				this.p.beginShape()
				for (const pt of outerEdgePoints) {
					this.p.curveVertex(pt.x, pt.y)
				}
				this.p.endShape()

				// Pass C: Sparkling crest beads
				this.p.noStroke()
				for (let k = 0; k < outerEdgePoints.length; k += 2) {
					const pt = outerEdgePoints[k]
					const beadSize = (2.2 + Math.sin(this.time * 6 + k) * 1.2) * (1.0 + this.smoothedTreble * 1.5)
					this.p.fill(lobeHue, 15, 100, 0.9)
					this.p.circle(pt.x, pt.y, beadSize)
				}
			}
		}

		this.p.pop()
	}

	private drawCoreAndSynapses(cx: number, cy: number): void {
		if (!this.p) return

		this.p.push()
		this.p.translate(cx, cy)

		const coreHue = (this.dynamicHue + 120) % 360
		const coreRadius = 28 + this.smoothedBass * 55 + this.smoothedVol * 40

		// Spiral core filaments
		this.p.noFill()
		const spiralArms = 18
		for (let a = 0; a < spiralArms; a++) {
			const baseA = (this.p.TWO_PI / spiralArms) * a + this.time * 0.8
			this.p.strokeWeight(1.3 + this.smoothedMid * 1.2)
			this.p.stroke((coreHue + a * 12) % 360, 85, 100, 0.5 + this.smoothedMid * 0.4)

			this.p.beginShape()
			for (let r = 4; r < coreRadius * 1.9; r += 6) {
				const spiralAngle = baseA + (r * 0.04) * (a % 2 === 0 ? 1 : -1)
				const px = Math.cos(spiralAngle) * r
				const py = Math.sin(spiralAngle) * r
				this.p.curveVertex(px, py)
			}
			this.p.endShape()
		}

		// Multi-layer glowing core orbs
		this.p.noStroke()
		this.p.fill(coreHue, 95, 100, 0.32 + this.smoothedBass * 0.35)
		this.p.circle(0, 0, coreRadius * 2.3)

		this.p.fill(coreHue, 50, 100, 0.72 + this.smoothedBass * 0.25)
		this.p.circle(0, 0, coreRadius * 1.2)

		// Luminous nucleus
		this.p.fill(180, 20, 100, 0.98)
		this.p.circle(0, 0, coreRadius * 0.45)

		this.p.pop()
	}

	private updateAndDrawSpores(cx: number, cy: number): void {
		if (!this.p) return

		this.p.noStroke()

		for (let i = this.spores.length - 1; i >= 0; i--) {
			const s = this.spores[i]

			const dx = s.x - cx
			const dy = s.y - cy
			const distFromCenter = Math.sqrt(dx * dx + dy * dy)
			const vortexAngle = Math.atan2(dy, dx) + Math.PI * 0.5
			const vortexSpeed = this.p.map(distFromCenter, 0, 600, 1.3, 0.1)

			const curl = this.p.noise(s.x * 0.003, s.y * 0.003, this.time * 0.4 + s.seed) * this.p.TWO_PI * 2

			s.vx += Math.cos(vortexAngle) * vortexSpeed * 0.16 + Math.cos(curl) * 0.22
			s.vy += Math.sin(vortexAngle) * vortexSpeed * 0.16 + Math.sin(curl) * 0.22

			s.x += s.vx
			s.y += s.vy
			s.vx *= 0.95
			s.vy *= 0.95
			s.life -= s.maxLife

			if (s.life <= 0 || s.x < 0 || s.x > this.p.width || s.y < 0 || s.y > this.p.height) {
				const angle = this.p.random(this.p.TWO_PI)
				const r = this.p.random(15, Math.min(this.p.width, this.p.height) * 0.45)
				s.x = cx + Math.cos(angle) * r
				s.y = cy + Math.sin(angle) * r
				s.vx = Math.cos(angle) * this.p.random(0.5, 2.5)
				s.vy = Math.sin(angle) * this.p.random(0.5, 2.5)
				s.life = 1.0
				s.hue = (this.dynamicHue + this.p.random(-40, 120) + 360) % 360
			}

			const currentSize = s.size * s.life * (1.0 + this.smoothedTreble * 1.5)
			const shimmer = 0.75 + Math.sin(this.time * 15 + s.seed) * 0.25
			const alpha = s.life * shimmer * (0.75 + this.smoothedVol * 0.35)

			this.p.fill(s.hue, 85, s.brightness, alpha)
			this.p.circle(s.x, s.y, currentSize)
		}
	}

	private emitSporeBurst(cx: number, cy: number, count: number): void {
		if (!this.p) return

		for (let k = 0; k < count; k++) {
			const angle = this.p.random(this.p.TWO_PI)
			const speed = this.p.random(3.0, 10.0) * (1.0 + this.smoothedBass * 1.5)
			const startR = this.p.random(30, 120)

			this.spores.push({
				x: cx + Math.cos(angle) * startR,
				y: cy + Math.sin(angle) * startR,
				vx: Math.cos(angle) * speed + this.p.random(-1, 1),
				vy: Math.sin(angle) * speed + this.p.random(-1, 1),
				life: 1.0,
				maxLife: this.p.random(0.015, 0.035),
				size: this.p.random(2.0, 5.5),
				hue: (this.dynamicHue + this.p.random(-30, 90) + 360) % 360,
				brightness: 100,
				seed: this.p.random(1000),
			})
		}
	}

	mousePressed(): void {
		// マウス操作は無効化（すべてのインタラクションはマイク音声入力に完全連動）
	}
}

export default function (): void {
	const sketch = new BioluminescentCoralSketch()
	sketch.init()
}
