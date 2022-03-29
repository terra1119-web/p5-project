'use strict'
import Sketch from '@/class/Sketch.js'

// variables
const MATERIAL_MAX = 100
const DISTANCE = 1200
const TIME_MAX = 1000
const array = []
let no = 0
let theta = 0
let count = 0

const xRandomInt = (nMax, nMin) => {
	// nMinからnMaxまでのランダムな整数を返す
	const nRandomInt = Math.floor(Math.random()*(nMax-nMin+1))+nMin
	return nRandomInt
}

const spread = () => {
	no = xRandomInt(3, 0)
	// no = 4
	switch (no) {
		case 0 :
			for (let i = 0; i < MATERIAL_MAX; i++) {
				array[i] = []
				array[i][0] = Math.random() * 2000 - 1000
				array[i][1] = Math.random() * 2000 - 1000
				array[i][2] = Math.random() * 2000 - 1000
			}
			break;
		case 1 :
			for (let j = 0; j < MATERIAL_MAX; j++) {
				const r = 360 / MATERIAL_MAX * j
				array[j] = []
				array[j][0] = Math.cos(r * 4 * Math.PI / 180) * 200
				array[j][1] = Math.sin(r * 4 * Math.PI / 180) * 100
				array[j][2] = j * 7 - 100
			}
			break;
		case 2 :
			for (let k = 0; k < MATERIAL_MAX; k++) {
				const r = 360 / MATERIAL_MAX * k
				array[k] = []
				array[k][0] = Math.cos(r * Math.PI / 180) * 160
				array[k][1] = 0
				array[k][2] = Math.sin(r * Math.PI / 180) * 200
			}
			break;
		case 3 : {
			const anglePer = ((Math.PI * 2) * (MATERIAL_MAX / 10)) / MATERIAL_MAX
			let yPos = 0
			for (let l = 0; l < MATERIAL_MAX; l++) {
				array[l] = []
				array[l][0] = Math.cos(l * anglePer) * 200
				array[l][1] = yPos - 100
				array[l][2] = Math.sin(l * anglePer) * 200
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

class SketchTest extends Sketch {
	preload (s) {
		super.preload(s)
	}

	setup (s) {
		super.setup(s)

		s.noFill()
		s.stroke(255, 255, 255)
		spread()
	}

	draw (s) {
		super.draw(s)

		s.background(0)
		s.camera(
			DISTANCE * Math.sin(theta * Math.PI / 180),
			DISTANCE * Math.cos(theta * Math.PI / 180),
			DISTANCE * Math.cos(theta * Math.PI / 180),
			0, 0, 0
		)
		theta += 0.4
		s.push()
		for(let i = 0; i < MATERIAL_MAX; i++){
			s.translate(array[i][0], array[i][1], array[i][2])
			s.sphere(80)
		}
		s.pop()

		count++
		if (count > TIME_MAX) {
			count = 0
			spread()
		}
	}

	mousePressed (s) {
		super.mousePressed(s)
	}

	keyTyped (s) {
		super.keyTyped(s)
	}

	keyPressed (s) {
		super.keyPressed(s)
	}

	doubleClicked (s) {
		super.doubleClicked(s)
	}
}

export default function () {
	const sketch = new SketchTest('WEBGL', false)
	sketch.init()
}