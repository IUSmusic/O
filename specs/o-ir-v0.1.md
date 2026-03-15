# O-IR v0.1

## Purpose

O-IR is the machine-native software representation used by O to understand, transform, validate, and regenerate software.

## Design goals

- language-agnostic
- machine-first
- traceable back to source
- compact enough for efficient retrieval
- expressive enough for reasoning about behavior
- suitable for patch planning and regeneration

## Representation layers

### Structural layer
Captures:
- file
- module
- symbol
- import
- type
- call relation
- entrypoint

### Semantic layer
Captures:
- purpose
- side effects
- state mutations
- file access
- network behavior
- runtime requirements
- security implications

## Core node types

- file
- module
- symbol
- function
- type
- state_store
- resource
- dependency
- event_handler
- interface
- process
- action
- effect

## Example

```text
module notes.storage

function save_note
inputs: title:string, body:string
reads: /data/notes.json
writes: /data/notes.json
depends_on: json.load, json.write
effect: append record
security: local_write_only
```

## Initial ingestion targets

- Python
- JavaScript / TypeScript
- Bash

## Future targets

- Rust
- Go
- Java / Kotlin
- C / C++
- C#
