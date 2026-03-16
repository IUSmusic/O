# The Library

## Definition

The Library is O's structured memory and evolution system.

It stores:
- O-IR artifacts
- O-GFX artifacts
- O-MUS artifacts
- app templates
- code templates
- world templates
- policy packs
- bootstrap-generated assets
- trust, lineage, and provenance metadata

## Layers

### Core bootstrap layer
Built into O. Available offline from first boot.

### Local user layer
Private reusable objects created or imported on the device.

### Shared local layer
Optional controlled sharing between Sub O worlds.

### Remote shared layer
Future optional online layer for contributed and synchronized objects.

### Canonical layer
Highest-trust official or strongly reviewed object families.

## Trust levels
- private
- candidate
- validated
- reviewed
- canonical

## Rules

- new or imported objects begin as candidate unless already trusted by the system
- trust elevation must pass through Mother O validation
- every important object carries stable ID, hash, provenance, lineage, and trust metadata
- the built-in offline bootstrap library is a trusted branch of The Library
