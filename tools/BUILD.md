# Build notes

`extension/lib/mcu.js` is a minified bundle of `@material/material-color-utilities` 0.4.0 (Apache-2.0).
To reproduce it from source (this is what store reviewers ask for):

```sh
cd tools
npm install
npm run build        # writes ../extension/lib/mcu.js from mcu-entry.js
```

`./tools/build.sh` then builds the store zips (`dist/`): one for Chromium browsers and one for Firefox.
