// these are the variables you can use as inputs to your algorithms
console.log(fxhash)   // the 64 chars hex number fed to your algorithm
console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()

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

import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three-stdlib";

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
const pixelRatio = window.devicePixelRatio;

// setup three scene
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);

let renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true // to be able to save as PNG
});
renderer.setPixelRatio(pixelRatio);
renderer.setSize(windowWidth, windowHeight);
renderer.domElement.id = "three-canvas";
document.body.appendChild(renderer.domElement); // appebds three-canvas to dom

// camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 10;
controls.autoRotate = true;

// resize artwork appropriately when window dimensions change
window.addEventListener('resize', onWindowResize);

setup();
draw();

function setup() {
  // load gltf model
  let loader = new GLTFLoader().setPath('/gltf/');
  loader.load('mandala-bloom.glb', function (gltf) {
    scene.add(gltf.scene);
  });

  // add lights
  let dirLightColor = new THREE.Color(fxrand(), fxrand(), fxrand());
  let dirLight1 = new THREE.DirectionalLight(dirLightColor, 10.0);
  dirLight1.position.set(1, 100, 1);
  scene.add(dirLight1);

  let pointLightColor = new THREE.Color(fxrand(), 0, fxrand());
  let pointLight = new THREE.PointLight(pointLightColor, 150.0, 0);
  pointLight.position.set(0, 0, -100);
  scene.add(pointLight);
}

function draw() {
  requestAnimationFrame(draw);

  controls.update();

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
