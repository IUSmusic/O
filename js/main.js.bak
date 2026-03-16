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

function buildGlowShell(mode) {
  const shell = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(mode === 'overlay' ? 1.2 : 1.02, 64, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xf6f6f6,
      emissive: 0xffffff,
      emissiveIntensity: mode === 'overlay' ? 0.34 : 0.26,
      roughness: 0.2,
      metalness: 0.05,
      transmission: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.16,
      envMapIntensity: 1.5,
      transparent: true,
      opacity: 0.98
    })
  );

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(mode === 'overlay' ? 1.42 : 1.18, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: mode === 'overlay' ? 0.12 : 0.10
    })
  );

  shell.add(halo, core);
  return shell;
}

function setMaterialTuning(root, mode) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = false;
    obj.receiveShadow = false;

    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach((mat) => {
      if (!mat) return;
      if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
      if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;

      if ('color' in mat && mat.color) mat.color.setRGB(0.96, 0.96, 0.96);
      if ('metalness' in mat) mat.metalness = 0.14;
      if ('roughness' in mat) mat.roughness = 0.22;
      if ('envMapIntensity' in mat) mat.envMapIntensity = mode === 'overlay' ? 2.5 : 2.2;
      if ('emissive' in mat && mat.emissive) mat.emissive.setRGB(0.9, 0.9, 0.9);
      if ('emissiveIntensity' in mat) mat.emissiveIntensity = mode === 'overlay' ? 0.55 : 0.42;
      if ('clearcoat' in mat) mat.clearcoat = 1.0;
      if ('clearcoatRoughness' in mat) mat.clearcoatRoughness = 0.18;
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
  renderer.toneMappingExposure = mode === 'overlay' ? 2.15 : 1.95;
  renderer.setClearColor(0x000000, 0);
  slot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(mode === 'overlay' ? 26 : 30, 1, 0.01, 100);

  scene.add(new THREE.AmbientLight(0xffffff, mode === 'overlay' ? 1.8 : 1.55));
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a6a6a, mode === 'overlay' ? 2.0 : 1.75));

  const key = new THREE.DirectionalLight(0xffffff, mode === 'overlay' ? 5.6 : 4.8);
  key.position.set(4, 5, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xf2f2f2, mode === 'overlay' ? 2.6 : 2.1);
  fill.position.set(-5, 1.5, 5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, mode === 'overlay' ? 3.4 : 2.8);
  rim.position.set(-2, -2.5, -5);
  scene.add(rim);

  const top = new THREE.SpotLight(0xffffff, mode === 'overlay' ? 26 : 20, 0, 0.58, 0.8, 1);
  top.position.set(0, 5, 3.5);
  top.target.position.set(0, 0, 0);
  scene.add(top, top.target);

  const pivot = new THREE.Group();
  const modelWrap = new THREE.Group();
  const glowShell = buildGlowShell(mode);
  pivot.add(glowShell);
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
    renderer, scene, camera, pivot, modelWrap, glowShell, slot, pmrem, mode,
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

    setMaterialTuning(root, mode);

    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius || Math.max(size.x, size.y, size.z) * 0.5 || 1;
    const targetRadius = mode === 'overlay' ? 1.18 : 0.98;
    const scale = targetRadius / radius;
    root.scale.setScalar(scale);

    const adjustedBox = new THREE.Box3().setFromObject(root);
    const adjustedSphere = adjustedBox.getBoundingSphere(new THREE.Sphere());
    state.modelRadius = adjustedSphere.radius;

    root.rotation.x = THREE.MathUtils.degToRad(mode === 'overlay' ? 14 : 16);
    root.rotation.y = THREE.MathUtils.degToRad(mode === 'overlay' ? 28 : 24);
    root.rotation.z = THREE.MathUtils.degToRad(mode === 'overlay' ? -8 : -10);

    const bottomY = adjustedBox.min.y;
    root.position.y -= bottomY * 0.015;
    state.baseY = root.position.y;

    const shellScale = state.modelRadius * (mode === 'overlay' ? 0.98 : 0.99);
    state.glowShell.scale.setScalar(shellScale);

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
    const bob = Math.sin(t * FLOAT_SPEED) * (item.mode === 'overlay' ? 0.025 : 0.015);
    item.modelWrap.position.y = bob;
    item.glowShell.position.y = bob;
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
