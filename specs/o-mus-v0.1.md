# O-MUS v0.1

## Definition

O-MUS is O's machine-native music representation for theory-aware composition, MIDI generation, soundbank mapping, playback, and rendering.

## Decisions

- hybrid, theory-first
- includes event and performance layer
- includes soundbank mapping
- includes MIDI output and rendered export
- carries stable IDs and trust metadata
- not a full DAW or plugin-host-first system in v0.1

## Layers

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
- future MIDI 2.0-compatible event layer
- WAV / FLAC rendering
- stems
- internal playback
