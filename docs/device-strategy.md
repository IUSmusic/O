# Device Strategy

## Principle

O starts with one carefully chosen proof-of-concept device. Device support expands through repo-driven bring-up, not broad unsupported promises.

## First target

- Pixel 8-class unlocked retail device

## Why this matters

A single reference device gives the project:
- manageable bring-up scope
- testable kernel and firmware integration
- realistic install path
- clear support target for early users and contributors

## Device support model

Per-device support should live in dedicated repos or directories containing:
- board configuration
- device trees
- kernel config
- feature quirks
- install scripts
- firmware packaging metadata
- recovery support

## Expansion order

1. one phone proof of concept
2. adjacent phone/tablet in same ecosystem
3. PC variant
4. custom hardware

## Important rule

O is independent in identity, but pragmatic in bring-up. Existing hardware still requires per-device kernel, firmware, and boot integration work.
