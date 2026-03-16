# O UI Project Bundle

This bundle contains the updated HTML preview with a 3D-ready slot inside the bottom center button.

## Where to place your GLB

Put your model here:

`assets/models/main-button.glb`

## Included files

- `index.html`
- `styles.css`
- `js/main.js`
- `assets/models/`

## Notes

- The bottom button already includes a slow rotating inner core at roughly 3% speed.
- A fallback animated orb is shown by default.
- The project is prepared for your GLB file path, but no external 3D loader is bundled.
- If you want, the next step can be wiring this to a real GLB renderer such as Three.js.
