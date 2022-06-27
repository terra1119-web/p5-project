'use strict'
import { CONSTANT } from '@/util/constant'

// 実行するSketch
const files = Object.freeze([
	// 'sketch-particle',
	'sketch-letter',
	'sketch-draw',
	'sketch-tunnel',
	'sketch-movie',
	'sketch-wave',
	'sketch-particleFlow',
	'sketch-flocks',
	'sketch-3d',
	'sketch-images',
	'sketch-conchoid',
	// not yet
	// 'sketch-face',
	// 'sketch-face-emoji',
	// 'sketch-tree',
])

const SKETCH_MAX = files.length
let sketch_count = 0
let rnd_array = []

// タイマー
const timerWorker = new Worker('./worker/timer-worker.js')
timerWorker.addEventListener('message', e => {
	if (e.data > CONSTANT.TIME_MAX) {
		stop()
	}
})

async function start (file) {
	const sketch = await import(`./sketch/${file}`)
	sketch.default()
	window.addEventListener('finish', removeCanvas, false)
}

function stop() {
	timerWorker.postMessage('stop')
	const event = new Event('fade')
	window.dispatchEvent(event)
}

function removeCanvas() {
	timerWorker.postMessage('init')
	window.removeEventListener('finish', removeCanvas, false)
	sketch_count++
	if (sketch_count >= SKETCH_MAX) {
		sketch_count = 0
		rnd_array = randomizing(SKETCH_MAX)
	}
	start(files[rnd_array[sketch_count]])
}

function randomizing (max) {
	const arr = []
	const numArr = []
	for (let i = 0; i < max; i++) {
		arr[i] = i
	}

	for (let j = 0, len = arr.length; j < max; j++, len--) {
		const rndNum = Math.floor(Math.random() * len)
		numArr.push(arr[rndNum])
		arr[rndNum] = arr[len - 1]
	}

	return numArr
}

// start
rnd_array = randomizing(SKETCH_MAX)
start(files[rnd_array[sketch_count]])
