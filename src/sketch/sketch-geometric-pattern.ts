'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class FedorovPattern {
	private p: p5
	private cellSize: number
	private patternType: number
	private grid: number[][]
	private colors: string[]
	private backgroundColor: string

	constructor(p: p5, type: number) {
		this.p = p
		this.cellSize = 40
		this.patternType = type
		this.grid = []

		// 2024年のトレンドカラーとPantoneの人気カラーを使用
		this.colors = [
			'#FF8370', // Peach Pink - 2024 Trend
			'#95B8D1', // Powder Blue - 2024 Trend
			'#E4C7B7', // Pale Dogwood
			'#88B04B', // Greenery
			'#5F4B8B', // Ultra Violet
			'#FF6F61', // Living Coral
			'#9BB7D4', // Serenity
			'#F7CAC9', // Rose Quartz
			'#92A8D1' // Serenity Blue
		]

		// バックグラウンドカラー（ダークモード考慮）
		this.backgroundColor = '#1A1A2E' // Deep Navy

		this.initGrid()
	}

	private initGrid(): void {
		const cols = Math.ceil(this.p.width / this.cellSize)
		const rows = Math.ceil(this.p.height / this.cellSize)
		this.grid = Array(rows)
			.fill(0)
			.map(() => Array(cols).fill(0))
	}

	public getBackgroundColor(): string {
		return this.backgroundColor
	}

	private getRandomColor(): string {
		// 色の組み合わせの調和を考慮して、隣接する色を避ける
		const lastColor = this.colors[this.lastColorIndex]
		let newColorIndex
		do {
			newColorIndex = Math.floor(this.p.random(this.colors.length))
		} while (newColorIndex === this.lastColorIndex)

		this.lastColorIndex = newColorIndex
		return this.colors[newColorIndex]
	}

	private lastColorIndex: number = -1

	public draw(x: number, y: number): void {
		const col = Math.floor(x / this.cellSize)
		const row = Math.floor(y / this.cellSize)

		if (
			row < 0 ||
			row >= this.grid.length ||
			col < 0 ||
			col >= this.grid[0].length
		)
			return

		this.p.push()
		this.p.translate(col * this.cellSize, row * this.cellSize)

		// 半透明効果を追加してブレンディングを改善
		// this.p.blendMode(this.p.ADD)

		const patternMethods = [
			this.p1Pattern.bind(this),
			this.p2Pattern.bind(this),
			this.pmPattern.bind(this),
			this.pgPattern.bind(this),
			this.cmPattern.bind(this),
			this.p2mmPattern.bind(this),
			this.p2mgPattern.bind(this),
			this.p2ggPattern.bind(this),
			this.c2mmPattern.bind(this),
			this.p4Pattern.bind(this),
			this.p4mmPattern.bind(this),
			this.p4gmPattern.bind(this),
			this.p3Pattern.bind(this),
			this.p3m1Pattern.bind(this),
			this.p31mPattern.bind(this),
			this.p6Pattern.bind(this),
			this.p6mmPattern.bind(this)
		]

		// アルファ値を追加して重なり合いの効果を向上
		this.p.fill(this.p.color(this.getRandomColor() + '88'))
		patternMethods[this.patternType]()

		this.p.pop()
		this.grid[row][col] = 1
	}

	// 1. p1 - 並進対称
	private p1Pattern(): void {
		this.p.fill(this.getRandomColor())
		this.p.rect(0, 0, this.cellSize, this.cellSize)
	}

	// 2. p2 - 2回回転対称
	private p2Pattern(): void {
		const size = this.cellSize / 2
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 2; i++) {
			this.p.push()
			this.p.rotate(i * this.p.PI)
			this.p.fill(this.getRandomColor())
			this.p.rect(-size / 2, -size / 2, size, size)
			this.p.pop()
		}
	}

	// 3. pm - 鏡映対称
	private pmPattern(): void {
		const halfSize = this.cellSize / 2
		this.p.fill(this.getRandomColor())
		this.p.rect(0, 0, halfSize, this.cellSize)
		this.p.fill(this.getRandomColor())
		this.p.rect(halfSize, 0, halfSize, this.cellSize)
	}

	// 4. pg - 滑り鏡映対称
	private pgPattern(): void {
		const quarterSize = this.cellSize / 4
		this.p.fill(this.getRandomColor())
		this.p.rect(0, 0, quarterSize * 2, this.cellSize)
		this.p.push()
		this.p.translate(quarterSize * 2, this.cellSize)
		this.p.rotate(this.p.PI)
		this.p.fill(this.getRandomColor())
		this.p.rect(0, 0, quarterSize * 2, this.cellSize)
		this.p.pop()
	}

	// 5. cm - 鏡映と滑り鏡映の組み合わせ
	private cmPattern(): void {
		const quarterSize = this.cellSize / 4
		for (let i = 0; i < 2; i++) {
			this.p.push()
			this.p.translate((i * this.cellSize) / 2, 0)
			this.p.fill(this.getRandomColor())
			this.p.beginShape()
			this.p.vertex(0, 0)
			this.p.vertex(quarterSize * 2, 0)
			this.p.vertex(quarterSize, this.cellSize)
			this.p.vertex(-quarterSize, this.cellSize)
			this.p.endShape(this.p.CLOSE)
			this.p.pop()
		}
	}

	// 6. p2mm - 2回回転と鏡映
	private p2mmPattern(): void {
		const quarterSize = this.cellSize / 4
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				this.p.push()
				this.p.translate(
					(i * this.cellSize) / 2,
					(j * this.cellSize) / 2
				)
				this.p.fill(this.getRandomColor())
				this.p.rect(0, 0, quarterSize * 2, quarterSize * 2)
				this.p.pop()
			}
		}
	}

	// 7. p2mg - 2回回転と滑り鏡映
	private p2mgPattern(): void {
		const quarterSize = this.cellSize / 4
		for (let i = 0; i < 2; i++) {
			this.p.push()
			this.p.translate((i * this.cellSize) / 2, 0)
			this.p.fill(this.getRandomColor())
			this.p.triangle(
				0,
				0,
				quarterSize * 2,
				0,
				quarterSize,
				quarterSize * 2
			)
			this.p.pop()
		}
	}

	// 8. p2gg - 2回回転と2つの滑り鏡映
	private p2ggPattern(): void {
		const quarterSize = this.cellSize / 4
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				this.p.push()
				this.p.translate(
					(i * this.cellSize) / 2,
					(j * this.cellSize) / 2
				)
				this.p.rotate((((i + j) % 2) * this.p.PI) / 2)
				this.p.fill(this.getRandomColor())
				this.p.triangle(
					0,
					0,
					quarterSize * 2,
					0,
					quarterSize,
					quarterSize * 2
				)
				this.p.pop()
			}
		}
	}

	// 9. c2mm - 菱形格子での2回回転と鏡映
	private c2mmPattern(): void {
		const quarterSize = this.cellSize / 4
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 4; i++) {
			this.p.push()
			this.p.rotate((i * this.p.PI) / 2)
			this.p.fill(this.getRandomColor())
			this.p.triangle(
				0,
				0,
				quarterSize * 2,
				0,
				quarterSize,
				quarterSize * 2
			)
			this.p.pop()
		}
		this.p.pop()
	}

	// 10. p4 - 4回回転対称
	private p4Pattern(): void {
		const quarterSize = this.cellSize / 4
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 4; i++) {
			this.p.push()
			this.p.rotate((i * this.p.PI) / 2)
			this.p.fill(this.getRandomColor())
			this.p.rect(0, 0, quarterSize * 2, quarterSize * 2)
			this.p.pop()
		}
		this.p.pop()
	}

	// 11. p4mm - 4回回転と鏡映
	private p4mmPattern(): void {
		const eighthSize = this.cellSize / 8
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 8; i++) {
			this.p.push()
			this.p.rotate((i * this.p.PI) / 4)
			this.p.fill(this.getRandomColor())
			this.p.triangle(0, 0, eighthSize * 2, 0, eighthSize, eighthSize * 2)
			this.p.pop()
		}
		this.p.pop()
	}

	// 12. p4gm - 4回回転と滑り鏡映
	private p4gmPattern(): void {
		const quarterSize = this.cellSize / 4
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 4; i++) {
			this.p.push()
			this.p.rotate((i * this.p.PI) / 2)
			this.p.translate(quarterSize, 0)
			this.p.fill(this.getRandomColor())
			this.p.triangle(
				-quarterSize,
				-quarterSize,
				quarterSize,
				-quarterSize,
				0,
				quarterSize
			)
			this.p.pop()
		}
		this.p.pop()
	}

	// 13. p3 - 3回回転対称
	private p3Pattern(): void {
		const radius = this.cellSize / 3
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 3; i++) {
			this.p.push()
			this.p.rotate((i * this.p.TWO_PI) / 3)
			this.p.fill(this.getRandomColor())
			this.p.triangle(
				0,
				0,
				radius * Math.cos(0),
				radius * Math.sin(0),
				radius * Math.cos(this.p.TWO_PI / 3),
				radius * Math.sin(this.p.TWO_PI / 3)
			)
			this.p.pop()
		}
		this.p.pop()
	}

	// 14. p3m1 - 3回回転と鏡映
	private p3m1Pattern(): void {
		const radius = this.cellSize / 3
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 6; i++) {
			this.p.push()
			this.p.rotate((i * this.p.TWO_PI) / 6)
			this.p.fill(this.getRandomColor())
			this.p.triangle(
				0,
				0,
				radius,
				0,
				radius * Math.cos(this.p.TWO_PI / 6),
				radius * Math.sin(this.p.TWO_PI / 6)
			)
			this.p.pop()
		}
		this.p.pop()
	}

	// 15. p31m - 3回回転と鏡映（別配置）
	private p31mPattern(): void {
		const radius = this.cellSize / 3
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 3; i++) {
			this.p.push()
			this.p.rotate((i * this.p.TWO_PI) / 3)
			this.p.fill(this.getRandomColor())
			this.p.triangle(
				0,
				0,
				radius,
				0,
				radius / 2,
				(radius * Math.sqrt(3)) / 2
			)
			this.p.triangle(
				0,
				0,
				radius,
				0,
				radius / 2,
				(-radius * Math.sqrt(3)) / 2
			)
			this.p.pop()
		}
		this.p.pop()
	}

	// 16. p6 - 6回回転対称
	private p6Pattern(): void {
		const radius = this.cellSize / 3
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 6; i++) {
			this.p.push()
			this.p.rotate((i * this.p.TWO_PI) / 6)
			this.p.fill(this.getRandomColor())
			this.p.triangle(
				0,
				0,
				radius,
				0,
				radius * Math.cos(this.p.TWO_PI / 6),
				radius * Math.sin(this.p.TWO_PI / 6)
			)
			this.p.pop()
		}
		this.p.pop()
	}

	// 17. p6mm - 6回回転と鏡映
	private p6mmPattern(): void {
		const radius = this.cellSize / 3
		this.p.push()
		this.p.translate(this.cellSize / 2, this.cellSize / 2)
		for (let i = 0; i < 12; i++) {
			this.p.push()
			this.p.rotate((i * this.p.TWO_PI) / 12)
			this.p.fill(this.getRandomColor())
			this.p.triangle(
				0,
				0,
				radius,
				0,
				radius * Math.cos(this.p.TWO_PI / 12),
				radius * Math.sin(this.p.TWO_PI / 12)
			)
			this.p.pop()
		}
		this.p.pop()
	}
}

