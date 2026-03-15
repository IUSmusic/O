# External Accelerators

## Goal

O should support optional external devices that improve inference, media, or desktop-style workflows without requiring the user to open the phone.

## Device classes

### AI
- USB TPU / NPU / VPU devices
- external inference accelerators

### Audio
- USB soundcards
- USB DACs
- USB MIDI devices

### Display
- USB-C display output
- docked monitor use

### Compute
- future external compute modules
- future high-speed external GPU/compute where supported

## Abstraction model

Mother O should classify devices as:
- accelerator.ai
- accelerator.audio
- accelerator.midi
- accelerator.display
- accelerator.compute

## Policy

External devices should be:
- discoverable
- permission-governed
- brokered into Sub O environments
- visible in the privacy ledger

## Initial practical focus

1. USB audio
2. USB MIDI
3. USB AI accelerators
4. display/dock support
5. more advanced external compute later
