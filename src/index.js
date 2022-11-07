import p5 from "p5";
import { handleKeyPress } from "./keypress"

// these are the variables you can use as inputs to your algorithms
console.log(fxhash)   // the 64 chars hex number fed to your algorithm
console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()
const seed = ~~(fxrand() * 123456789);

const numCircles = ~~(fxrand() * 500) + 100;

window.$fxhashFeatures = {
  "Density": numCircles > 500 ? "High" : (numCircles < 200 ? "Low" : "Medium")
}

// note about the fxrand() function 
// when the "fxhash" is always the same, it will generate the same sequence of
// pseudo random numbers, always

//----------------------
// defining features
//----------------------
// You can define some token features by populating the $fxhashFeatures property
// of the window object.
// More about it in the guide, section features:
// [https://fxhash.xyz/articles/guide-mint-generative-token#features]
//
// window.$fxhashFeatures = {
//   "Background": "Black",
//   "Number of lines": 10,
//   "Inverted": true
// }

// this code writes the values to the DOM as an example

const handleResize = () => {
  let style = cnv.canvas.style;
  style.height = p.windowWidth > p.windowHeight / aspect ? "100%" : "auto";
  style.width = p.windowWidth > p.windowHeight / aspect ? "auto" : "100%";
}

const sketch = (p5) => {
  const aspect = 297 / 210;

  p5.setup = function () {
    p5.noLoop();
    let h = p.windowHeight;
    let w = p.windowWidth;
    if (h / aspect < w) {
      h = p.max(h, 1000);
      w = p.floor(h / aspect);
    }
    else {
      w = p.max(w, 1000);
      h = p.floor(w * aspect);
    }
    cnv = p.createCanvas(w, h);
    handleResize();
    // p5 background doesn't take aspect ratio into account?
    p5.push();
    p5.noStroke();
    p5.fill("#FFD");
    p5.rect(0, 0, p.width, p.height);
    p5.pop();
  };

  p5.draw = function () {
    p5.randomSeed(seed);
    p5.push();
    for (var i = numCircles; i >= 0; i--) {
      let c = p5.color(p5.random(["#50B", "#313", "#713"]));
      c.setAlpha(13);
      p5.fill(c);
      p5.noStroke();
      p5.circle(p5.random() * p5.width, p5.random() * p5.height, p5.abs(p5.randomGaussian(0, p5.height / 20)));
    }
    p5.pop();
  };

  p.keyPressed = () => {
    handleKeyPress(p, p.keyCode, cnv, seed);
  };

  p5.windowResized = handleResize;
}

let myp5 = new p5(sketch, window.document.body);
