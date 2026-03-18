<a href="LICENSE">
  <img src="images/license-badge.png" alt="License badge" width="70">
</a>


**Demo**  
* https://iusmusic.github.io/O

![OPreview](OMAIN.png)


# O

O is a full independent smartphone and tablet operating system built around a protected Mother O core, sandboxed Sub O environments, and machine-native internal languages for software, graphics, and music.

## Purpose

O exists to enable freedom through safe, transparent, and programmable computing.

It is designed for people who want to:
- build tools directly on their device
- use local or brokered AI to create software
- inspect what the system is doing
- experiment safely inside isolated worlds
- own and evolve their computing environment without giving up recovery and control

## Core laws

1. O is a full independent operating system.
2. Mother O is protected.
3. Sub O is the place for experimentation.
4. O is installable as the only OS on supported devices.
5. Local AI is the default mode.
6. Online AI is optional and brokered by default.
7. No Sub O can access Mother O files, memory, or secrets without explicit gateways.
8. Promotion to Main O is staged, validated, and rollback-safe.
9. All meaningful changes should be visible, auditable, and reversible.
10. O is designed first for programmers, AI users, and technical builders.

## System model

- **Mother O**: the protected flagship environment, full OS surface, control plane, and trust root.
- **Sub O**: repo-backed isolated programmable worlds for experimentation, development, alternate environments, and service relationships.
- **The Library**: O’s layered memory and evolution system for software, graphics, music, templates, worlds, and trusted reusable objects.
- **O-IR**: machine-native software representation.
- **O-GFX**: machine-native graphics representation.
- **O-MUS**: machine-native music representation.

## Reference device

- **Reference device**: Google Pixel 8 (unlocked retail model)
- **Initial delivery**: developer-oriented flashable image
- **Long-term goal**: controlled normal-user installation path
## What this repository includes

- vision and architecture documents
- Mother O and Sub O specifications
- security model and privacy direction
- UI and interaction guidance
- device strategy and roadmap docs
- starter specs for:
  - **O-IR**
  - **O-GFX**
  - **O-MUS**
- Pixel 8 bring-up starter documentation
- Sub O manifest JSON schema

## Core concept

### Mother O
Mother O is the main system surface and orchestration layer. It is responsible for the core OS experience, system control, coordination, and shared platform services.

### Sub O
Sub O environments are modular worlds or focused runtime spaces that extend the system for specific use cases. This model is intended to support specialized workflows without turning the main system into a monolithic interface.

## Current scope

This repository is primarily a **specification and planning package**. It is intended to define:

- platform vision
- architectural direction
- subsystem boundaries
- security expectations
- UI principles
- implementation starting points

It is not positioned as a complete production OS release.

## Featured starter modules

### O-IR
Starter specification for machine-native software representation.

### O-GFX
Starter specification for graphics-related services, rendering, or visual pipeline work.

### O-MUS
Starter specification for music, audio, or media-focused system capabilities.

## Device target

The package includes a **Pixel 8 bring-up starter path**, providing an early hardware reference target for bootstrapping and testing platform assumptions.

## Schema support

A **Sub O manifest JSON schema** is included to define how modular environments are described, declared, and validated.

## Who this is for

This repository is useful for:

- system architects
- OS designers
- platform engineers
- UI and interaction designers
- security reviewers
- collaborators evaluating the Mother O / Sub O model

## Repository goal

The goal of this repository is to provide a clear and structured foundation for building O OS as a modular, design-driven, and security-conscious operating system platform.

## Status

Early-stage specification repository.

Interfaces, architecture details, and implementation plans are expected to evolve as the platform matures.

## Maintainer

**Pezhman Farhangi**

# Open Source License, Trademark, and Design Notice

**Copyright © 2026 Pezhman Farhangi. All rights reserved except as expressly licensed below.**

> This repository contains open-source software. The code is open, but the project identity, brand assets, and distinctive visual design are protected separately.

## 1) Code License

Unless otherwise stated in a specific file or directory, the source code in this repository is licensed under the **Apache License 2.0**.

You may use, reproduce, modify, and distribute the code under the terms of that license.

## 2) Brand and Trademark Notice

**Pezhman Farhangi** is the creator and rights holder of this project.

