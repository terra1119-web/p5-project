'use strict'
import Sketch from '@/class/Sketch.js'

// variables
class SketchTest extends Sketch {
	preload(s) {
		super.preload(s)
	}

	setup(s) {
		super.setup(s)
	}

	draw(s) {
		super.draw(s)
	}

	mousePressed(s) {
		super.mousePressed(s)
	}

	keyTyped(s) {
		super.keyTyped(s)
	}

	keyPressed(s) {
		super.keyPressed(s)
	}

	doubleClicked(s) {
		super.doubleClicked(s)
	}
}

export default function () {
	const sketch = new SketchTest()
	sketch.init()
}

/*
import deadpixel.keystone.*;
import processing.video.*;

Keystone ks;
CornerPinSurface surface;
PGraphics offscreen;

Movie movie;

ArrayList < PImage > imgs;

String[] movie_name_array = {
	//"a.mp4",
	"Animals - 6572.mp4",
	//"b.mov",
	"Bottle - 754.mp4",
	"c.mp4",
	"g.mp4",
	"h.mp4",
	"Milk - 4315.mp4",
	"Mountains - 6872.mp4",
	"Natural Landscapes - 1613.mp4",
	"Rose - 3654.mp4",
	"Running Sushi - 3625.mp4",
	"Shoes - 3627.mp4",
	"Synthesizer - 3239.mp4",
	"Synthesizer - 6488.mp4",
	"Vegetables - 4572.mp4",
	"Water Dragon - 3779.mp4",
	"Massage - 701.mp4",
	"Parrot - 9219.mp4",
	"Woodhouse'S Toad - 397.mp4",
	"A Wet Hawk.mp4",
	"Video Of Jellyfishes Inside Of Aquarium.mp4",
	"Pexels Videos 3563.mp4",
	"Pexels Videos 1526909.mp4"
  //"buri01.mp4",
  //"buri02.mp4",
  //"buri03.mp4",
  //"buri04.mp4",
  //"buri04.mp5",
  //"Running Sushi - 3625.mp4"
};

String[] rand_arr;
String[] temp_arr;

int play_max;
int play_count = 0;

int time_count = 0;
int time_max = 5400;

int split_time_count = 0;
int split_time_max = 900;

int col_count = 0;
int col = 1;
int col_max = 3;

int movie_width;
int movie_height;

float[][] rgb_array = {
  { 0, 0, 0 }
};

void setup() {
	background(0);
	fullScreen(P3D, 2);
	frameRate(30);

	ks = new Keystone(this);
	surface = ks.createCornerPinSurface(width, height, 20);
	offscreen = createGraphics(width, height, P3D);

	imgs = new ArrayList < PImage > ();
	play_max = movie_name_array.length;

	initArray();

	init();

	try {
		ks.load();
	} catch (NullPointerException e) { }

}

void init(){
	String movie_name = rand_arr[play_count];
	movie = new Movie(this, movie_name);
	movie.loop();

	col = 1;
	col_count = 0;
	split_time_count = 0;

	movie_width = offscreen.width / col;
	movie_height = offscreen.height / col;

	rgb_array[0] = new float[3];
	for (int i = 0; i < col; i++) {
		rgb_array[i][0] = round(random(255));
		rgb_array[i][1] = round(random(255));
		rgb_array[i][2] = round(random(255));
	}

};

void initArray(){
	String[] clone = movie_name_array.clone();
	rand_arr = new String[clone.length];
	temp_arr = null;
	int rand_num = 0;
	for (int i = 0; i < rand_arr.length; i++) {
		temp_arr = new String[1];
		rand_num = int(random(clone.length));

		temp_arr = subset(clone, rand_num, 1);
		rand_arr[i] = temp_arr[0];

		temp_arr = new String[clone.length - 1];

		int count = 0;

		for (int j = 0; j < clone.length; j++) {

			if (j != rand_num) {
				temp_arr[count] = clone[j];
				count += 1;
			}
		}
		clone = temp_arr;
	}
}

void initSplit(){
	col *= 2;
	col_count++;
	if (col_count >= col_max) {
		col = 1;
		col_count = 0;
	}

	movie_width = offscreen.width / col;
	movie_height = offscreen.height / col;

	int num = col * col;
	rgb_array = new float[num][3];
	for (int i = 0; i < num; i++) {
		rgb_array[i][0] = round(random(255));
		rgb_array[i][1] = round(random(255));
		rgb_array[i][2] = round(random(255));
	}

}

void draw() {
	background(0);

	if (imgs.size() > 10) {
		for (int n = 0; n < imgs.size(); n++) {
			g.removeCache(imgs.get(n));
		}
		imgs.clear();
		System.gc();
	}
	PImage tmp = movie.get();
	imgs.add(tmp);
	g.removeCache(tmp);

	split_time_count++;
	if (split_time_max < split_time_count) {
		split_time_count = 0;
		initSplit();
	}

	time_count++;
	if (time_max < time_count) {
		play_count++;
		if (play_max <= play_count) {
			play_count = 0;
			initArray();
		}
		time_count = 0;

		movie.stop();
		movie.dispose();
		movie = null;

		init();
	}

	offscreen.beginDraw();
	offscreen.background(0);

	int nn = 0;
	for (int i = 0; i < col; i++) {
		for (int j = 0; j < col; j++) {
			offscreen.tint(rgb_array[nn][0], rgb_array[nn][1], rgb_array[nn][2]);
			offscreen.image(movie, movie_width * i, movie_height * j, offscreen.width / col, offscreen.height / col);
			nn++;
		}
	}
	g.removeCache(movie);
	offscreen.endDraw();

	surface.render(offscreen);

}

void keyPressed() {
	switch (key) {
		case 'c':
			// enter/leave calibration mode, where surfaces can be warped
			// and moved
			ks.toggleCalibration();
			break;

		case 'l':
			// loads the saved layout
			ks.load();
			break;

		case 's':
			// saves the layout
			ks.save();
			break;
	}
}

void movieEvent(Movie m) {
	m.read();
}

void stop() {
	for (int n = 0; n < imgs.size(); n++) {
		g.removeCache(imgs.get(n));
	}
	imgs.clear();

	movie.stop();
	movie.dispose();
	movie = null;
	System.gc();
	super.stop();
}
*/