'use strict'

class Microphone {
	analyser: AnalyserNode | null
	dataArray: Uint8Array | null

	constructor() {
		this.analyser = null
		this.dataArray = null

		navigator.mediaDevices
			.getUserMedia({ audio: true, video: false })
			.then(stream => {
				const audioContext: AudioContext = new AudioContext()
				const source: MediaStreamAudioSourceNode =
					audioContext.createMediaStreamSource(stream)
				this.analyser = audioContext.createAnalyser()
				this.analyser.minDecibels = -90 //最小値
				this.analyser.maxDecibels = 0 //最大値
				this.analyser.smoothingTimeConstant = 0.65
				this.analyser.fftSize = 32

				const bufferLength: number = this.analyser.frequencyBinCount
				this.dataArray = new Uint8Array(bufferLength)
				this.analyser.getByteTimeDomainData(this.dataArray)
				source.connect(this.analyser)
			})
			.catch(error => {
				console.error(error)
				this.analyser = null
				this.dataArray = null
			})
	}

	getAudio(): void {
		if (!this.analyser || !this.dataArray) return

		this.analyser.getByteFrequencyData(this.dataArray)
	}

	get getVolume(): number {
		if (!this.analyser || !this.dataArray) return 0

		const totalVolume = this.dataArray.reduce(
			(sum, element) => sum + element,
			0
		)
		return Math.ceil(totalVolume / this.dataArray.length)
	}

	get getHue(): number {
		if (!this.analyser || !this.dataArray) return 0

		const maxValue: number = Math.max(...this.dataArray)
		const maxIndex: number = this.dataArray.indexOf(maxValue)
		const randRange = (min: number, max: number): number =>
			Math.floor(Math.random() * (max - min + 1) + min)
		let h: number
		switch (maxIndex) {
			case 0:
				h = randRange(186, 265)
				break
			case 1:
				h = randRange(85, 186)
				break
			case 2:
				h = randRange(59, 85)
				break
			case 3:
				h = randRange(41, 59)
				break
			case 4:
				h = randRange(3, 41)
				break
			case 5:
				h = randRange(265 - 360, 3)
				if (h < 0) h = 360 - h
				break
			default:
				h = randRange(265 - 360, 3)
				if (h < 0) h = 360 - h
				break
		}

		return h
	}
}

export default new Microphone()
