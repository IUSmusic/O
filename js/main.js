import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/environments/RoomEnvironment.js";

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

function makeGlowSprite(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  // Atmospheric blue-white rim glow matching the reference image
  const g = ctx.createRadialGradient(size/2, size/2, size*0.04, size/2, size/2, size/2);
  g.addColorStop(0,    "rgba(240,248,255,0.0)");
  g.addColorStop(0.42, "rgba(220,235,255,0.0)");
  g.addColorStop(0.52, "rgba(210,228,255,0.55)");
  g.addColorStop(0.68, "rgba(180,210,255,0.38)");
  g.addColorStop(0.82, "rgba(160,195,255,0.18)");
  g.addColorStop(1,    "rgba(140,180,255,0.0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildOuterGlow(mode) {
  const group = new THREE.Group();
  const tex = makeGlowSprite();

  const rimMat = new THREE.SpriteMaterial({
    map: tex,
    color: 0xd0e8ff,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    opacity: mode === "overlay" ? 1.0 : 0.92,
    toneMapped: false
  });
  const s1 = new THREE.Sprite(rimMat);
  s1.scale.setScalar(mode === "overlay" ? 6.8 : 2.1);
  group.add(s1);

  const coronaMat = rimMat.clone();
  coronaMat.opacity = mode === "overlay" ? 0.45 : 0.38;
  coronaMat.color = new THREE.Color(0xb8d4ff);
  const s2 = new THREE.Sprite(coronaMat);
  s2.scale.setScalar(mode === "overlay" ? 8.8 : 2.72);
  group.add(s2);

  return group;
}

function buildEnvMap(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
  pmrem.dispose();
  return env;
}

function tuneMaterial(mat, mode, envMap) {
  if (!mat) return;

  if (mat.map)         mat.map.colorSpace         = THREE.SRGBColorSpace;
  if (mat.emissiveMap) mat.emissiveMap.colorSpace  = THREE.SRGBColorSpace;

  // Drive white areas to truly glow via emissive
  if ("emissive" in mat) mat.emissive = new THREE.Color(1, 1, 1);
  if (!mat.emissiveMap && mat.map) mat.emissiveMap = mat.map;
  if ("emissiveIntensity" in mat) {
    mat.emissiveIntensity = mode === "overlay" ? 3.2 : 2.6;
  }

  // Smooth, barely metallic = pearlescent sheen
  if ("roughness"  in mat) mat.roughness  = 0.08;
  if ("metalness"  in mat) mat.metalness  = 0.12;
  if ("clearcoat"  in mat) { mat.clearcoat = 1.0; mat.clearcoatRoughness = 0.08; }
  if ("envMapIntensity" in mat) mat.envMapIntensity = mode === "overlay" ? 1.4 : 1.1;
  if (envMap && "envMap" in mat) mat.envMap = envMap;

  // CRITICAL: bypass tone mapping so whites stay pure white
  mat.toneMapped = false;
  mat.transparent = false;
  mat.opacity = 1;
  mat.needsUpdate = true;
}

function setMaterialTuning(root, mode, envMap) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = false;
    obj.receiveShadow = false;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => tuneMaterial(m, mode, envMap));
  });
}

