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

// --- Turret: yawing base (child of platform) + pitching head (child of base) ---
// Conventions: the head's barrel points down local +Z. Base yaw is rotation
// about local Y; head pitch is rotation about local X (negative X = up).
const turretBase = new THREE.Group();
turretBase.position.set(PLATFORM_RADIUS - 0.6, PLATFORM_HEIGHT / 2, 0);
platform.add(turretBase);

const pedestal = new THREE.Mesh(
  new THREE.CylinderGeometry(0.35, 0.45, 0.5, 24),
  new THREE.MeshStandardMaterial({ color: 0x4a545e }),
);
pedestal.position.y = 0.25;
turretBase.add(pedestal);

const HEAD_PIVOT_HEIGHT = 0.6;
const turretHead = new THREE.Group();
turretHead.position.y = HEAD_PIVOT_HEIGHT;
turretBase.add(turretHead);

const headBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.35, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x7a8794 }),
);
turretHead.add(headBody);

const barrel = new THREE.Mesh(
  new THREE.CylinderGeometry(0.07, 0.07, 0.9, 12),
  new THREE.MeshStandardMaterial({ color: 0x2f353b }),
);
barrel.rotation.x = Math.PI / 2; // cylinder's long axis onto +Z
barrel.position.z = 0.55;
turretHead.add(barrel);

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

// --- Turret tracking ---
// Exact target orientations are computed each frame in local space; the only
// smoothing is the hard 90 deg/s cap enforced via Quaternion.rotateTowards.
const MAX_TURRET_SPEED = Math.PI / 2; // 90 deg/s

const droneWorldPos = new THREE.Vector3();
const targetLocal = new THREE.Vector3();
const baseTargetQuat = new THREE.Quaternion();
const headTargetQuat = new THREE.Quaternion();
const targetEuler = new THREE.Euler();

function updateTurret(delta: number): void {
  drone.getWorldPosition(droneWorldPos);

  // The platform rotated this frame; refresh world matrices before any
  // world-to-local conversion.
  platform.updateMatrixWorld(true);

  // Base yaw: express the drone in the platform's local space (the base's
  // parent), aim local +Z at it, and build the exact target quaternion.
  targetLocal.copy(droneWorldPos);
  platform.worldToLocal(targetLocal);
  targetLocal.sub(turretBase.position);
  const targetYaw = Math.atan2(targetLocal.x, targetLocal.z);
  baseTargetQuat.setFromEuler(targetEuler.set(0, targetYaw, 0));
  turretBase.quaternion.rotateTowards(baseTargetQuat, MAX_TURRET_SPEED * delta);

  // The base just moved; refresh its subtree before computing in its space.
  turretBase.updateMatrixWorld(true);

  // Head pitch: express the drone in the base's local space (the head's
  // parent). Elevation angle, clamped so the head never dips below horizontal.
  targetLocal.copy(droneWorldPos);
  turretBase.worldToLocal(targetLocal);
  targetLocal.sub(turretHead.position);
  const horizontalDist = Math.hypot(targetLocal.x, targetLocal.z);
  const targetPitch = THREE.MathUtils.clamp(
    Math.atan2(targetLocal.y, horizontalDist),
    0,
    Math.PI / 2,
  );
  // Positive rotation.x pitches +Z downward, so pitch up is negative X.
  headTargetQuat.setFromEuler(targetEuler.set(-targetPitch, 0, 0));
  turretHead.quaternion.rotateTowards(headTargetQuat, MAX_TURRET_SPEED * delta);
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
  updateTurret(delta);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
