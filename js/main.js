const overlay = document.getElementById("systemOverlay");
const pullZone = document.getElementById("pullZone");
const closeButton = document.getElementById("overlayCloseButton");
const mainButton = document.getElementById("mainButton");
const screenRoot = document.getElementById("screenRoot");

function openOverlay() {
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  screenRoot.classList.add("screen-overlay-open");
}

function closeOverlay(ev) {
  if (ev) ev.stopPropagation();
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  screenRoot.classList.remove("screen-overlay-open");
}

pullZone?.addEventListener("click", openOverlay);
mainButton?.addEventListener("click", openOverlay);
closeButton?.addEventListener("click", closeOverlay);
overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeOverlay();
});
