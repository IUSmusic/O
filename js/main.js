import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const overlay = document.getElementById("systemOverlay");
const pullZone = document.getElementById("pullZone");
const closeButton = document.getElementById("overlayCloseButton");
const mainButton = document.getElementById("mainButton");
const screenRoot = document.getElementById("screenRoot");
const modelSlots = [...document.querySelectorAll(".model-slot")];
const scenes = [];
const clock = new THREE.Clock();

function openOverlay() {
  overlay?.classList.add("is-open");
  overlay?.setAttribute("aria-hidden", "false");
  screenRoot?.classList.add("screen-overlay-open");
}
function closeOverlay() {
  overlay?.classList.remove("is-open");
  overlay?.setAttribute("aria-hidden", "true");
  screenRoot?.classList.remove("screen-overlay-open");
}

pullZone?.addEventListener("click", openOverlay);
mainButton?.addEventListener("click", openOverlay);
closeButton?.addEventListener("click", closeOverlay);
overlay?.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeOverlay(); });

function createScene(slot) {
  const mode = slot.classList.contains("overlay-model-slot") ? "overlay" : "button";
  const modelPath = slot.dataset.modelPath;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mode === "overlay" ? 0.95 : 0.92;
  slot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mode === "overlay" ? 24 : 24, 1, 0.01, 100);

  scene.add(new THREE.AmbientLight(0xffffff, 1.08));

  const key = new THREE.DirectionalLight(0xffffff, 2.25);
  key.position.set(2.0, 1.4, 3.0);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.85);
  fill.position.set(-1.6, -0.7, 2.0);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 1.0);
  rim.position.set(0.1, 0.0, -2.4);
  scene.add(rim);

  const pivot = new THREE.Group();
  const modelWrap = new THREE.Group();
  pivot.add(modelWrap);
  scene.add(pivot);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(256, 256),
    mode === "overlay" ? 0.18 : 0.10,
    0.40,
    0.88
  ));

  const loading = document.createElement("div");
  loading.className = "loading-badge";
  loading.textContent = "Loading 3D";
  slot.appendChild(loading);

  const state = {
    slot, mode, renderer, composer, camera, pivot, modelWrap,
    root: null, modelRadius: 1
  };

  function tuneMaterials(root) {
    root.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of materials) {
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
        if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
        if ("color" in mat) mat.color.setRGB(1, 1, 1);
        if ("emissive" in mat) {
          mat.emissive = new THREE.Color(0.12, 0.12, 0.12);
          mat.emissiveIntensity = mode === "overlay" ? 0.18 : 0.12;
        }
        if ("roughness" in mat) mat.roughness = Math.min(mat.roughness ?? 1, 0.30);
        if ("metalness" in mat) mat.metalness = Math.min(mat.metalness ?? 0, 0.02);
        if ("envMapIntensity" in mat) mat.envMapIntensity = 0.2;
        mat.needsUpdate = true;
      }
    });
  }

  function resize() {
    const rect = slot.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    camera.aspect = width / height;

    const radius = state.modelRadius || 1;
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitFactor = mode === "overlay" ? 0.72 : 0.72;
    const dist = (radius / Math.sin(fov / 2)) * fitFactor;
    camera.position.set(mode === "overlay" ? 0.08 : 0.03, mode === "overlay" ? 0.02 : 0.01, dist);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const root = gltf.scene || gltf.scenes?.[0];
    if (!root) throw new Error("Model scene missing");

    tuneMaterials(root);

    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const sourceRadius = sphere.radius || 1;
    const targetRadius = mode === "overlay" ? 3.55 : 0.74;
    root.scale.setScalar(targetRadius / sourceRadius);

    const fitted = new THREE.Box3().setFromObject(root);
    const fittedSphere = fitted.getBoundingSphere(new THREE.Sphere());
    state.modelRadius = fittedSphere.radius || targetRadius;

    root.rotation.x = THREE.MathUtils.degToRad(mode === "overlay" ? 7 : 10);
    root.rotation.y = THREE.MathUtils.degToRad(mode === "overlay" ? 12 : 10);
    root.rotation.z = THREE.MathUtils.degToRad(mode === "overlay" ? -2 : -3);

    modelWrap.add(root);
    state.root = root;

    loading.remove();
    resize();
  }, undefined, (err) => {
    console.error(err);
    loading.remove();
    const badge = document.createElement("div");
    badge.className = "model-error";
    badge.textContent = "3D failed to load";
    slot.appendChild(badge);
  });

  new ResizeObserver(resize).observe(slot);
  resize();
  scenes.push(state);
}

for (const slot of modelSlots) createScene(slot);

function animate() {
  const t = clock.getElapsedTime();
  for (const s of scenes) {
    const drift = s.mode === "overlay" ? 0.008 : 0.003;
    s.pivot.position.y = Math.sin(t * 0.16) * drift;
    s.pivot.position.x = Math.cos(t * 0.11) * drift * 0.65;
    s.pivot.rotation.z = Math.sin(t * 0.09) * (s.mode === "overlay" ? 0.006 : 0.003);

    if (s.root) {
      s.root.rotation.y += s.mode === "overlay" ? 0.0010 : 0.0006;
      s.root.rotation.x += s.mode === "overlay" ? 0.00006 : 0.00003;
    }

    s.composer.render();
  }
  requestAnimationFrame(animate);
}
animate();
