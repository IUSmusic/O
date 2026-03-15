# O-GFX v0.1

## Purpose

O-GFX is the machine-native graphics representation used for icons, logos, silhouettes, procedural graphics, and lightweight UI visuals.

## Design goals

- deterministic
- compact
- exportable
- theme-aware
- vector and pixel capable

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

## Example

```text
canvas 128 128

palette {
  fg: #111111
  bg: #ffffff
}

circle center(64,64) radius(48) fill fg
rounded_rect x(36) y(54) w(56) h(20) r(6) fill bg
rounded_rect x(54) y(28) w(20) h(72) r(6) fill bg
```
