import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaee2ff);

// Camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 5, 7);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(0, 0, 0);
controls.update();

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Load textures and create block-pattern terrain
const loader = new THREE.TextureLoader();
const landURL = 'https://iili.io/FvNKWla.jpg';
const grassURL = 'https://iili.io/FvNKjHv.jpg';

const gridSize = 4;
const tileSize = 50;

Promise.all([
  loader.loadAsync(landURL),
  loader.loadAsync(grassURL),
]).then(([landTex, grassTex]) => {
  landTex.wrapS = landTex.wrapT = THREE.RepeatWrapping;
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  landTex.repeat.set(1, 1);
  grassTex.repeat.set(1, 1);

  const landMat = new THREE.MeshStandardMaterial({ map: landTex });
  const grassMat = new THREE.MeshStandardMaterial({ map: grassTex });

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const geometry = new THREE.PlaneGeometry(tileSize, tileSize);
      const material = decideMaterial(x, z, landMat, grassMat);
      const tile = new THREE.Mesh(geometry, material);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set(
        x * tileSize - (gridSize * tileSize) / 2 + tileSize / 2,
        0,
        z * tileSize - (gridSize * tileSize) / 2 + tileSize / 2
      );
      tile.receiveShadow = true;
      scene.add(tile);
    }
  }
});

function decideMaterial(x, z, landMat, grassMat) {
  const pattern = [
    ['l', 'g', 'l', 'g'],
    ['g', 'g', 'l', 'l'],
    ['l', 'g', 'g', 'l'],
    ['g', 'l', 'g', 'l'],
  ];
  const char = pattern[z % pattern.length][x % pattern[0].length];
  return char === 'l' ? landMat : grassMat;
}

// Movement flags
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
const speed = 0.1;

// Keyboard input handling
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      moveForward = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      moveBackward = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      moveLeft = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      moveRight = true;
      break;
    case 'KeyE':
    case 'KeyT':
      moveUp = true;
      break;
    case 'KeyQ':
    case 'KeyG':
      moveDown = true;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      moveForward = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      moveBackward = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      moveLeft = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      moveRight = false;
      break;
    case 'KeyE':
    case 'KeyT':
      moveUp = false;
      break;
    case 'KeyQ':
    case 'KeyG':
      moveDown = false;
      break;
  }
});

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.y = 0;
  direction.normalize();

  const strafe = new THREE.Vector3().crossVectors(camera.up, direction).normalize();

  if (moveForward) camera.position.addScaledVector(direction, speed);
  if (moveBackward) camera.position.addScaledVector(direction, -speed);
  if (moveLeft) camera.position.addScaledVector(strafe, speed);
  if (moveRight) camera.position.addScaledVector(strafe, -speed);
  if (moveUp) camera.position.y += speed;
  if (moveDown) camera.position.y -= speed;

  controls.target.copy(camera.position).add(direction);
  controls.update();

  renderer.render(scene, camera);
}
animate();