The following are **not** licensed under Apache-2.0 unless expressly stated in writing:

- project name(s)
- product name(s)
- logos
- word marks
- slogans
- brand signatures
- visual identity elements
- marketing copy
- launch graphics
- promotional assets

Use of any project or brand name, logo, or other identifier in a way that suggests endorsement, affiliation, certification, or official status is prohibited without prior written permission from **Pezhman Farhangi**.

## 3) UI, Design, and Creative Asset Notice

The open-source license for the code does **not** grant rights to copy or reuse the project's protected creative expression except where expressly stated.

Unless clearly marked otherwise, the following are reserved:

- UI artwork
- icons
- wallpapers
- sounds
- animations
- illustrations
- custom layouts
- screen compositions
- visual themes
- distinctive design language
- product presentation assets

You may fork and modify the code, but you may **not** present your fork as the official product or reuse protected brand/design assets without permission.

## 4) Distinctive Visual Identity

Any rights, if applicable, in the project's distinctive visual identity, trade dress, design rights, industrial designs, or design patents are reserved.

This includes the non-code expressive elements of the product experience to the extent permitted by law.

## 5) Third-Party Components

This repository may include third-party software, fonts, libraries, media, or other materials that are licensed under their own terms.

You are responsible for complying with those separate licenses where applicable.

## 6) Suggested Rule for Forks

If you fork this project:

- rename your forked product
- replace logos and branding
- replace protected artwork and UI assets
- avoid implying official affiliation
- keep required open-source notices intact

## 7) You are welcome to:

- view the source
- fork the code
- modify the code
- contribute under the repository terms

You are **not** automatically allowed to:

- use the official brand
- reuse logos or branded assets
- ship a clone that looks officially affiliated
- copy protected creative assets unless separately licensed

## 8) Maintainer Identity

This project is maintained by **Pezhman Farhangi**.

**Brand / rights holder name for notices:** Pezhman Farhangi

## License
# I/US Source-Available License 1.0

See `LICENSE` for source-available terms.
Copyright (c) 2026 Pezhman Farhangi  
I/US Music

This repository and its contents are made available for viewing, reference, study, and limited private internal evaluation only.

## Permitted Use

You may:

- view the source code and documentation
- download the repository for personal reference, study, and internal evaluation
- make private modifications for personal, non-commercial evaluation only

## Restrictions

You may not, without prior written permission from IUS Music:

- sell this software or any modified version of it
- distribute, sublicense, publish, or share this software or any modified version of it outside the limited permissions required for access through GitHub
- use this software or any modified version of it for commercial purposes
- create or distribute derivative works for public or commercial release
- offer this software as part of a product, service, platform, device, or commercial package
- redistribute source code, compiled builds, packaged versions, or modified copies
- remove or alter copyright, ownership, or license notices

## GitHub Platform Notice

If this repository is hosted publicly on GitHub, GitHub users may have certain limited rights to view and fork the repository through GitHub’s own platform functionality, as required by GitHub’s Terms of Service. No permission is granted beyond those minimum platform rights unless explicit written permission is given by IUS Music.

## Ownership

All rights not expressly granted under this license are reserved.

This license does not transfer ownership of the software, documentation, designs, concepts, hardware direction, brand identity, or any related intellectual property.

## No Trademark Rights

This license does not grant any right to use the names I/US, IUS, I/US Music, the official logo, the visual identity, artwork, images, audio branding, or any other protected brand assets.

Trademark and brand use are governed separately.

## No Warranty

This software, hardware prototype, and all associated materials are provided "as is", without warranty of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, and noninfringement.

In no event shall the author or copyright holder be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

## Contact

For licensing requests, commercial rights, redistribution requests, or permission to use protected brand assets, prior written permission must be obtained from I/US Music.
If this repository is hosted publicly on GitHub, GitHub users may have certain limited rights to view and fork the repository through GitHub’s own platform functionality, as required by GitHub’s Terms of Service. No permission is granted beyond those minimum platform rights unless explicit written permission is given by I/US Music.

# I/US Source-Available License 1.0

<a href="LICENSE">
  <img src="images/license-badge.png" alt="License badge" width="70">
</a>
