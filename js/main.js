import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/environments/RoomEnvironment.js";

const modelSlots = document.querySelectorAll('.model-slot');
const overlay = document.getElementById('systemOverlay');
const pullZone = document.getElementById('pullZone');
const statusBar = document.getElementById('statusBar');
const closeButton = document.getElementById('overlayCloseButton');

const ROTATION_SPEED = 0.18;
const FLOAT_SPEED = 0.7;
const scenes = [];

function setMaterialTuning(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = false;
    obj.receiveShadow = false;

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach((mat) => {
      if (!mat) return;
      if ('metalness' in mat) mat.metalness = Math.min(1, Math.max(0.55, mat.metalness ?? 0.8));
      if ('roughness' in mat) mat.roughness = Math.min(0.45, Math.max(0.18, mat.roughness ?? 0.35));
      if ('envMapIntensity' in mat) mat.envMapIntensity = 1.9;
      if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
      if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
      mat.needsUpdate = true;
    });
  });
}

function frameModel(camera, radius, aspect, mode) {
  const fitOffset = mode === 'overlay' ? 1.55 : 1.24;
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const distanceV = radius / Math.sin(vFov / 2);
  const distanceH = radius / Math.sin(hFov / 2);
  const distance = Math.max(distanceV, distanceH) / fitOffset;

  camera.position.set(
    mode === 'overlay' ? 0.44 * distance : 0.3 * distance,
    mode === 'overlay' ? 0.22 * distance : 0.12 * distance,
    distance
  );
  camera.near = Math.max(0.01, distance / 100);
  camera.far = distance * 20;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

function buildScene(slot, modelPath) {
  const mode = slot.classList.contains('overlay-model-slot') ? 'overlay' : 'button';
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mode === 'overlay' ? 1.42 : 1.32;
  renderer.setClearColor(0x000000, 0);
  slot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(mode === 'overlay' ? 26 : 30, 1, 0.01, 100);

  scene.add(new THREE.AmbientLight(0xffffff, mode === 'overlay' ? 0.9 : 0.75));

  const key = new THREE.DirectionalLight(0xffffff, mode === 'overlay' ? 3.5 : 3.0);
  key.position.set(4, 5, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbfd8ff, mode === 'overlay' ? 1.75 : 1.35);
  fill.position.set(-5, 1.5, 5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, mode === 'overlay' ? 2.2 : 1.8);
  rim.position.set(-2, -2.5, -5);
  scene.add(rim);

  const top = new THREE.SpotLight(0xffffff, mode === 'overlay' ? 18 : 14, 0, 0.55, 0.8, 1);
  top.position.set(0, 5, 3.5);
  top.target.position.set(0, 0, 0);
  scene.add(top, top.target);

  const pivot = new THREE.Group();
  const modelWrap = new THREE.Group();
  pivot.add(modelWrap);
  scene.add(pivot);

  pivot.rotation.x = THREE.MathUtils.degToRad(mode === 'overlay' ? -16 : -18);
  pivot.rotation.z = THREE.MathUtils.degToRad(mode === 'overlay' ? 12 : 10);

  const loading = document.createElement('div');
  loading.className = 'loading-badge';
  loading.textContent = 'Loading 3D';
  slot.appendChild(loading);

  const loader = new GLTFLoader();
  const state = {
    renderer, scene, camera, pivot, modelWrap, slot, pmrem, mode,
    modelRadius: 1,
    baseY: 0,
  };

  const resize = () => {
    const rect = slot.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    frameModel(camera, state.modelRadius, camera.aspect, mode);
  };

  loader.load(modelPath, (gltf) => {
    const root = gltf.scene || gltf.scenes?.[0];
    if (!root) throw new Error('Model scene missing');

    setMaterialTuning(root);

    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius || Math.max(size.x, size.y, size.z) * 0.5 || 1;
    const targetRadius = mode === 'overlay' ? 1.58 : 1.34;
    const scale = targetRadius / radius;
    root.scale.setScalar(scale);

    const adjustedBox = new THREE.Box3().setFromObject(root);
    const adjustedSphere = adjustedBox.getBoundingSphere(new THREE.Sphere());
    state.modelRadius = adjustedSphere.radius;

    root.rotation.x = THREE.MathUtils.degToRad(mode === 'overlay' ? 10 : 12);
    root.rotation.y = THREE.MathUtils.degToRad(mode === 'overlay' ? 22 : 18);
    root.rotation.z = THREE.MathUtils.degToRad(mode === 'overlay' ? -6 : -8);

    const bottomY = adjustedBox.min.y;
    root.position.y -= bottomY * 0.02;
    state.baseY = root.position.y;

    modelWrap.add(root);
    slot.classList.add('has-model');
    loading.remove();
    resize();
  }, undefined, (error) => {
    console.error(error);
    loading.textContent = '3D failed';
    loading.className = 'model-error';
  });

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(slot);
  state.resizeObserver = ro;
  scenes.push(state);
}

for (const slot of modelSlots) {
  const modelPath = slot.dataset.modelPath;
  if (modelPath) buildScene(slot, modelPath);
}

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;

  for (const item of scenes) {
    item.pivot.rotation.y += ROTATION_SPEED * dt;
    item.modelWrap.position.y = Math.sin(t * FLOAT_SPEED) * (item.mode === 'overlay' ? 0.025 : 0.015);
    item.renderer.render(item.scene, item.camera);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

const openOverlay = () => {
  if (!overlay) return;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
};

const closeOverlay = () => {
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
};

pullZone?.addEventListener('click', openOverlay);
statusBar?.addEventListener('click', openOverlay);
closeButton?.addEventListener('click', closeOverlay);
overlay?.addEventListener('click', (event) => {
  if (event.target === overlay || event.target.classList.contains('system-overlay-panel')) {
    closeOverlay();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeOverlay();
});
