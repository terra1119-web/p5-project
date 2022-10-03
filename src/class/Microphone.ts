'use strict'

class Microphone {
	analyser: AnalyserNode | null
	dataArray: Uint8Array | null
	volume: number
	id: number

	constructor() {
		this.analyser = null
		this.dataArray = null
		this.id = Math.floor(Math.random() * 10)

		navigator.mediaDevices.getUserMedia({audio: true, video: false})
		.then(stream => {
			const audioContext: AudioContext = new AudioContext()
			const source: MediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream)
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
			this.volume = 0
		})
	}

	getAudio(): void {
		if (!this.analyser || !this.dataArray) return
		this.analyser.getByteFrequencyData(this.dataArray)
	}

	get getVolume(): number {
		if (!this.analyser || !this.dataArray) return 0
		const totalVolume = this.dataArray.reduce((sum, element) => sum + element, 0)
		return Math.ceil(totalVolume / this.dataArray.length)
	}

	get getId(): number {
		return this.id
	}
}

export default new Microphone()
