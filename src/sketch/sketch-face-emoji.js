'use strict'
import Sketch from '@/class/Sketch.js'
import ml5 from 'ml5'

// variables
let video
let poseNet
let poses = []
let emojiCode

class SketchTest extends Sketch {
	setup (s) {
		super.setup()

		s.background(0)
		video = s.createCapture(s.VIDEO)
		video.size(s.width, s.height)

		poseNet = ml5.poseNet(video, this.modelReady)
		poseNet.on('pose', results => {
			poses = results
		})
		video.hide()

		s.textAlign(s.CENTER, s.CENTER)
		// emojiCode = s.floor(s.random(128512, 128592))
		emojiCode = 128049
	}

	draw (s) {
		super.draw()
		s.push()
		s.translate(s.width, 0)
		s.scale(-1, 1)
		s.image(video, 0, 0, s.width, s.height)
		s.blendMode(s.ADD)
		s.image(video, 0, 0, s.width, s.height)
		s.blendMode(s.BLEND)

		this.drawEmoji()
		s.pop()
	}

	modelReady () {
		console.log('modelReady')
	}

	drawEmoji () {
		// if (this.s.frameCount % 60 === 0) {
		// 	emojiCode = this.s.floor(this.s.random(128512, 128592))
		// }

		const emojiText = String.fromCodePoint(emojiCode)

		for (let i = 0; i < poses.length; i++) {
			let pose = poses[i].pose

			const nosePoint = pose.keypoints[0]
			const leftEarPoint = pose.keypoints[3]
			const rightEarPoint = pose.keypoints[4]

			let noseX, noseY, leftX, leftY, rightX, rightY

			if (nosePoint.score > 0.2) {
				noseX = nosePoint.position.x
				noseY = nosePoint.position.y
			}

			if (leftEarPoint.score > 0.2) {
				leftX = leftEarPoint.position.x
				leftY = leftEarPoint.position.y
			}

			if (rightEarPoint.score > 0.2) {
				rightX = rightEarPoint.position.x
				rightY = rightEarPoint.position.y
			}

			if (rightX && rightY && leftX && leftY && noseX && noseY) {
				const dis = this.s.dist(rightX, rightY, leftX, leftY)
				this.s.blendMode(this.s.MULTIPLY)
				this.s.textSize(dis * 1.5)
				this.s.text(emojiText, noseX, noseY-100)
				this.s.text(emojiText, noseX, noseY-100)
				this.s.blendMode(this.s.BLEND)
			}
		}
	}

	dispose () {
		video.remove()
		video = null
		super.dispose()
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}