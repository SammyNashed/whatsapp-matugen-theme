#!/usr/bin/env bash
# Removes the WhatsApp Matugen Theme helper and its files. Your WhatsApp and wallpapers are not touched.
set -u
DEST="$HOME/.local/share/whatsapp-matugen-theme"
UNIT="$HOME/.config/systemd/user/whatsapp-theme-helper.service"
systemctl --user disable --now whatsapp-theme-helper.service >/dev/null 2>&1
rm -f "$UNIT"; systemctl --user daemon-reload
rm -rf "$DEST"
echo "Removed the helper and its files."
echo "Last step: open chrome://extensions (helium://extensions in Helium) and click Remove on \"WhatsApp Matugen Theme\"."
