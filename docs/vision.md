# Vision

## Purpose

O is designed as a full operating system for users who want ownership, local intelligence, sandboxed experimentation, and deep hardware adaptability.

O is not a theme, launcher, forked skin, or cloud shell. It is a full OS that can be installed on a user's own hardware and used as the only operating system on supported devices.

## Product thesis

Modern operating systems optimize for app distribution and fixed software packages. O optimizes for:

- machine-native software understanding
- local-first AI assistance
- sandboxed software generation and evolution
- user-visible privacy and security controls
- safe promotion of experimental environments into trusted environments
- optional external hardware acceleration without opening the device

## Defining concepts

### Mother O
The trusted control plane of the system.

### Sub O
A sandboxed child environment created inside Mother O for development, experimentation, custom workflows, or alternate runtime worlds.

### O-IR
Machine-native software representation for code understanding, transformation, and regeneration.

### O-GFX
Machine-native graphics representation for vector, pixel, and icon generation.

### O-MUS
Machine-native music representation for theory-based generation, MIDI, soundbank mapping, and rendering.

## Design laws

1. Mother O logic is fixed by default and editable only through controlled update and promotion paths.
2. Sub O is the primary space for experimentation.
3. Sub O instances are isolated by default.
4. AI usage is user-governed: local, brokered online, hybrid, or manual.
5. No Sub O may access Mother O files, secrets, or memory without explicit gateways.
6. Generated or imported code begins as candidate code, not trusted code.
7. All important changes should be visible, reversible, and auditable.
8. Promotion from Sub O to Main O is deliberate, validated, and rollback-safe.
