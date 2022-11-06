'use strict'
let timerId: any = null
// get current time
let startDate: number = new Date().valueOf()

function start () {
	// repeat myTimer(d0) every 100 ms
	timerId = setInterval(() => {
		// get current time
		const current: number = new Date().valueOf()
		// calculate time difference between now and initial time
		const diff: number = current - startDate
		// calculate number of seconds
		const seconds: number = Math.floor(diff / 1000)
		// return output to Web Worker
		self.postMessage(seconds)
	}, 100)
}

addEventListener('message', e => {
	if (e.data === 'stop') {
		clearInterval(timerId)
		timerId = null
	}

	if (e.data === 'init') {
		startDate = new Date().valueOf()
		start()
	}
})

start()