# Security

## Philosophy

O is designed to support freedom above a protected base, not instead of one.

The system should remain:
- open
- programmable
- transparent
- recoverable
- difficult to casually damage
- hard to tamper with at the trust/root level

## Security layers

### Kernel/protected root
- safe boot
- protected secure folders
- trust anchors
- destructive-action barriers
- recovery path
- non-bypassable safety hooks

### Mother O security services
- firewall
- privacy ledger
- trust management
- code risk analysis
- superuser gating
- promotion validation
- incident response

### Sub O policy layer
- isolation
- runtime restrictions
- network mode
- device access
- relation policy
- snapshot and destruction controls

### User mode layer
- normal
- visible
- strict
- paranoid
- dead man mode
- drunk mode
- child lock mode
- user-defined experience modes

## Firewall model

Sub O internet access is off by default unless allowed.

Mother O network posture is user-selectable:
- local (including server)
- online repo only
- full online

The firewall should expose an understandable app/path/data-use view similar to a simplified process/network monitor.

## Privacy ledger

The privacy ledger is always available. Live on-screen visibility is optional.

It records:
- data sent and received
- source and destination
- files touched
- subsystem involved
- model use
- device use
- updates and mutations

## Code risk

Risk evaluation combines:
- static rules
- runtime observation
- small-model intent explanation

Behavior:
- safe → allow
- suspicious → warn
- high-risk → hold for confirmation or stronger path

## Recovery and reinstall

Fresh reinstall and trusted recovery are part of the security model. O should always maintain a path back to a trusted state.
