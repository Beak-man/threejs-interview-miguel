// Interactive exhibit: rotating platform observed by a tracking turret.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x33373d);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(6, 5, 8);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(5, 8, 4);
scene.add(sun);

// --- Rotating circular platform ---
const PLATFORM_RADIUS = 3;
const PLATFORM_HEIGHT = 0.3;
const PLATFORM_SPIN_SPEED = 0.4; // rad/s on Y

const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(PLATFORM_RADIUS, PLATFORM_RADIUS, PLATFORM_HEIGHT, 48),
  new THREE.MeshStandardMaterial({ color: 0x6b7c8c }),
);
platform.position.y = PLATFORM_HEIGHT / 2;
scene.add(platform);

// A stripe so the platform's rotation is visible.
const stripe = new THREE.Mesh(
  new THREE.BoxGeometry(PLATFORM_RADIUS * 1.8, 0.02, 0.25),
  new THREE.MeshStandardMaterial({ color: 0xd9b24a }),
);
stripe.position.y = PLATFORM_HEIGHT / 2 + 0.01;
platform.add(stripe);

// --- Drone flying a fast 3D parametric path ---
const drone = new THREE.Mesh(
  new THREE.ConeGeometry(0.25, 0.6, 8),
  new THREE.MeshStandardMaterial({ color: 0xe05545 }),
);
scene.add(drone);

const DRONE_SPEED = 1.6; // path parameter rate — fast enough to outrun the turret
const dronePrevPos = new THREE.Vector3();

function updateDrone(t: number): void {
  const a = t * DRONE_SPEED;
  // Orbit around the platform with a wobbling radius and bobbing height.
  const radius = 4 + 1.5 * Math.sin(a * 0.7);
  const x = radius * Math.cos(a);
  const z = radius * Math.sin(a);
  const y = 2.5 + 1.5 * Math.sin(a * 1.3);

  dronePrevPos.copy(drone.position);
  drone.position.set(x, y, z);

  // Orient the drone nose-first along its velocity.
  if (dronePrevPos.lengthSq() > 0) {
    const dir = drone.position.clone().sub(dronePrevPos);
    if (dir.lengthSq() > 1e-8) {
      const up = new THREE.Vector3(0, 1, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(up, dir.normalize());
      drone.quaternion.copy(q);
    }
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function render() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  platform.rotation.y += PLATFORM_SPIN_SPEED * delta;
  updateDrone(elapsed);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
