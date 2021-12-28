'use strict'
import Sketch from '@/class/Sketch.js'

// variables
const movie_name_array = [
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

const play_max = movie_name_array.length
const time_max = 5400
const split_time_max = 900

let movie
let rand_arr = []
let play_count = 0
let time_count = 0
let split_time_count = 0
let col_count = 0
let col = 1
let col_max = 3
let movie_width
let movie_height

let rgb_array = [
	[ 0, 0, 0 ]
]
class SketchTest extends Sketch {
	setup(s) {
		super.setup(s)

		s.background(0)
		this.initArray()
		this.initMovie(s)
	}

	draw(s) {
		super.draw(s)

		s.background(0)
		let nn = 0
		for (let i = 0; i < col; i++) {
			for (let j = 0; j < col; j++) {
				s.tint(rgb_array[nn][0], rgb_array[nn][1], rgb_array[nn][2])
				s.image(movie, movie_width * i, movie_height * j, s.width / col, s.height / col)
				nn++
			}
		}

		split_time_count++
		if (split_time_max < split_time_count) {
			split_time_count = 0
			this.initSplit(s)
		}

		time_count++
		if (time_max < time_count) {
			play_count++
			if (play_max <= play_count) {
				play_count = 0
				this.initArray()
			}
			time_count = 0

			movie.stop()
			movie.remove()
			movie = null

			this.initMovie(s)
		}
	}

	// private method
	shuffle(array) {
		for (let i = array.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]]
		}
		return array
	}

	initArray() {
		rand_arr = this.shuffle(movie_name_array)
	}

	initMovie(s) {
		const movie_name = rand_arr[play_count]
		movie = s.createVideo(`movies/${movie_name}`)
		movie.volume(0)
		movie.hide()
		movie.loop()

		col = 1
		col_count = 0
		split_time_count = 0

		movie_width = s.width / col
		movie_height = s.height / col

		rgb_array = []
		rgb_array[0] = new Array(3)
		for (let i = 0; i < col; i++) {
			rgb_array[i][0] = s.round(s.random(255))
			rgb_array[i][1] = s.round(s.random(255))
			rgb_array[i][2] = s.round(s.random(255))
		}
	}

	initSplit(s) {
		col *= 2
		col_count++
		if (col_count >= col_max) {
			col = 1
			col_count = 0
		}

		movie_width = s.width / col
		movie_height = s.height / col

		const num = col * col
		for (let i = 0; i < num; i++) {
			rgb_array[i] = new Array(3)
			rgb_array[i][0] = s.round(s.random(255))
			rgb_array[i][1] = s.round(s.random(255))
			rgb_array[i][2] = s.round(s.random(255))
		}
	}
}

export default function () {
	const sketch = new SketchTest('WEBGL')
	sketch.init()
}
