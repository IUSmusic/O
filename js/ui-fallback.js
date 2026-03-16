(() => {
  const overlay = document.getElementById('systemOverlay');
  const pullZone = document.getElementById('pullZone');
  const statusBar = document.getElementById('statusBar');
  const closeButton = document.getElementById('overlayCloseButton');
  const screenRoot = document.getElementById('screenRoot');
  const floatingButton = document.querySelector('.floating-main-button');
  const modelSlots = [...document.querySelectorAll('.model-slot')];
  const fallbackScenes = [];

  const ensureFallbackCanvas = (slot) => {
    if (!slot) return null;
    let canvas = slot.querySelector('.fallback-orb-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'fallback-orb-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      slot.prepend(canvas);
    }
    return canvas;
  };

  const setupFallbackScene = (slot) => {
    const canvas = ensureFallbackCanvas(slot);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = {
      slot,
      canvas,
      ctx,
      mode: slot.classList.contains('overlay-model-slot') ? 'overlay' : 'button',
      width: 0,
      height: 0,
      dpr: 1,
    };

    const resize = () => {
      const rect = slot.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.width = width;
      state.height = height;
      state.dpr = dpr;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(slot);
    state.resizeObserver = ro;
    fallbackScenes.push(state);
  };

  const drawFallbackOrb = (state, timeSeconds) => {
    const { ctx, width: w, height: h, mode, slot } = state;
    if (!w || !h || slot.classList.contains('glb-loaded')) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = Math.min(w, h) * (mode === 'overlay' ? 0.37 : 0.34);
    const pulse = 1 + Math.sin(timeSeconds * 1.15) * 0.015;
    const orbit = timeSeconds * 0.72;
    const lx = cx + Math.cos(orbit) * r * 0.42;
    const ly = cy - r * 0.34 + Math.sin(orbit * 0.73) * r * 0.12;

    const glow = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r * 1.75);
    glow.addColorStop(0, 'rgba(255,255,255,0.42)');
    glow.addColorStop(0.35, 'rgba(255,255,255,0.20)');
    glow.addColorStop(0.7, 'rgba(255,255,255,0.05)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.85 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
    ctx.clip();

    const body = ctx.createRadialGradient(lx, ly, r * 0.04, cx, cy, r * 1.15);
    body.addColorStop(0, 'rgba(255,255,255,1)');
    body.addColorStop(0.18, 'rgba(255,255,255,0.98)');
    body.addColorStop(0.48, 'rgba(250,250,252,0.92)');
    body.addColorStop(0.72, 'rgba(228,232,238,0.54)');
    body.addColorStop(1, 'rgba(160,170,184,0.16)');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Rotating inner caustic bands: they move across the sphere surface instead of spinning the whole object flat.
    const bandCount = mode === 'overlay' ? 4 : 3;
    for (let i = 0; i < bandCount; i += 1) {
      const phase = orbit * (0.8 + i * 0.15) + i * 1.7;
      const bx = cx + Math.sin(phase) * r * 0.55;
      const by = cy + Math.cos(phase * 0.85) * r * 0.14;
      const bandWidth = r * (0.28 - i * 0.035);
      const band = ctx.createLinearGradient(bx - bandWidth, by, bx + bandWidth, by);
      band.addColorStop(0, 'rgba(255,255,255,0)');
      band.addColorStop(0.5, i === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(230,240,255,0.12)');
      band.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = band;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(Math.sin(phase) * 0.25 + 0.2);
      ctx.scale(1, 0.42);
      ctx.beginPath();
      ctx.arc(0, 0, bandWidth * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const shadow = ctx.createRadialGradient(cx - r * 0.22, cy + r * 0.26, r * 0.1, cx, cy, r * 1.05);
    shadow.addColorStop(0, 'rgba(0,0,0,0)');
    shadow.addColorStop(0.7, 'rgba(0,0,0,0.06)');
    shadow.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
    ctx.fill();

    const spec = ctx.createRadialGradient(lx - r * 0.04, ly - r * 0.04, 0, lx, ly, r * 0.32);
    spec.addColorStop(0, 'rgba(255,255,255,0.96)');
    spec.addColorStop(0.35, 'rgba(255,255,255,0.52)');
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(lx, ly, r * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const rim = ctx.createRadialGradient(cx, cy, r * 0.78, cx, cy, r * 1.1);
    rim.addColorStop(0, 'rgba(255,255,255,0)');
    rim.addColorStop(0.82, 'rgba(255,255,255,0.06)');
    rim.addColorStop(0.95, 'rgba(255,255,255,0.22)');
    rim.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2);
    ctx.fill();
  };

  modelSlots.forEach(setupFallbackScene);

  const animateFallback = (now) => {
    const t = now / 1000;
    for (const scene of fallbackScenes) drawFallbackOrb(scene, t);
    requestAnimationFrame(animateFallback);
  };
  requestAnimationFrame(animateFallback);

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

  [pullZone, statusBar, floatingButton].forEach((node) => {
    node?.addEventListener('click', openOverlay);
  });

  closeButton?.addEventListener('click', closeOverlay);
  overlay?.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.classList.contains('system-overlay-panel')) {
      closeOverlay();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOverlay();
  });

  setTimeout(() => {
    document.documentElement.classList.add('ui-fallback-ready');
  }, 0);
})();
