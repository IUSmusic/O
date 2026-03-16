# Device Strategy

## Principle

O starts with one carefully chosen proof-of-concept device. Device support expands through repo-driven bring-up, not broad unsupported promises.

## Reference device

- Google Pixel 8 (unlocked retail model)

## Why one exact device

A single exact target gives the project:
- manageable bring-up scope
- concrete kernel and boot assumptions
- testable recovery/install path
- a clear proof gate for the architecture

## Support model

Per-device support should live in dedicated directories or repos containing:
- board configuration
- device trees
- kernel config
- feature quirks
- install scripts
- firmware packaging metadata
- recovery support
- feature matrix

## Expansion order

1. Pixel 8 proof of concept
2. adjacent device in same ecosystem
3. tablet variant
4. PC variant
5. purpose-built hardware
