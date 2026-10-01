# Build instructions (for reviewers)

## What needs building
Only one file is machine-generated: `extension/lib/mcu.js`, a minified bundle of the open-source library
[`@material/material-color-utilities`](https://github.com/material-foundation/material-color-utilities) **0.4.0** (Apache-2.0),
bundled with **esbuild 0.28.2**. Everything else in `extension/` is hand-written and unminified.

## Environment
- Any OS with a shell (developed on Linux, Arch).
- **Node.js** 22 or newer (built with v26.8.2) and **npm** 10 or newer (built with 12.0.2). Install from https://nodejs.org.
- `zip` and `python3` (only for the last step, building the add-on zip).

## Steps
```sh
cd tools
npm install          # installs the two pinned dependencies listed in tools/package.json
npm run build        # runs esbuild on tools/mcu-entry.js and overwrites ../extension/lib/mcu.js
cd ..
./tools/build.sh     # builds dist/whatsapp-matugen-theme-firefox.zip (and the Chromium zip)
```

`mcu.js` will match the submitted file byte for byte when the same dependency versions are installed.
The Firefox zip differs from the Chromium one only in `manifest.json` (event-page background, add-on id, `options_ui`);
`tools/build.sh` makes that change.
