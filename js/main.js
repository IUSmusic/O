import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js";

const modelSlots = document.querySelectorAll(".model-slot");
const overlay = document.getElementById("systemOverlay");
const pullZone = document.getElementById("pullZone");
const closeButton = document.getElementById("overlayCloseButton");
const screenRoot = document.getElementById("screenRoot");

const scenes = [];
const clock = new THREE.Clock();

pullZone?.addEventListener("click", () => {
  overlay?.classList.add("is-open");
  overlay?.setAttribute("aria-hidden", "false");
  screenRoot?.classList.add("overlay-open");
});

closeButton?.addEventListener("click", () => {
  overlay?.classList.remove("is-open");
  overlay?.setAttribute("aria-hidden", "true");
  screenRoot?.classList.remove("overlay-open");
});

function makeGlowSprite(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 8, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.18, "rgba(255,255,255,0.55)");
  g.addColorStop(0.38, "rgba(255,255,255,0.16)");
  g.addColorStop(0.7, "rgba(255,255,255,0.05)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildOuterGlow(mode) {
  const group = new THREE.Group();
  const tex = makeGlowSprite();
  const material = new THREE.SpriteMaterial({
    map: tex,
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    opacity: mode === "overlay" ? 0.9 : 0.78,
    toneMapped: false
  });

  const s1 = new THREE.Sprite(material.clone());
  s1.scale.setScalar(mode === "overlay" ? 7.3 : 2.3);
  group.add(s1);

  const s2 = new THREE.Sprite(material.clone());
  s2.material.opacity = mode === "overlay" ? 0.35 : 0.28;
  s2.scale.setScalar(mode === "overlay" ? 9.4 : 2.9);
  group.add(s2);

  return group;
}

function tuneMaterial(mat, mode) {
  if (!mat) return;
  if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
  if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
  if (mat.normalMap) mat.normalScale?.set?.(1, 1);

  // The uploaded GLB has no emissive map. Re-use the color map as emissive
  // so the bright texture areas actually glow instead of only reflecting lights.
  if ("emissive" in mat) {
    mat.emissive = new THREE.Color(1, 1, 1);
  }
  if (!mat.emissiveMap && mat.map) {
    mat.emissiveMap = mat.map;
  }
  if ("emissiveIntensity" in mat) {
    mat.emissiveIntensity = mode === "overlay" ? 1.55 : 1.1;
  }

  // The GLB comes in extremely rough and metallic. That makes it read dull/flat
  // unless exposure is pushed so high that it blows out. Dial these back.
  if ("roughness" in mat) mat.roughness = mode === "overlay" ? 0.16 : 0.2;
  if ("metalness" in mat) mat.metalness = 0.08;
  if ("clearcoat" in mat) mat.clearcoat = 1.0;
  if ("clearcoatRoughness" in mat) mat.clearcoatRoughness = 0.14;
  if ("envMapIntensity" in mat) mat.envMapIntensity = mode === "overlay" ? 0.65 : 0.5;

  mat.transparent = false;
  mat.opacity = 1;
  mat.needsUpdate = true;
}

function setMaterialTuning(root, mode) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = false;
    obj.receiveShadow = false;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    materials.forEach((mat) => tuneMaterial(mat, mode));
  });
}

function frameModel(camera, radius, aspect, mode) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const fit = mode === "overlay" ? 1.48 : 1.24;
  const distV = radius / Math.sin(vFov / 2);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const distH = radius / Math.sin(hFov / 2);
  const dist = Math.max(distV, distH) / fit;
  camera.position.set(
    mode === "overlay" ? 0.16 * dist : 0.12 * dist,
    mode === "overlay" ? 0.06 * dist : 0.04 * dist,
    dist
  );
  camera.near = Math.max(0.01, dist / 100);
  camera.far = dist * 20;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