class SketchTest extends Sketch {
	// property
	private currentPattern: FedorovPattern
	private patternType: number
	private lastPatternChange: number
	private patternDuration: number
	private volumeThreshold: number
	private PATTERN_MAX: number

	constructor() {
		super({
			renderer: 'P2D',
			use2D: true,
			useMic: true
		})
		// initialize
		this.patternType = 0
		this.lastPatternChange = 0
		this.patternDuration = 30000 // 30秒ごとにパターン変更
		this.volumeThreshold = 0.01
		this.PATTERN_MAX = 17
	}

	setup(): void {
		super.setup()

		this.patternType = this.p.floor(this.p.random(this.PATTERN_MAX + 1))
		console.log(this.patternType)
		this.p.background(0)
		this.currentPattern = new FedorovPattern(this.p, this.patternType)
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		const volume = this.getVolume()
		const currentTime = this.p.millis()

		// パターン切り替えチェック
		if (currentTime - this.lastPatternChange > this.patternDuration) {
			// this.patternType = (this.patternType + 1) % 17
			this.patternType = this.p.floor(this.p.random(this.PATTERN_MAX + 1))
			console.log(this.patternType)
			this.currentPattern = new FedorovPattern(this.p, this.patternType)
			this.lastPatternChange = currentTime
			this.p.background(0)
		}

		// 音量が閾値を超えた場合、新しい模様を描画
		if (volume > this.volumeThreshold) {
			const x = this.p.random(this.p.width)
			const y = this.p.random(this.p.height)
			this.currentPattern.draw(x, y)
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
