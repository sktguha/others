
// https://2478228.playcode.io/
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaee2ff); // Light blue sky

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

// Island (with texture)
let island = null;
const loader = new THREE.TextureLoader();
loader.load(
  'https://iili.io/FvNKWla.jpg',
  (texture) => {
    // const geometry = new THREE.PlaneGeometry(10, 10, 1, 1);
    // const material = new THREE.MeshStandardMaterial({ map: texture });
    // island = new THREE.Mesh(geometry, material);
    // island.rotation.x = -Math.PI / 2;
    // island.receiveShadow = true;
    // scene.add(island);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20); // Repeat 20x20 across the 200x200 plane

    const geometry = new THREE.PlaneGeometry(200, 200, 1, 1);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    island = new THREE.Mesh(geometry, material);
    island.rotation.x = -Math.PI / 2;
    island.receiveShadow = true;
    scene.add(island);
  },
  undefined,
  (err) => {
    console.error('Texture failed to load', err);
  }
);

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

  // Camera movement
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