function buildScene(slot, modelPath) {
  const mode = slot.classList.contains("overlay-model-slot") ? "overlay" : "button";

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = mode === "overlay" ? 1.15 : 1.02;
  slot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mode === "overlay" ? 24 : 28, 1, 0.01, 100);

  // Keep lighting simple and neutral. RoomEnvironment + huge exposure was washing the model out.
  scene.add(new THREE.AmbientLight(0xffffff, mode === "overlay" ? 0.65 : 0.52));

  const key = new THREE.PointLight(0xffffff, mode === "overlay" ? 13 : 10, 0, 2);
  key.position.set(0.8, 1.2, 2.8);
  scene.add(key);

  const fill = new THREE.PointLight(0xffffff, mode === "overlay" ? 4.5 : 3.5, 0, 2);
  fill.position.set(-2.1, -1.2, 1.7);
  scene.add(fill);

  const rim = new THREE.PointLight(0xffffff, mode === "overlay" ? 5.2 : 4.1, 0, 2);
  rim.position.set(0, 0, -3);
  scene.add(rim);

  const pivot = new THREE.Group();
  const modelWrap = new THREE.Group();
  const glow = buildOuterGlow(mode);
  pivot.add(glow);
  pivot.add(modelWrap);
  scene.add(pivot);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(256, 256),
    mode === "overlay" ? 1.15 : 0.78,
    mode === "overlay" ? 0.55 : 0.42,
    mode === "overlay" ? 0.22 : 0.32
  );
  composer.addPass(bloom);

  const loading = document.createElement("div");
  loading.className = "loading-badge";
  loading.textContent = "Loading 3D";
  slot.appendChild(loading);

  const state = {
    renderer,
    composer,
    scene,
    camera,
    slot,
    mode,
    key,
    fill,
    rim,
    pivot,
    modelWrap,
    glow,
    modelRadius: 1,
    baseY: 0,
    root: null
  };

  const resize = () => {
    const rect = slot.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    camera.aspect = width / height;
    frameModel(camera, state.modelRadius, camera.aspect, mode);
  };

  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const root = gltf.scene || gltf.scenes?.[0];
    if (!root) throw new Error("Model scene missing");

    setMaterialTuning(root, mode);

    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const sourceRadius = sphere.radius || 1;
    const targetRadius = mode === "overlay" ? 2.58 : 0.76;
    const scale = targetRadius / sourceRadius;
    root.scale.setScalar(scale);

    const adjustedBox = new THREE.Box3().setFromObject(root);
    const adjustedSphere = adjustedBox.getBoundingSphere(new THREE.Sphere());
    state.modelRadius = adjustedSphere.radius || targetRadius;

    root.rotation.x = THREE.MathUtils.degToRad(mode === "overlay" ? 10 : 12);
    root.rotation.y = THREE.MathUtils.degToRad(mode === "overlay" ? 18 : 14);
    root.rotation.z = THREE.MathUtils.degToRad(mode === "overlay" ? -6 : -7);

    const bottomY = adjustedBox.min.y;
    root.position.y -= bottomY * 0.02;
    state.baseY = root.position.y;
    state.root = root;

    const glowScale = state.modelRadius * (mode === "overlay" ? 1.7 : 1.92);
    state.glow.scale.setScalar(glowScale);

    modelWrap.add(root);
    slot.classList.add("has-model", "glb-loaded");
    loading.remove();
    resize();
  }, undefined, (error) => {
    console.error(error);
    loading.remove();
    const badge = document.createElement("div");
    badge.className = "model-error";
    badge.textContent = "3D failed";
    slot.appendChild(badge);
  });

  const observer = new ResizeObserver(resize);
  observer.observe(slot);
  resize();
  scenes.push(state);
}

for (const slot of modelSlots) {
  const path = slot.dataset.modelPath;
  if (path) buildScene(slot, path);
}

function animate() {
  const t = clock.getElapsedTime();

  for (const item of scenes) {
    const { mode, pivot, key, fill, rim, root, baseY, composer } = item;

    // Very small "floating in space" motion.
    const floatAmp = mode === "overlay" ? 0.018 : 0.006;
    const rotAmp = mode === "overlay" ? 0.025 : 0.012;

    pivot.position.y = Math.sin(t * 0.35) * floatAmp;
    pivot.position.x = Math.cos(t * 0.21) * floatAmp * 0.55;
    pivot.rotation.z = Math.sin(t * 0.18) * rotAmp;

    if (root) {
      root.position.y = baseY + Math.sin(t * 0.47) * floatAmp * 0.55;
      root.rotation.y += mode === "overlay" ? 0.0025 : 0.0014;
    }

    key.position.x = Math.cos(t * 0.23) * 2.8;
    key.position.y = 1.4 + Math.sin(t * 0.31) * 0.5;
    fill.position.x = -2.1 + Math.sin(t * 0.19) * 0.4;
    rim.position.y = Math.cos(t * 0.27) * 0.25;

    composer.render();
  }

  requestAnimationFrame(animate);
}
animate();
