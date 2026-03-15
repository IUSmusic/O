# O-MUS v0.1

## Purpose

O-MUS is the machine-native music representation used for theory-based composition, MIDI generation, soundbank mapping, and rendering.

## Design goals

- theory-aware
- event-capable
- suitable for local generation
- exportable to MIDI and audio rendering pipelines

## Core concepts

### Theory layer
- key
- mode
- scale
- chord
- progression
- motif
- phrase
- section
- form

### Rhythm layer
- meter
- subdivision
- swing
- accent
- tuplet

### Performance layer
- note
- duration
- velocity
- articulation
- pitch_curve
- expression_curve

### Instrument layer
- instrument_role
- patch
- bank
- soundbank_ref
- layer

## Outputs
- MIDI 1.0
- MIDI 2.0 compatible event layer
- WAV / FLAC rendering
- stems

## Example

```text
score cue.main
tempo 118
meter 4/4
key D minor

section intro 8 bars
harmony: i - VI - III - VII
texture: low_strings + piano
motif: sparse descending
```
