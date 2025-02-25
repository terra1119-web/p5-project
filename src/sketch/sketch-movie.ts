'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

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
	// Constants
	private readonly TIME_MAX: number = 5400
	private readonly SPLIT_TIME_MAX: number = 900

	// Properties
	private movieNameArray: string[]
	private playMax: number
	private movie: p5.MediaElement
	private randomMovieOrder: string[]
	private playCount: number
	private timeCount: number
	private splitTimeCount: number
	private colorCount: number
	private colorDivisions: number
	private maxColorDivisions: number
	private movieWidth: number
	private movieHeight: number
	private rgbArray: number[][]

	constructor() {
		super({
			renderer: 'WEBGL',
		})
		// initialize
		this.movieNameArray = [
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
			// 'Pexels Videos 3563.mp4',
			// 'Pexels Videos 1526909.mp4',
			// '2405380-uhd_3840_2160_24fps.mp4',
			// '857130-hd_1280_720_24fps.mp4',
		]
		this.playMax = this.movieNameArray.length
		this.randomMovieOrder = []
		this.playCount = 0
		this.timeCount = 0
		this.splitTimeCount = 0
		this.colorCount = 0
		this.colorDivisions = 1
		this.maxColorDivisions = 3
		this.rgbArray = [[0, 0, 0]]
	}

	setup(): void {
		super.setup()

		this.p.background(0)
		this.initializeMovieOrder()
		this.initializeMovie()
	}

	draw(): void {
		super.draw()
		if (!this.p) return

		this.p.background(0)

		const numDivisions = this.colorDivisions * this.colorDivisions
		for (let i = 0; i < numDivisions; i++) {
			const x = (i % this.colorDivisions) * this.movieWidth
			const y = Math.floor(i / this.colorDivisions) * this.movieHeight

			this.p.tint(
				this.rgbArray[i][0],
				this.rgbArray[i][1],
				this.rgbArray[i][2]
			)
			this.p.image(
				this.movie,
				x,
				y,
				this.p.width / this.colorDivisions,
				this.p.height / this.colorDivisions
			)
		}

		this.splitTimeCount++
		if (this.SPLIT_TIME_MAX < this.splitTimeCount) {
			this.splitTimeCount = 0
			this.initSplit()
		}

		this.timeCount++
		if (this.TIME_MAX < this.timeCount) {
			this.updateMovie()
		}
	}

	// private method
	private shuffle(array: string[]): string[] {
		for (let i: number = array.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[array[i], array[j]] = [array[j], array[i]]
		}
		return array
	}

	private initializeMovieOrder(): void {
		this.randomMovieOrder = this.shuffle(this.movieNameArray)
	}

	private initializeMovie(): void {
		const movieName: string = this.randomMovieOrder[this.playCount]
		this.movie = this.p.createVideo(`movies/${movieName}`)
		this.movie.volume(0)
		this.movie.loop()
		this.movie.hide()

		this.colorDivisions = 1
		this.colorCount = 0
		this.splitTimeCount = 0

		this.movieWidth = this.p.width / this.colorDivisions
		this.movieHeight = this.p.height / this.colorDivisions

		this.rgbArray = Array(this.colorDivisions * this.colorDivisions)
			.fill(null)
			.map(() => [
				this.p.round(this.p.random(255)),
				this.p.round(this.p.random(255)),
				this.p.round(this.p.random(255)),
			])
	}

	private initSplit(): void {
		this.colorDivisions *= 2
		this.colorCount++
		if (this.colorCount >= this.maxColorDivisions) {
			this.colorDivisions = 1
			this.colorCount = 0
		}

		this.movieWidth = this.p.width / this.colorDivisions
		this.movieHeight = this.p.height / this.colorDivisions

		this.rgbArray = Array(this.colorDivisions * this.colorDivisions)
			.fill(null)
			.map(() => [
				this.p.round(this.p.random(255)),
				this.p.round(this.p.random(255)),
				this.p.round(this.p.random(255)),
			])
	}

	private updateMovie(): void {
		this.playCount++
		if (this.playMax <= this.playCount) {
			this.playCount = 0
			this.initializeMovieOrder()
		}
		this.timeCount = 0

		this.movie.stop()
		this.movie = null

		this.initializeMovie()
	}
}

export default function (): void {
	const sketch: SketchTest = new SketchTest()
	sketch.init()
}
