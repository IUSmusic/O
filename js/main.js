import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/environments/RoomEnvironment.js";

const modelSlots = document.querySelectorAll('.model-slot');
const overlay = document.getElementById('systemOverlay');
const pullZone = document.getElementById('pullZone');
const statusBar = document.getElementById('statusBar');
const closeButton = document.getElementById('overlayCloseButton');
const screenRoot = document.getElementById('screenRoot');

const ROTATION_SPEED = 0.18;
const FLOAT_SPEED = 0.7;
const LIGHT_ORBIT_SPEED = 0.42;
const scenes = [];

function buildGlowShell(mode) {
  const shell = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(mode === 'overlay' ? 1.12 : 0.98, 64, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0xf6f6f6,
      emissive: 0xffffff,
      emissiveIntensity: mode === 'overlay' ? 0.22 : 0.18,
      roughness: 0.24,
      metalness: 0.04,
      transmission: 0.0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.15,
      transparent: true,
      opacity: 0.94
    })
  );

  shell.add(core);
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

      // Preserve the GLB authoring instead of repainting the model into a dull gray STL-like sphere.
      if ('color' in mat && mat.color) {
        mat.color.setRGB(1, 1, 1);
      }

      if ('roughness' in mat) {
        const base = typeof mat.roughness === 'number' ? mat.roughness : 0.18;
        mat.roughness = Math.min(base, mode === 'overlay' ? 0.16 : 0.2);
      }

      if ('metalness' in mat) {
        const base = typeof mat.metalness === 'number' ? mat.metalness : 0.08;
        mat.metalness = Math.min(base, 0.12);
      }

      if ('clearcoat' in mat) mat.clearcoat = Math.max(mat.clearcoat || 0, 1);
      if ('clearcoatRoughness' in mat) mat.clearcoatRoughness = Math.min(mat.clearcoatRoughness || 0.12, 0.16);

      if ('envMapIntensity' in mat) {
        const base = typeof mat.envMapIntensity === 'number' ? mat.envMapIntensity : 1;
        mat.envMapIntensity = Math.max(base, mode === 'overlay' ? 3.8 : 3.1);
      }

      if ('emissive' in mat && mat.emissive) {
        mat.emissive.setRGB(1, 1, 1);
      }

      if ('emissiveIntensity' in mat) {
        const base = typeof mat.emissiveIntensity === 'number' ? mat.emissiveIntensity : 0;
        mat.emissiveIntensity = Math.max(base, mode === 'overlay' ? 0.95 : 0.7);
      }

      if ('toneMapped' in mat) mat.toneMapped = true;
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
  renderer.toneMappingExposure = mode === 'overlay' ? 3.55 : 2.95;
  renderer.setClearColor(0x000000, 0);
  slot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(mode === 'overlay' ? 26 : 30, 1, 0.01, 100);

  scene.add(new THREE.AmbientLight(0xffffff, mode === 'overlay' ? 2.8 : 2.25));
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa8a8a8, mode === 'overlay' ? 2.9 : 2.25));

  const key = new THREE.DirectionalLight(0xffffff, mode === 'overlay' ? 7.4 : 6.1);
  key.position.set(4, 5, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, mode === 'overlay' ? 3.8 : 2.8);
  fill.position.set(-5, 1.5, 5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, mode === 'overlay' ? 4.8 : 3.5);
  rim.position.set(-2, -2.5, -5);
  scene.add(rim);

  const top = new THREE.SpotLight(0xffffff, mode === 'overlay' ? 34 : 24, 0, 0.58, 0.8, 1);
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
    key, fill, rim,
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
    const targetRadius = mode === 'overlay' ? 2.95 : 0.98;
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

    const shellScale = state.modelRadius * (mode === 'overlay' ? 0.92 : 0.95);
    state.glowShell.scale.setScalar(shellScale);

    modelWrap.add(root);
    slot.classList.add('has-model', 'glb-loaded');
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
    item.pivot.rotation.x = THREE.MathUtils.degToRad(item.mode === 'overlay' ? -16 : -18) + Math.sin(t * 0.55) * 0.045;
    item.pivot.rotation.z = THREE.MathUtils.degToRad(item.mode === 'overlay' ? 12 : 10) + Math.cos(t * 0.42) * 0.03;

    const bob = Math.sin(t * FLOAT_SPEED) * (item.mode === 'overlay' ? 0.025 : 0.015);
    item.modelWrap.position.y = bob;
    item.glowShell.position.y = bob;

    const lightPhase = t * LIGHT_ORBIT_SPEED;
    item.key.position.set(4 + Math.cos(lightPhase) * 1.35, 5 + Math.sin(lightPhase * 0.8) * 0.65, 7 + Math.sin(lightPhase) * 1.1);
    item.fill.position.set(-5 + Math.sin(lightPhase * 0.9) * 1.1, 1.5 + Math.cos(lightPhase * 0.75) * 0.4, 5 - Math.cos(lightPhase) * 0.9);
    item.rim.position.set(-2 - Math.cos(lightPhase * 1.1) * 0.75, -2.5, -5 + Math.sin(lightPhase * 1.15) * 1.3);

    item.renderer.render(item.scene, item.camera);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

const openOverlay = () => {
  if (!overlay) return;
  overlay.classList.add('is-open');
  screenRoot?.classList.add('overlay-open');
  overlay.setAttribute('aria-hidden', 'false');
};

const closeOverlay = () => {
  if (!overlay) return;
  overlay.classList.remove('is-open');
  screenRoot?.classList.remove('overlay-open');
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
