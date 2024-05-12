'use strict'
import { CONSTANT } from '@/util/constant'

// 実行するSketch
const files: readonly string[] = Object.freeze([
	'sketch-draw',
	'sketch-tunnel',
	'sketch-movie',
	'sketch-wave',
	'sketch-particleFlow',
	'sketch-flocks',
	'sketch-3d',
	'sketch-images',
	'sketch-conchoid',
	'sketch-brushDraw',
	'sketch-tree',
	'sketch-line',
	'sketch-particle-ink',
	'sketch-fieldColoring',
	'sketch-inkDrop',
	'sketch-kiltWave',
	'sketch-multicolor-boid',
	'sketch-forest',
	'sketch-virtual-sea',
	'sketch-flourishing',
	'sketch-color-drop',
	'sketch-splatter',
	'sketch-spiral-image',
	'sketch-motes',
	'sketch-endless',
	'sketch-3d-cube',
	'sketch-galaxy-noise',
	'sketch-light-line',
	'sketch-colorful-rings-noise',
	'sketch-devil',
	'sketch-thread',
	'sketch-walkers',
	'sketch-simple-feedback',
	'sketch-symmetries'
	// not yet
	// 'sketch-magical-trail-shader'
	// 'sketch-graduation'
	// 'sketch-letter',
	// 'sketch-sand'
	// 'sketch-auto-paint'
	// 'sketch-particle',
	// 'sketch-face',
	// 'sketch-face-emoji',
	// 'sketch-plasma-shapes',
])

const SKETCH_MAX: number = files.length
let sketch_count: number = 0
let rnd_array: number[] = []

// タイマー
const timerWorker: Worker = new Worker('./worker/timer-worker.js')
timerWorker.addEventListener('message', e => {
	if (e.data > CONSTANT.TIME_MAX) {
		stop()
	}
})

async function start(file: string): Promise<void> {
	const sketch: any = await import(`./sketch/${file}.ts`)
	sketch.default()
	window.addEventListener('finish', removeCanvas, false)
}

function stop(): void {
	timerWorker.postMessage('stop')
	const event: Event = new Event('fade')
	window.dispatchEvent(event)
}

function removeCanvas(): void {
	timerWorker.postMessage('init')
	window.removeEventListener('finish', removeCanvas, false)
	sketch_count++
	if (sketch_count >= SKETCH_MAX) {
		sketch_count = 0
		rnd_array = randomizing(SKETCH_MAX)
	}
	start(files[rnd_array[sketch_count]])
}

function randomizing(max: number): number[] {
	const arr: number[] = []
	const numArr: number[] = []
	for (let i = 0; i < max; i++) {
		arr[i] = i
	}

	for (let j = 0, len = arr.length; j < max; j++, len--) {
		const rndNum: number = Math.floor(Math.random() * len)
		numArr.push(arr[rndNum])
		arr[rndNum] = arr[len - 1]
	}

	return numArr
}

// start
rnd_array = randomizing(SKETCH_MAX)
start(files[rnd_array[sketch_count]])
