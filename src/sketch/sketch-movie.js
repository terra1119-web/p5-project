'use strict'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
	constructor () {
		super('WEBGL')
		// variables
		this.movie_name_array = [
			"Animals - 6572.mp4",
			"Bottle - 754.mp4",
			"c.mp4",
			"g.mp4",
			"h.mp4",
			"Milk - 4315.mp4",
			"Mountains - 6872.mp4",
			"Natural Landscapes - 1613.mp4",
			"Rose - 3654.mp4",
			"Running Sushi - 3625.mp4",
			"Shoes - 3627.mp4",
			"Synthesizer - 3239.mp4",
			"Synthesizer - 6488.mp4",
			"Vegetables - 4572.mp4",
			"Water Dragon - 3779.mp4",
			"Massage - 701.mp4",
			"Parrot - 9219.mp4",
			"Woodhouse'S Toad - 397.mp4",
			"A Wet Hawk.mp4",
			"Video Of Jellyfishes Inside Of Aquarium.mp4",
			"Pexels Videos 3563.mp4",
			"Pexels Videos 1526909.mp4"
		]

		this.play_max = this.movie_name_array.length
		this.time_max = 5400
		this.split_time_max = 900

		this.movie
		this.rand_arr = []
		this.play_count = 0
		this.time_count = 0
		this.split_time_count = 0
		this.col_count = 0
		this.col = 1
		this.col_max = 3
		this.movie_width
		this.movie_height

		this.rgb_array = [
			[ 0, 0, 0 ]
		]
	}

	setup () {
		super.setup()

		this.p.background(0)
		this.initArray()
		this.initMovie()
	}

	draw () {
		super.draw()
		if (!this.p) return

		this.p.background(0)
		let nn = 0
		for (let i = 0; i < this.col; i++) {
			for (let j = 0; j < this.col; j++) {
				this.p.tint(this.rgb_array[nn][0], this.rgb_array[nn][1], this.rgb_array[nn][2])
				this.p.image(this.movie, this.movie_width * i, this.movie_height * j, this.p.width / this.col, this.p.height / this.col)
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
			this.movie.remove()
			this.movie = null

			this.initMovie()
		}
	}

	// private method
	shuffle (array) {
		for (let i = array.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]]
		}
		return array
	}

	initArray () {
		this.rand_arr = this.shuffle(this.movie_name_array)
	}

	initMovie () {
		const movie_name = this.rand_arr[this.play_count]
		this.movie = this.p.createVideo(`movies/${movie_name}`)
		this.movie.volume(0)
		this.movie.hide()
		this.movie.loop()

		this.col = 1
		this.col_count = 0
		this.split_time_count = 0

		this.movie_width = this.p.width / this.col
		this.movie_height = this.p.height / this.col

		this.rgb_array = []
		this.rgb_array[0] = new Array(3)
		for (let i = 0; i < this.col; i++) {
			this.rgb_array[i][0] = this.p.round(this.p.random(255))
			this.rgb_array[i][1] = this.p.round(this.p.random(255))
			this.rgb_array[i][2] = this.p.round(this.p.random(255))
		}
	}

	initSplit () {
		this.col *= 2
		this.col_count++
		if (this.col_count >= this.col_max) {
			this.col = 1
			this.col_count = 0
		}

		this.movie_width = this.p.width / this.col
		this.movie_height = this.p.height / this.col

		const num = this.col * this.col
		for (let i = 0; i < num; i++) {
			this.rgb_array[i] = new Array(3)
			this.rgb_array[i][0] = this.p.round(this.p.random(255))
			this.rgb_array[i][1] = this.p.round(this.p.random(255))
			this.rgb_array[i][2] = this.p.round(this.p.random(255))
		}
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}
