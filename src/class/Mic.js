export default class Mic {
	constructor() {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((stream) => {
			this.context = new AudioContext();
			this.input = this.context.createMediaStreamSource(stream)
			this.analayzer = this.context.createAnalyser()
			this.input.connect(this.analayzer)
			this.processor = this.context.createScriptProcessor(1024 * 2, 1, 1)
			this.analayzer.connect(this.processor)
			this.processor.connect(this.context.destination)
			this.spectrum = []
			this.res = 0
			this.processor.onaudioprocess = () => {
				this.spectrum = new Uint8Array(this.analayzer.frequencyBinCount)
				this.analayzer.getByteFrequencyData(this.spectrum)
				this.res = this.spectrum.reduce((a, b) => Math.max(a, b))
			}
		})
	}

	getLevel() {
		return this.res
	}

	close() {
		this.context.close()
	}
}