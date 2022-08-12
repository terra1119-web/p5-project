'use strict'
import Sketch from '@/class/Sketch.js'
import ml5 from 'ml5'

class SketchTest extends Sketch {
	constructor () {
		super()
		// variables
		this.video
		this.poseNet
		this.poses = []
		this.emojiCode
	}

	setup () {
		super.setup()

		this.p.background(0)
		this.video = this.p.createCapture(this.p.VIDEO)
		this.video.size(this.p.width, this.p.height)

		this.poseNet = ml5.poseNet(this.video, this.modelReady)
		this.poseNet.on('pose', results => {
			this.poses = results
		})
		this.video.hide()

		this.p.textAlign(this.p.CENTER, this.p.CENTER)
		// emojiCode = s.floor(s.random(128512, 128592))
		this.emojiCode = 128049
	}

	draw () {
		super.draw()
		if (!this.p) return

		this.p.push()
		this.p.translate(this.p.width, 0)
		this.p.scale(-1, 1)
		this.p.image(this.video, 0, 0, this.p.width, this.p.height)
		this.p.blendMode(this.p.ADD)
		this.p.image(this.video, 0, 0, this.p.width, this.p.height)
		this.p.blendMode(this.p.BLEND)

		this.drawEmoji()
		this.p.pop()
	}

	modelReady () {
		console.log('modelReady')
	}

	drawEmoji () {
		// if (this.s.frameCount % 60 === 0) {
		// 	emojiCode = this.s.floor(this.s.random(128512, 128592))
		// }

		const emojiText = String.fromCodePoint(this.emojiCode)

		for (let i = 0; i < this.poses.length; i++) {
			let pose = this.poses[i].pose

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
				const dis = this.p.dist(rightX, rightY, leftX, leftY)
				this.p.blendMode(this.p.MULTIPLY)
				this.p.textSize(dis * 1.5)
				this.p.text(emojiText, noseX, noseY-100)
				this.p.text(emojiText, noseX, noseY-100)
				this.p.blendMode(this.p.BLEND)
			}
		}
	}

	dispose () {
		super.dispose()

		this.video.remove()
		this.video = null
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}