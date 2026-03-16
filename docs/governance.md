# Governance

## Contribution model

O should grow through a structured contribution process covering:
- core architecture
- device support
- templates and packs
- The Library objects
- docs and specifications

## Protected areas

The following areas require stricter review:
- boot and recovery logic
- trust and update logic
- kernel-protected safety assumptions
- promotion and rollback paths
- Mother O core services

## Device support

Per-device support should be repo-driven and maintainable by dedicated contributors without weakening core architectural boundaries.
