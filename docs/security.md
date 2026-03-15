# Security

## Security philosophy

O should be secure, visible, and user-governed. The system should avoid hidden behavior and make important actions legible to the user.

## O Shield

The security subsystem includes:

- privacy ledger
- firewall
- sandbox policy enforcement
- code-risk scanner
- rollback/delete/nuke controls
- superuser gating for dangerous actions

## Privacy ledger

When enabled, the ledger reports:
- data sent
- data received
- destination/source
- files touched
- subsystem involved
- update or mutation performed
- local vs remote status

## Firewall

Firewall rules should support:
- offline
- broker-only
- domain allowlist
- LAN-only
- full network
- custom advanced rules

## Dangerous actions

The following should require superuser confirmation:
- editing core firewall rules
- changing trust stores
- promotion to Main O
- exposing raw device access
- disabling key safety controls

Recommended gate:
- password
- live human presence confirmation
- audit entry

## Code-risk scanning

Use a layered approach:
- static rules
- runtime observation
- small local model for intent explanation

Risk categories:
- safe
- suspicious
- high-risk

Default behavior:
- safe → allow
- suspicious → warn
- high-risk → hold for confirmation
