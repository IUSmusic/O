# O-GFX v0.1

## Definition

O-GFX is O's machine-native graphics representation for icons, logos, silhouettes, masks, simple illustrations, widgets, and themeable visual symbols.

## Decisions

- hybrid, vector-first
- pixel mode is first-class
- minimal transform/timeline animation hints only
- text support is outline/path only
- generated icons should support monochrome base, theme variants, and rounded-mask safe versions
- objects carry stable IDs and trust metadata

## Primitive groups

### Geometry
- point
- line
- polyline
- polygon
- rect
- rounded_rect
- circle
- ellipse
- path

### Paint
- fill
- stroke
- opacity
- gradient
- palette_token

### Composition
- group
- layer
- mask
- clip
- symbol
- instance

### Transform
- translate
- scale
- rotate
- mirror
- timeline_hint

### Pixel mode
- grid
- palette
- cell
- span
- sprite
- flood_fill

## Exports

- SVG
- HTML/CSS
- canvas
- PNG
