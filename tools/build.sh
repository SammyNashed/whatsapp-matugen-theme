#!/usr/bin/env bash
# Builds dist/chromium.zip (Chrome, Edge, Opera, Brave...) and dist/firefox.zip from ./extension.
# The two differ only in the manifest: Firefox needs an event page, an add-on id and options_ui.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist/fx
(cd extension && zip -qr ../dist/whatsapp-matugen-theme-extension.zip . -x "*.DS_Store")
cp -r extension/. dist/fx/
python3 - <<'PY'
import json
p="dist/fx/manifest.json"; m=json.load(open(p))
m["background"]={"scripts":["background.js"]}
m.pop("options_page",None); m["options_ui"]={"page":"options.html","open_in_tab":True}
m["browser_specific_settings"]={"gecko":{"id":"wallpaper-theme-whatsapp@sammynashed.github.io","strict_min_version":"142.0","data_collection_permissions":{"required":["none"]}}}
json.dump(m,open(p,"w"),indent=2)
PY
(cd dist/fx && zip -qr ../whatsapp-matugen-theme-firefox.zip . -x "*.DS_Store")
rm -rf dist/fx
ls -la dist
