## Eventmaster Toolset XML module

This module controls Barco EventMaster through the XML protocol.

Connection details:
- `Target IP` is required and connects over TCP port `9876`.
- `Target MAC Address` is used as the `Frame id` in the multiviewer layout command.

You can capture XML commands from EMT output:
- Press `Ctrl+o` (Windows) or `Cmd+o` (macOS) in EMT.
- Perform the action in EMT.
- Copy the full XML from output and paste it into the `Custom XML` action in Companion.

## Actions

### Change multiviewer layout

Changes the multiviewer layout.

Options:
- `Layout number`: 1 to 4 in the dropdown.

Notes:
- The action sends values `0` to `3` internally for layouts `1` to `4`.
- This action uses the configured `Target MAC Address` in the XML payload.

### Set audio tone on output

Turns EventMaster audio test tone on or off for an output destination.

Options:
- `Destination`: `PGM 1A`, `PGM 1B`, `PGM 2A`, `PGM 2B`.
- `on/off`: `off` or `on`.

### Apply userkey

Applies a UserKey to a destination/layer.

Options:
- `Userkey number (sending -1)`
- `Screen Destination (sending -1)`
- `Layer (sending -1)`

Notes:
- Enter these as human-friendly values starting at `1`.
- The module subtracts `1` before sending to EventMaster (so `1` becomes `0`).

### Custom XML

Sends raw XML exactly as entered.

Options:
- `XML content`: full XML payload to send to the device.
