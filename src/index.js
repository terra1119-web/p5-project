'use strict'
import { CONSTANT } from '@/util/constant'

const files = [
	'sketch-particle',
	'sketch-letter',
	'sketch-draw',
]

const timerWorker = new Worker('./worker/timer-worker.js')
timerWorker.addEventListener('message', e => {
	if (e.data > CONSTANT.TIME_MAX) {
		timerWorker.postMessage('stop')
		const event = new Event('fade')
		window.dispatchEvent(event)
	}
})

let rnd = Math.floor(Math.random() * files.length)
let sketch = null

async function start (file) {
	sketch = await import(`./sketch/${file}`)
	sketch.default()
	window.addEventListener('finish', removeCanvas, false)
}

function removeCanvas() {
	timerWorker.postMessage('init')
	window.removeEventListener('finish', removeCanvas, false)
	sketch = null
	rnd = Math.floor(Math.random() * files.length)
	start(files[rnd])
}

start(files[rnd])
