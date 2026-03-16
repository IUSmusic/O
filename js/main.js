const modelSlots = document.querySelectorAll('.model-slot');
const overlay = document.getElementById('systemOverlay');
const pullZone = document.getElementById('pullZone');
const statusBar = document.getElementById('statusBar');
const closeButton = document.getElementById('overlayCloseButton');

// This project is prepared for a GLB drop-in.
// Put your model at: ./assets/models/main-button.glb
// Both the bottom button and the pull-down overlay use the same model path.

(async () => {
  for (const slot of modelSlots) {
    const modelPath = slot.dataset.modelPath;
    if (!modelPath) continue;

    try {
      const response = await fetch(modelPath, { method: 'HEAD' });
      if (response.ok) {
        slot.classList.add('has-model');
        slot.title = 'Model slot ready: ' + modelPath;
      }
    } catch (error) {
      // Silent fallback is intentional.
    }
  }
})();

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
  if (event.key === 'Escape') {
    closeOverlay();
  }
});
