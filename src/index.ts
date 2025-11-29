'use strict'
import { CONSTANT } from '@/util/constant'

const TIMER_WORKER_PATH = './worker/timer-worker.js'
const TIMER_MESSAGE_EVENT = 'message'
const TIMER_STOP_MESSAGE = 'stop'
const TIMER_INIT_MESSAGE = 'init'
const SKETCH_FADE_EVENT = 'fade'
const SKETCH_FINISH_EVENT = 'finish'

// 実行するSketch
const files: readonly string[] = Object.freeze([
	// 'sketch-letter',
	// 'sketch-draw',
	// 'sketch-tunnel',
	// 'sketch-movie',
	// 'sketch-wave',
	// 'sketch-particleFlow',
	// 'sketch-flocks',
	// 'sketch-3d',
	// 'sketch-images',
	// 'sketch-conchoid',
	// 'sketch-brushDraw',
	// 'sketch-tree',
	// 'sketch-line',
	// 'sketch-fieldColoring',
	// 'sketch-inkDrop',
	// 'sketch-multicolor-boid',
	// 'sketch-forest',
	// 'sketch-flourishing',
	// 'sketch-splatter',
	// 'sketch-endless',
	// 'sketch-3d-cube',
	// 'sketch-galaxy-noise',
	// 'sketch-thread',
	// 'sketch-walkers',
	// 'sketch-simple-feedback',
	// 'sketch-symmetries',
	// 'sketch-fish',
	// 'sketch-dna',
	// 'sketch-rewound',
	// 'sketch-triquid',
	// 'sketch-octagonalTunnel',
	// 'sketch-mystery-sphere',
	// 'sketch-shader',
	// 'sketch-devil',
	// 'sketch-colorful-rings-noise',
	// 'sketch-text-particle',
	// 'sketch-geometric-pattern',
	// 'sketch-genuary',
	// 'sketch-algorithm',
	// 'sketch-things-fall',
	// 'sketch-crystal-ball',
	// 'sketch-crystal-wave',
	// 'sketch-escher-infinite',
	// 'sketch-accretion',
	// 'sketch-posthelios',
	// 'sketch-raymarching',
	'sketch-spectrogram',
	// not yet
	// 'sketch-sketchbook',
	// 'sketch-sound',
	// 'sketch-acoustic-kaleidoscope',
	// 'sketch-winter',
	// 'sketch-shader',
	// 'sketch-spiral-image',
	// 'sketch-acoustic',
	// 'sketch-particle',
	// 'sketch-magical-trail-shader',
	// 'sketch-graduation',
	// 'sketch-sand',
	// 'sketch-auto-paint'
	// 'sketch-plasma-shapes',
	// 'sketch-particle-ink',
	// 'sketch-kiltWave',
	// 'sketch-virtual-sea',
	// 'sketch-color-drop',
	// 'sketch-motes',
	// 'sketch-light-line',
])

const SKETCH_MAX: number = files.length
let sketch_count: number = 0
let rnd_array: number[] = []

// タイマー
const timerWorker: Worker = new Worker(TIMER_WORKER_PATH)
timerWorker.addEventListener(TIMER_MESSAGE_EVENT, e => {
	if (e.data > CONSTANT.TIME_MAX) {
		stop()
	}
})

async function start(file: string): Promise<void> {
	const sketch = await import(`./sketch/${file}.ts`)
	sketch.default()
	window.addEventListener(SKETCH_FINISH_EVENT, removeCanvas, false)
}

function stop(): void {
	timerWorker.postMessage(TIMER_STOP_MESSAGE)
	const event: Event = new Event(SKETCH_FADE_EVENT)
	window.dispatchEvent(event)
}

function resetCanvas(): void {
	timerWorker.postMessage(TIMER_INIT_MESSAGE)
	window.removeEventListener(SKETCH_FINISH_EVENT, removeCanvas, false)
}

function nextSketch(): void {
	sketch_count++
	if (sketch_count >= SKETCH_MAX) {
		sketch_count = 0
		rnd_array = randomizing(SKETCH_MAX)
	}
	start(files[rnd_array[sketch_count]])
}

function removeCanvas(): void {
	resetCanvas()
	nextSketch()
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
