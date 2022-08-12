'use strict'
import Sketch from '@/class/Sketch.js'

class SketchTest extends Sketch {
	constructor () {
		super('WEBGL', false)
		// variables
		this.MATERIAL_MAX = 100
		this.DISTANCE = 1200
		this.TIME_MAX = 1000
		this.array = []
		this.no = 0
		this.theta = 0
		this.count = 0
	}

	setup () {
		super.setup()

		this.p.noFill()
		this.p.stroke(255, 255, 255)
		this.spread()
	}

	draw () {
		super.draw()

		this.p.background(0)
		this.p.camera(
			this.DISTANCE * Math.sin(this.theta * Math.PI / 180),
			this.DISTANCE * Math.cos(this.theta * Math.PI / 180),
			this.DISTANCE * Math.cos(this.theta * Math.PI / 180),
			0, 0, 0
		)
		this.theta += 0.4
		this.p.push()
		for(let i = 0; i < this.MATERIAL_MAX; i++){
			this.p.translate(this.array[i][0], this.array[i][1], this.array[i][2])
			this.p.sphere(80)
		}
		this.p.pop()

		this.count++
		if (this.count > this.TIME_MAX) {
			this.count = 0
			this.spread()
		}
	}

	xRandomInt (nMax, nMin) {
		// nMinからnMaxまでのランダムな整数を返す
		const nRandomInt = Math.floor(Math.random()*(nMax-nMin+1))+nMin
		return nRandomInt
	}

	spread () {
		this.no = this.xRandomInt(3, 0)
		// no = 4
		switch (this.no) {
			case 0 :
				for (let i = 0; i < this.MATERIAL_MAX; i++) {
					this.array[i] = []
					this.array[i][0] = Math.random() * 2000 - 1000
					this.array[i][1] = Math.random() * 2000 - 1000
					this.array[i][2] = Math.random() * 2000 - 1000
				}
				break;
			case 1 :
				for (let j = 0; j < this.MATERIAL_MAX; j++) {
					const r = 360 / this.MATERIAL_MAX * j
					this.array[j] = []
					this.array[j][0] = Math.cos(r * 4 * Math.PI / 180) * 200
					this.array[j][1] = Math.sin(r * 4 * Math.PI / 180) * 100
					this.array[j][2] = j * 7 - 100
				}
				break;
			case 2 :
				for (let k = 0; k < this.MATERIAL_MAX; k++) {
					const r = 360 / this.MATERIAL_MAX * k
					this.array[k] = []
					this.array[k][0] = Math.cos(r * Math.PI / 180) * 160
					this.array[k][1] = 0
					this.array[k][2] = Math.sin(r * Math.PI / 180) * 200
				}
				break;
			case 3 : {
				const anglePer = ((Math.PI * 2) * (this.MATERIAL_MAX / 10)) / this.MATERIAL_MAX
				let yPos = 0
				for (let l = 0; l < this.MATERIAL_MAX; l++) {
					this.array[l] = []
					this.array[l][0] = Math.cos(l * anglePer) * 200
					this.array[l][1] = yPos - 100
					this.array[l][2] = Math.sin(l * anglePer) * 200
					if( (l+1) % 10 == 0 ){
						yPos += 115
					}
				}
				break;
			}

			// case 4 : {
			// 	let yyPos = 0
			// 	let xPos = 0
			// 	for (let m = 0; m < MATERIAL_MAX; m++) {
			// 		array[m] = []
			// 		array[m][0] = xPos - 300
			// 		array[m][1] = yyPos - 300
			// 		array[m][2] = -500

			// 		xPos += 10
			// 		if( (m+1) % 10 == 0 ){
			// 			yyPos += 60
			// 			xPos = 0
			// 		}
			// 	}
			// 	break;
			// }
		}
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}