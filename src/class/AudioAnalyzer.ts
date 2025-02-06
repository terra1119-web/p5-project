import p5 from 'p5'

export default class AudioAnalyzer {
	fft: p5.FFT | null
	mic: p5.AudioIn | null
	p: p5

	constructor(p: p5) {
		this.p = p
		this.fft = null
		this.mic = null
	}

	setup(): void {
		this.mic = new p5.AudioIn()
		this.p.userStartAudio().then(() => {
			this.mic.start()
			this.fft = new p5.FFT()
			this.fft.setInput(this.mic)
		})
	}

	dispose(): void {
		if (this.mic) this.mic.stop()
		this.mic = null
		this.fft = null
	}

	getHue(): number {
		if (!this.fft) return 0
		this.fft.analyze()
		const freq = this.fft.getCentroid()
		const hue = this.p.map(freq, 0, 3000, 0, 360)
		return hue
	}

	getVolume(): number {
		if (!this.mic) return 0
		return this.mic.getLevel() || 0
	}

	getVolumeEachBand(): number[] {
		if (!this.fft) return [0, 0, 0, 0, 0]
		this.fft.analyze()
		const bass = this.fft.getEnergy('bass')
		const lowMid = this.fft.getEnergy('lowMid')
		const mid = this.fft.getEnergy('mid')
		const highMid = this.fft.getEnergy('highMid')
		const treble = this.fft.getEnergy('treble')
		return [treble, highMid, mid, lowMid, bass]
	}
}
