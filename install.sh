#!/usr/bin/env bash
# WhatsApp Matugen Theme installer: sets up the small background helper and tells you how to add the extension.
set -euo pipefail

REPO="SammyNashed/whatsapp-matugen-theme"
DEST="$HOME/.local/share/whatsapp-matugen-theme"
UNIT="$HOME/.config/systemd/user/whatsapp-theme-helper.service"

bold=$'\e[1m'; green=$'\e[32m'; yellow=$'\e[33m'; red=$'\e[31m'; dim=$'\e[2m'; off=$'\e[0m'
say()  { printf '%s\n' "$*"; }
ok()   { printf '  %s✓%s %s\n' "$green" "$off" "$*"; }
warn() { printf '  %s!%s %s\n' "$yellow" "$off" "$*"; }
fail() { printf '  %s✗%s %s\n' "$red" "$off" "$*"; exit 1; }

say ""
say "${bold}WhatsApp Matugen Theme${off}"
say "${dim}Makes WhatsApp Web match your wallpaper.${off}"
say ""
say "${bold}1. Checking your setup${off}"

command -v python3 >/dev/null || fail "Python 3 is missing. Install it first (on Arch: sudo pacman -S python)."
ok "Python 3 found"
command -v systemctl >/dev/null || fail "systemd is needed to keep the helper running in the background."
ok "systemd found"
if command -v awww >/dev/null; then ok "Wallpaper tool (awww) found"; else warn "awww not found. The theme needs it to know your current wallpaper."; fi
if [ -f "$HOME/.config/matugen/generated/hyprland-colors.conf" ]; then ok "Matugen colors found"; else warn "No matugen colors yet. Change your wallpaper once with matugen, then the theme picks them up."; fi

say ""
say "${bold}2. Installing${off}"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ ! -f "$SRC/extension/manifest.json" ]; then # run via curl | bash: download the files first
  command -v curl >/dev/null || fail "curl is needed to download the files."
  TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
  curl -fsSL "https://github.com/$REPO/archive/refs/heads/main.tar.gz" | tar -xz -C "$TMP"
  SRC="$(echo "$TMP"/*)"
  ok "Downloaded the latest version"
fi
mkdir -p "$DEST"
rm -rf "$DEST/extension" "$DEST/helper"
cp -r "$SRC/extension" "$SRC/helper" "$DEST/"
cp "$SRC/uninstall.sh" "$DEST/" 2>/dev/null || true
ok "Files copied to $DEST"

mkdir -p "$(dirname "$UNIT")"
cat > "$UNIT" <<UNITEOF
[Unit]
Description=WhatsApp Matugen Theme helper (shares your wallpaper and colors with the browser, on this computer only)

[Service]
ExecStart=/usr/bin/env python3 $DEST/helper/server.py
Restart=on-failure

[Install]
WantedBy=default.target
UNITEOF
systemctl --user daemon-reload
systemctl --user enable --now whatsapp-theme-helper.service >/dev/null 2>&1
systemctl --user restart whatsapp-theme-helper.service
sleep 1
if curl -fs http://127.0.0.1:8765/state >/dev/null 2>&1 || python3 -c "import urllib.request;urllib.request.urlopen('http://127.0.0.1:8765/state',timeout=2)" 2>/dev/null; then
  ok "Helper is running and starts by itself when you log in"
else
  warn "The helper started but isn't answering yet. Run: systemctl --user status whatsapp-theme-helper"
fi

say ""
say "${bold}3. Add the extension to your browser${off} ${dim}(one time, about 30 seconds)${off}"
say "  1. Open your browser and go to the address ${bold}chrome://extensions${off}"
say "     ${dim}(Helium: helium://extensions, Brave: brave://extensions)${off}"
say "  2. Turn on ${bold}Developer mode${off} (switch in the top right corner)"
say "  3. Click ${bold}Load unpacked${off} and choose this folder:"
say "       ${bold}$DEST/extension${off}"
if command -v wl-copy >/dev/null; then printf '%s' "$DEST/extension" | wl-copy && say "     ${dim}(already copied to your clipboard, just paste it)${off}"; fi
say "  4. Open ${bold}web.whatsapp.com${off} (or reload it). Done!"
say ""
say "${dim}To remove it later: bash $DEST/uninstall.sh${off}"
say ""