function frameModel(camera, radius, aspect, mode) {
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const fit  = mode === "overlay" ? 1.42 : 1.22;
  const distV = radius / Math.sin(vFov / 2);
  const hFov  = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const distH = radius / Math.sin(hFov / 2);
  const dist  = Math.max(distV, distH) / fit;
  camera.position.set(
    mode === "overlay" ? 0.16 * dist : 0.12 * dist,
    mode === "overlay" ? 0.06 * dist : 0.04 * dist,
    dist
  );
  camera.near = Math.max(0.01, dist / 100);
  camera.far  = dist * 20;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

function buildScene(slot, modelPath) {
  const mode = slot.classList.contains("overlay-model-slot") ? "overlay" : "button";

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // FIX: LinearToneMapping keeps whites white — ACESFilmic was warming/crushing them
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = mode === "overlay" ? 2.8 : 2.4;

  slot.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mode === "overlay" ? 24 : 28, 1, 0.01, 100);

  const envMap = buildEnvMap(renderer);
  scene.environment = envMap;

  scene.add(new THREE.AmbientLight(0xeef4ff, mode === "overlay" ? 1.8 : 1.5));

  const key = new THREE.PointLight(0xffffff, mode === "overlay" ? 28 : 22, 0, 2);
  key.position.set(1.0, 1.6, 3.2);
  scene.add(key);

  // Cool-blue fill (the blue rim seen in the reference image)
  const fill = new THREE.PointLight(0xaac8ff, mode === "overlay" ? 14 : 10, 0, 2);
  fill.position.set(-2.4, -0.8, 1.8);
  scene.add(fill);

  // Back rim = bright edge corona
  const rim = new THREE.PointLight(0xddeeff, mode === "overlay" ? 20 : 16, 0, 2);
  rim.position.set(-0.5, 0.4, -3.2);
  scene.add(rim);

  const top = new THREE.PointLight(0xffffff, mode === "overlay" ? 10 : 8, 0, 2);
  top.position.set(0, 3.5, 1.0);
  scene.add(top);

  const pivot     = new THREE.Group();
  const modelWrap = new THREE.Group();
  const glow      = buildOuterGlow(mode);
  pivot.add(glow);
  pivot.add(modelWrap);
  scene.add(pivot);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // Low threshold (0.1) = more of the bright surface contributes to bloom
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(512, 512),
    mode === "overlay" ? 1.6  : 1.1,   // strength
    mode === "overlay" ? 0.72 : 0.55,  // radius
    mode === "overlay" ? 0.10 : 0.12   // threshold
  );
  composer.addPass(bloom);

  const loading = document.createElement("div");
  loading.className = "loading-badge";
  loading.textContent = "Loading 3D";
  slot.appendChild(loading);

  const state = { renderer, composer, scene, camera, slot, mode, key, fill, rim, top, pivot, modelWrap, glow, modelRadius: 1, baseY: 0, root: null };

  const resize = () => {
    const rect   = slot.getBoundingClientRect();
    const width  = Math.max(1, Math.floor(rect.width));
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

    setMaterialTuning(root, mode, envMap);

    const box    = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);

    const sphere       = box.getBoundingSphere(new THREE.Sphere());
    const sourceRadius = sphere.radius || 1;
    const targetRadius = mode === "overlay" ? 2.58 : 0.76;
    root.scale.setScalar(targetRadius / sourceRadius);

    const adjBox    = new THREE.Box3().setFromObject(root);
    const adjSphere = adjBox.getBoundingSphere(new THREE.Sphere());
    state.modelRadius = adjSphere.radius || targetRadius;

    root.rotation.x = THREE.MathUtils.degToRad(mode === "overlay" ? 10 : 12);
    root.rotation.y = THREE.MathUtils.degToRad(mode === "overlay" ? 18 : 14);
    root.rotation.z = THREE.MathUtils.degToRad(mode === "overlay" ? -6 : -7);

    root.position.y -= adjBox.min.y * 0.02;
    state.baseY = root.position.y;
    state.root  = root;

    state.glow.scale.setScalar(state.modelRadius * (mode === "overlay" ? 1.65 : 1.88));

    modelWrap.add(root);
    slot.classList.add("has-model", "glb-loaded");
    loading.remove();
    resize();
  }, undefined, (err) => {
    console.error(err);
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
    const { mode, pivot, key, fill, rim, top, root, baseY, composer } = item;
    const floatAmp = mode === "overlay" ? 0.018 : 0.006;
    const rotAmp   = mode === "overlay" ? 0.025 : 0.012;

    pivot.position.y  = Math.sin(t * 0.35) * floatAmp;
    pivot.position.x  = Math.cos(t * 0.21) * floatAmp * 0.55;
    pivot.rotation.z  = Math.sin(t * 0.18) * rotAmp;

    if (root) {
      root.position.y  = baseY + Math.sin(t * 0.47) * floatAmp * 0.55;
      root.rotation.y += mode === "overlay" ? 0.0025 : 0.0014;
    }

    key.position.x  = Math.cos(t * 0.23) * 2.8;
    key.position.y  = 1.6 + Math.sin(t * 0.31) * 0.5;
    fill.position.x = -2.4 + Math.sin(t * 0.19) * 0.4;
    rim.position.y  = Math.cos(t * 0.27) * 0.25;
    top.position.x  = Math.sin(t * 0.15) * 0.6;

    composer.render();
  }
  requestAnimationFrame(animate);
}
animate();
