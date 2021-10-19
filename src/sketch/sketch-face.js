'use strict'
import Sketch from '@/class/Sketch.js'
import ml5 from 'ml5'

// variables
let mask
let mask2
let mask_array = []
let video
let faceapi
let detections
let _this

class SketchTest extends Sketch {
	preload (s) {
		super.preload()
		mask = s.loadImage('images/mask.png')
		mask2 = s.loadImage('images/sabito.png')
		mask_array = [mask, mask2]
	}

	setup (s) {
		super.setup()

		_this = this
		s.background(0)
		mask.loadPixels()
		mask2.loadPixels()

		video = s.createCapture(s.VIDEO)
		video.size(s.width, s.height)
		video.hide()

		const detectionOptions = {
			withLandmarks: true,
			withDescriptors: false,
		}
		faceapi = ml5.faceApi(video, detectionOptions, this.modelLoaded)
	}

	modelLoaded () {
		faceapi.detect(_this.gotFaces)
	}

	gotFaces (error, result) {
		if (error) {
			console.log(error)
			return
		}
		detections = result

		if (!_this) return

		_this.s.background(0)
		_this.s.push()
		_this.s.translate(_this.s.width, 0)
		_this.s.scale(-1, 1)
		_this.s.image(video, 0, 0, _this.s.width, _this.s.height)

		if (detections && detections.length > 0) {
			let ii = 0
			for (let i = 0, len = detections.length; i < len; i++) {
				_this.s.image(
					mask_array[ii],
					detections[i].detection.box.left,
					detections[i].detection.box.top,
					detections[i].landmarks.imageWidth,
					detections[i].landmarks.imageHeight
				)
				ii++
				if (ii === 2) ii = 0
			}
		}
		_this.s.pop()

		faceapi.detect(_this.gotFaces)
	}

	dispose () {
		mask = null
		video.remove()
		video = null
		faceapi = null
		_this.gotFaces = null
		_this = null
		super.dispose()
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}