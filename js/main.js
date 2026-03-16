import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

const modelSlots = document.querySelectorAll('.model-slot');
const overlay = document.getElementById('systemOverlay');
const pullZone = document.getElementById('pullZone');
const statusBar = document.getElementById('statusBar');
const closeButton = document.getElementById('overlayCloseButton');

const ROTATION_SPEED = 0.18;
const scenes = [];

function applyMaterials(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = false;
    obj.receiveShadow = false;
    if (!obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => {
      if ('transparent' in mat) mat.transparent = true;
      if ('depthWrite' in mat) mat.depthWrite = true;
      if ('side' in mat) mat.side = THREE.DoubleSide;
      if ('metalness' in mat && mat.metalness < 0.15) mat.metalness = 0.2;
      if ('roughness' in mat && mat.roughness > 0.9) mat.roughness = 0.82;
      if ('envMapIntensity' in mat && (!mat.envMapIntensity || mat.envMapIntensity < 1.1)) mat.envMapIntensity = 1.35;
      mat.needsUpdate = true;
    });
  });
}

function fitModelToSlot(root, camera, targetFill = 0.96) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);

  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const fovHorizontal = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
  const fitHeightDistance = sphere.radius / Math.tan(fov / 2);
  const fitWidthDistance = sphere.radius / Math.tan(fovHorizontal / 2);
  const distance = Math.max(fitHeightDistance, fitWidthDistance) / targetFill;

  camera.position.set(0, 0, Math.max(distance, 1.45));
  camera.near = Math.max(0.01, distance / 100);
  camera.far = Math.max(100, distance * 10);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();

  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2 / maxAxis;
  root.scale.setScalar(scale);
}

function buildScene(slot, modelPath) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.setClearColor(0x000000, 0);
  slot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.01, 100);
  camera.position.set(0, 0, 3.2);

  const ambient = new THREE.AmbientLight(0xffffff, 2.2);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x101018, 2.0);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 2.7);
  key.position.set(2.5, 2.8, 4.5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbfd5ff, 1.35);
  fill.position.set(-3.2, 1.2, 3.2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 1.7);
  rim.position.set(0, -2.6, -4.4);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  const loading = document.createElement('div');
  loading.className = 'loading-badge';
  loading.textContent = 'Loading 3D';
  slot.appendChild(loading);

  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const root = gltf.scene || gltf.scenes?.[0];
    if (!root) throw new Error('Model scene missing');

    applyMaterials(root);
    group.add(root);

    const isOverlay = slot.classList.contains('overlay-model-slot');
    fitModelToSlot(root, camera, isOverlay ? 0.9 : 0.985);
    slot.classList.add('has-model');
    loading.remove();
  }, undefined, (error) => {
    console.error(error);
    loading.textContent = '3D failed';
    loading.className = 'model-error';
  });

  const resize = () => {
    const rect = slot.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(slot);

  scenes.push({ renderer, scene, camera, group, slot, resize });
}

for (const slot of modelSlots) {
  const modelPath = slot.dataset.modelPath;
  if (modelPath) buildScene(slot, modelPath);
}

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  for (const item of scenes) {
    item.group.rotation.y += ROTATION_SPEED * dt;
    item.group.rotation.x = THREE.MathUtils.degToRad(-8);
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
