'use strict'
import Sketch from '@/class/Sketch'
import ml5 from 'ml5'

class SketchTest extends Sketch {
	constructor() {
		super({})
		// variables
		this.mask
		this.mask2
		this.mask_array = []
		this.video
		this.faceapi
		this.detections
		this.modelLoaded = this.modelLoaded.bind(this)
		this.gotFaces = this.gotFaces.bind(this)
	}

	preload() {
		super.preload()

		this.mask = this.p.loadImage('images/mask.png')
		this.mask2 = this.p.loadImage('images/sabito.png')
		this.mask_array = [this.mask, this.mask2]
	}

	setup() {
		super.setup()

		this.p.background(0)
		this.mask.loadPixels()
		this.mask2.loadPixels()

		this.video = this.p.createCapture(this.p.VIDEO)
		this.video.size(this.p.width, this.p.height)
		this.video.hide()

		const detectionOptions = {
			withLandmarks: true,
			withDescriptors: false,
		}
		this.faceapi = ml5.faceApi(this.video, detectionOptions, this.modelLoaded)
	}

	modelLoaded() {
		this.faceapi.detect(this.gotFaces)
	}

	gotFaces(error, result) {
		if (error) {
			console.log(error)
			return
		}

		this.detections = result
		if (!this.p) return

		this.p.background(0)
		this.p.push()
		this.p.translate(this.p.width, 0)
		this.p.scale(-1, 1)
		this.p.image(this.video, 0, 0, this.p.width, this.p.height)

		if (this.detections && this.detections.length > 0) {
			let ii = 0
			for (let i = 0, len = this.detections.length; i < len; i++) {
				this.p.image(
					this.mask_array[ii],
					this.detections[i].detection.box.left,
					this.detections[i].detection.box.top,
					this.detections[i].landmarks.imageWidth,
					this.detections[i].landmarks.imageHeight
				)
				ii++
				if (ii === 2) ii = 0
			}
		}
		this.p.pop()

		this.faceapi.detect(this.gotFaces)
	}

	dispose() {
		super.dispose()

		this.mask = null
		this.video.remove()
		this.video = null
		this.faceapi = null
		this.gotFaces = null
		// _this = null
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}