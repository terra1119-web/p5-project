'use strict'
import Sketch from '@/class/Sketch'

// NOTE: imageの型定義を上書き
declare module 'p5' {
	interface p5InstanceExtensions {
		image(
			img: Image | Element | MediaElement,
			x: number,
			y: number,
			width?: number,
			height?: number
		): void
		image(
			img: Image | Element | MediaElement,
			dx: number,
			dy: number,
			dWidth: number,
			dHeight: number,
			sx: number,
			sy: number,
			sWidth?: number,
			sHeight?: number
		): void
	}
}

class SketchTest extends Sketch {
	// property
	movie_name_array: string[]
	play_max: number
	time_max: number
	split_time_max: number
	movie: p5.MediaElement | any
	rand_arr: string[]
	play_count: number
	time_count: number
	split_time_count: number
	col_count: number
	col: number
	col_max: number
	movie_width: number
	movie_height: number
	rgb_array: number[][]

	constructor() {
		super({
			renderer: 'WEBGL'
		})
		// initialize
		this.movie_name_array = [
			'Animals - 6572.mp4',
			'Bottle - 754.mp4',
			'c.mp4',
			'g.mp4',
			'h.mp4',
			'Milk - 4315.mp4',
			'Mountains - 6872.mp4',
			'Natural Landscapes - 1613.mp4',
			'Rose - 3654.mp4',
			'Running Sushi - 3625.mp4',
			'Shoes - 3627.mp4',
			'Synthesizer - 3239.mp4',
			'Synthesizer - 6488.mp4',
			'Vegetables - 4572.mp4',
			'Water Dragon - 3779.mp4',
			'Massage - 701.mp4',
			'Parrot - 9219.mp4',
			"Woodhouse'S Toad - 397.mp4",
			'A Wet Hawk.mp4',
			'Video Of Jellyfishes Inside Of Aquarium.mp4',
			'Pexels Videos 3563.mp4',
			'Pexels Videos 1526909.mp4'
		]
		this.play_max = this.movie_name_array.length
		this.time_max = 5400
		this.split_time_max = 900
		this.rand_arr = []
		this.play_count = 0
		this.time_count = 0
		this.split_time_count = 0
		this.col_count = 0
		this.col = 1
		this.col_max = 3
		this.rgb_array = [[0, 0, 0]]
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.initArray()
		this.initMovie()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		let nn: number = 0
		for (let i: number = 0; i < this.col; i++) {
			for (let j: number = 0; j < this.col; j++) {
				this.p.tint(
					this.rgb_array[nn][0],
					this.rgb_array[nn][1],
					this.rgb_array[nn][2]
				)
				this.p.image(
					this.movie,
					this.movie_width * i,
					this.movie_height * j,
					this.p.width / this.col,
					this.p.height / this.col
				)
				nn++
			}
		}

		this.split_time_count++
		if (this.split_time_max < this.split_time_count) {
			this.split_time_count = 0
			this.initSplit()
		}

		this.time_count++
		if (this.time_max < this.time_count) {
			this.play_count++
			if (this.play_max <= this.play_count) {
				this.play_count = 0
				this.initArray()
			}
			this.time_count = 0

			this.movie.stop()
			// this.movie.disconnect()
			this.movie = null

			this.initMovie()
		}
	}

	// private method
	shuffle(array: string[]): string[] {
		for (let i: number = array.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[array[i], array[j]] = [array[j], array[i]]
		}
		return array
	}

	initArray(): void {
		this.rand_arr = this.shuffle(this.movie_name_array)
	}

	initMovie(): void {
		const movie_name: string = this.rand_arr[this.play_count]
		this.movie = this.p.createVideo(`movies/${movie_name}`)
		this.movie.volume(0)
		this.movie.loop()
		this.movie.hide()

		this.col = 1
		this.col_count = 0
		this.split_time_count = 0

		this.movie_width = this.p.width / this.col
		this.movie_height = this.p.height / this.col

		this.rgb_array = []
		for (let i: number = 0; i < this.col; i++) {
			this.rgb_array[i] = []
			this.rgb_array[i][0] = this.p.round(this.p.random(255))
			this.rgb_array[i][1] = this.p.round(this.p.random(255))
			this.rgb_array[i][2] = this.p.round(this.p.random(255))
		}
	}

	initSplit(): void {
		this.col *= 2
		this.col_count++
		if (this.col_count >= this.col_max) {
			this.col = 1
			this.col_count = 0
		}

		this.movie_width = this.p.width / this.col
		this.movie_height = this.p.height / this.col

		const num = this.col * this.col
		for (let i: number = 0; i < num; i++) {
			this.rgb_array[i] = []
			this.rgb_array[i][0] = this.p.round(this.p.random(255))
			this.rgb_array[i][1] = this.p.round(this.p.random(255))
			this.rgb_array[i][2] = this.p.round(this.p.random(255))
		}
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
