// ── Overlay open / close ──────────────────────────────────────────────────────
const overlay      = document.getElementById("systemOverlay");
const pullZone     = document.getElementById("pullZone");
const closeButton  = document.getElementById("overlayCloseButton");
const mainButton   = document.getElementById("mainButton");
const screenRoot   = document.getElementById("screenRoot");

function openOverlay()  {
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

// ── Perlin noise helpers ───────────────────────────────────────────────────────
const PERM = new Uint8Array(512);
(function () {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
})();
function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + (b - a) * t; }
function grad(h, x, y) { const v = h & 3; return ((v & 1) ? -x : x) + ((v & 2) ? -y : y); }
function noise(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y);
  const a = PERM[X] + Y, b = PERM[X + 1] + Y;
  return lerp(
    lerp(grad(PERM[a],     x,     y),     grad(PERM[b],     x - 1, y),     u),
    lerp(grad(PERM[a + 1], x,     y - 1), grad(PERM[b + 1], x - 1, y - 1), u),
    v
  );
}
function fbm(x, y, oct) {
  let v = 0, a = 1, f = 1, max = 0;
  for (let i = 0; i < oct; i++) { v += a * noise(x * f, y * f); max += a; a *= 0.5; f *= 2; }
  return v / max;
}

// ── SunCanvas — B&W animated sun on any <canvas> element ─────────────────────
class SunCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext("2d");
    this.gCanvas = document.createElement("canvas");
    this.gCtx    = this.gCanvas.getContext("2d");
    this.lastGranTime = -999;
    this.fCanvas = document.createElement("canvas");
    this.fCtx    = this.fCanvas.getContext("2d");
  }

  render(t) {
    const { canvas, ctx } = this;
    const W = canvas.width, H = canvas.height;
    const CX = W / 2, CY = H / 2;
    const R  = Math.min(W, H) * 0.48;

    ctx.clearRect(0, 0, W, H);
    this._drawGlow(ctx, CX, CY, R, t);

    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.clip();
    this._drawDisc(ctx, CX, CY, R, t);
    ctx.restore();
  }

  _buildGranulation(R, t) {
    if (t - this.lastGranTime < 75) return;
    this.lastGranTime = t;
    const sz = Math.ceil(R * 2 + 4);
    if (this.gCanvas.width !== sz) { this.gCanvas.width = this.gCanvas.height = sz; }
    const img = this.gCtx.createImageData(sz, sz);
    const d   = img.data;
    const cx  = sz / 2, cy = sz / 2, r2 = R * R;
    const spd = t * 0.00016;
    for (let py = 0; py < sz; py++) {
      for (let px = 0; px < sz; px++) {
        const dx = px - cx, dy = py - cy;
        if (dx * dx + dy * dy > r2) continue;
        const dist = Math.sqrt(dx * dx + dy * dy) / R;
        const limb = 1 - 0.60 * dist - 0.30 * dist * dist;
        const nx = px / R * 2.6, ny = py / R * 2.6;
        const gran =
          fbm(nx         + spd,       ny         + spd,       4) * 0.52 +
          fbm(nx * 3.1   + spd * 1.8, ny * 3.1   + spd * 1.8, 3) * 0.30 +
          fbm(nx * 8.5   + spd * 2.4, ny * 8.5   + spd * 2.4, 2) * 0.18;
        const g01  = (gran + 1) * 0.5;
        const heat = g01 * limb;
        const v    = heat < 0.5 ? 2 * heat * heat : 1 - Math.pow(-2 * heat + 2, 2) / 2;
        const bv   = Math.min(255, (Math.pow(v, 1.75) * 180) | 0);
        const i    = (py * sz + px) * 4;
        d[i] = d[i + 1] = d[i + 2] = bv;
        d[i + 3] = 255;
      }
    }
    this.gCtx.putImageData(img, 0, 0);
  }

  _buildFilaments(R, t) {
    const sz = Math.ceil(R * 2 + 4);
    if (this.fCanvas.width !== sz) { this.fCanvas.width = this.fCanvas.height = sz; }
    this.fCtx.clearRect(0, 0, sz, sz);
    const cx = sz / 2, cy = sz / 2;
    const spd = t * 0.00012;
    for (let k = 0; k < 7; k++) {
      const ang = (k / 7) * Math.PI * 2 + spd * (0.3 + k * 0.07);
      const len = R * (0.45 + 0.38 * Math.abs(Math.sin(spd * 0.8 + k)));
      const x1  = cx + Math.cos(ang) * R * 0.06;
      const y1  = cy + Math.sin(ang) * R * 0.06;
      const x2  = cx + Math.cos(ang) * len;
      const y2  = cy + Math.sin(ang) * len;
      const a   = 0.05 + 0.03 * Math.abs(Math.sin(spd * 1.3 + k));
      const grd = this.fCtx.createLinearGradient(x1, y1, x2, y2);
      grd.addColorStop(0,   `rgba(255,255,255,${a})`);
      grd.addColorStop(0.4, `rgba(180,180,180,${a * 0.6})`);
      grd.addColorStop(1,   "rgba(0,0,0,0)");
      const mx = (x1 + x2) / 2 + noise(spd + k, spd * 0.5) * R * 0.18;
      const my = (y1 + y2) / 2 + noise(spd * 0.7 + k, spd + k * 0.4) * R * 0.18;
      this.fCtx.save();
      this.fCtx.lineWidth   = R * (0.04 + 0.02 * Math.abs(Math.sin(spd * 0.9 + k * 1.3)));
      this.fCtx.strokeStyle = grd;
      this.fCtx.beginPath();
      this.fCtx.moveTo(x1, y1);
      this.fCtx.quadraticCurveTo(mx, my, x2, y2);
      this.fCtx.stroke();
      this.fCtx.restore();
    }
  }

  _drawGlow(ctx, CX, CY, R, t) {
    const pulse = 1 + 0.013 * Math.sin(t * 0.0005);
    const layers = [
      { r: R * 3.8 * pulse, a1: 0.070 },
      { r: R * 2.6 * pulse, a1: 0.140 },
      { r: R * 1.8 * pulse, a1: 0.280 },
      { r: R * 1.35 * pulse, a1: 0.480 },
    ];
    for (const l of layers) {
      const g = ctx.createRadialGradient(CX, CY, R * 0.96, CX, CY, l.r);
      g.addColorStop(0, `rgba(255,255,255,${l.a1})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(CX, CY, l.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  _drawDisc(ctx, CX, CY, R, t) {
    this._buildGranulation(R, t);
    this._buildFilaments(R, t);
    ctx.drawImage(this.gCanvas, CX - R - 2, CY - R - 2, R * 2 + 4, R * 2 + 4);
    ctx.globalAlpha = 0.55;
    ctx.drawImage(this.fCanvas, CX - R - 2, CY - R - 2, R * 2 + 4, R * 2 + 4);
    ctx.globalAlpha = 1.0;
    const vign = ctx.createRadialGradient(CX, CY, R * 0.25, CX, CY, R);
    vign.addColorStop(0,    "rgba(255,255,255,0.04)");
    vign.addColorStop(0.55, "rgba(0,0,0,0.00)");
    vign.addColorStop(0.88, "rgba(0,0,0,0.00)");
    vign.addColorStop(0.96, "rgba(0,0,0,0.52)");
    vign.addColorStop(1.0,  "rgba(0,0,0,0.97)");
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = vign;
    ctx.fill();
    const bloom = ctx.createRadialGradient(CX, CY, 0, CX, CY, R * 0.60);
    bloom.addColorStop(0,    "rgba(255,255,255,0.72)");
    bloom.addColorStop(0.30, "rgba(255,255,255,0.28)");
    bloom.addColorStop(0.65, "rgba(255,255,255,0.06)");
    bloom.addColorStop(1,    "rgba(255,255,255,0.00)");
    ctx.beginPath();
    ctx.arc(CX, CY, R * 0.60, 0, Math.PI * 2);
    ctx.fillStyle = bloom;
    ctx.fill();
  }
}

// ── Instantiate suns ──────────────────────────────────────────────────────────
const btnCanvas     = document.getElementById("sunButtonCanvas");
const overlayCanvas = document.getElementById("sunOverlayCanvas");

const btnSun     = btnCanvas     ? new SunCanvas(btnCanvas)     : null;
const overlaySun = overlayCanvas ? new SunCanvas(overlayCanvas) : null;

function syncSizes() {
  if (btnCanvas) {
    const r = btnCanvas.parentElement.getBoundingClientRect();
    const s = Math.round(Math.min(r.width, r.height));
    if (s > 0 && btnCanvas.width !== s) { btnCanvas.width = btnCanvas.height = s; }
  }
  if (overlayCanvas) {
    const r = overlayCanvas.parentElement.getBoundingClientRect();
    const s = Math.round(Math.min(r.width, r.height));
    if (s > 0 && overlayCanvas.width !== s) { overlayCanvas.width = overlayCanvas.height = s; }
  }
}
new ResizeObserver(syncSizes).observe(document.body);
syncSizes();

function animate(t) {
  requestAnimationFrame(animate);
  syncSizes();
  btnSun?.render(t);
  overlaySun?.render(t);
}
requestAnimationFrame(animate);
