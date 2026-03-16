# O-IR v0.1

## Definition

O-IR is O's machine-native software representation. It is dense, normalized, reversible, trust-aware, and logic-first.

## Core principles

- machine-first, not human-first
- not dependent on formatting, spacing, or line structure
- reversible enough to regenerate runnable software
- comments and prose are not part of the core representation
- logic-first and UI-secondary
- security, trust, and lineage aware
- sensitive segments may be encrypted but remain labeled and typed

## Layers

### Source linkage layer
- source file reference
- original language
- symbol mapping
- version/hash
- byte/span linkage

### Structural logic layer
- module
- function
- interface
- state store
- resource
- dependency
- event handler

### Behavioral semantics layer
- action
- effect
- read/write behavior
- service exposure
- runtime requirements

### Execution layer
- runnable plan
- regeneration target
- deployment/runtime needs

### Trust and security layer
- trust level
- risk state
- provenance
- permissions relevance
- encrypted labeled sections

## Node strategy

O-IR uses a hybrid node model:
- small atomic fields internally
- meaningful blocks as the main working units

Preferred working units:
- module
- function
- interface
- state store
- resource
- event handler
- service endpoint
- effect block

## Identity

Each object should carry:
- stable logical ID
- content hash
- lineage/version metadata
- provenance
- trust metadata

## Storage model

O-IR supports partial storage and partial conversion. Large systems do not need full monolithic conversion before O can reason over them.

## Scope

O-IR v0.1 is software-first. Hardware and device logic may later be represented through separate or adjacent dialects.
