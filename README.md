# WhatsApp Matugen Theme

A Chromium extension that themes **WhatsApp Web** from your desktop's current wallpaper and
[matugen](https://github.com/InioX/matugen) palette: bubbles, buttons, links, status dots and the tab icon take your
accent colors, and the whole window shows one continuous wallpaper (sharp in the chat, blurred and translucent
behind the sidebar, headers, typing bar and side panels).

It follows your wallpaper: change it and WhatsApp re-themes itself within about 30 seconds.

## How it works

WhatsApp Web themes itself by switching `--WDS-*` CSS variables, so the extension overrides those (plus a few
`data-testid` hooks) instead of scrambled class names. A tiny local helper serves your current wallpaper and palette
on `127.0.0.1:8765`, because a web page can't read your desktop.

```
extension/   Manifest V3 extension (content script, popup health check, background poller)
helper/      server.py: serves /state (palette + wallpaper name) and /wallpaper
systemd/     user service that runs the helper
```

## Requirements

Linux with **Hyprland**, [`awww`](https://codeberg.org/LGFae/awww) (the wallpaper daemon; `awww query` is how the
helper finds the current wallpaper), **matugen** writing `~/.config/matugen/generated/hyprland-colors.conf`, Python 3,
and a Chromium-based browser. The helper is the only desktop-specific part; adapting it to another setup means
changing `read_conf()` / `current_wallpaper()` in `helper/server.py`.

## Install

```sh
# 1. helper (starts on login)
mkdir -p ~/.config/systemd/user
sed "s|%h/whatsapp-themes|$PWD|" systemd/whatsapp-theme-helper.service > ~/.config/systemd/user/whatsapp-theme-helper.service
systemctl --user daemon-reload && systemctl --user enable --now whatsapp-theme-helper
curl -s localhost:8765/state        # should print your palette

# 2. extension: open chrome://extensions (or helium://extensions), enable Developer mode,
#    "Load unpacked", pick the extension/ folder, then reload WhatsApp Web.
```

The service file expects the repo at `~/whatsapp-themes`; the `sed` line above rewrites that path to wherever you cloned it.

## Tuning

`GLASS_ALPHA` at the top of `extension/content.js` sets how see-through the sidebar is (lower = clearer).

## Health check

The toolbar popup has a **Check now** button that verifies every hook the theme depends on. A passive check also runs
once, ~10 s after each page load, and puts a red `!` on the extension icon if WhatsApp changed something. Nothing runs
continuously. If a hook breaks, only the glass look degrades; chats stay fully usable.

## Notes

Not affiliated with WhatsApp or Meta. WhatsApp's markup changes often, so expect to adjust a selector now and then.
