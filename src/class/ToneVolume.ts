'use strict'
import * as Tone from 'tone'

export default class ToneVolume {
	mic: Tone.UserMedia
	meter: Tone.Meter

	constructor() {
	}

	async init(): Promise<void> {
		this.meter = new Tone.Meter()
		this.mic = new Tone.UserMedia()
		await this.mic.open()
		this.mic.connect(this.meter)
	}

	get getVolume(): number | number[] {
		return this.meter.getValue()
	}
}