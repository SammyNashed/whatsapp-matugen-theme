# Store listing (copy and paste)

Package to upload: `wallpaper-theme-for-whatsapp-web.zip`
Privacy policy URL: https://github.com/SammyNashed/whatsapp-matugen-theme/blob/main/PRIVACY.md
Support / website URL: https://github.com/SammyNashed/whatsapp-matugen-theme
Category: Social (Edge: "Social"; Opera: "Themes & customization" or "Social networks")
Language: English
Screenshots: `screenshots/` (1280x800). Promo tile: `promo-tile-440x280.png`. Icon: `icon-128.png`.

## Name
Wallpaper Theme for WhatsApp Web

## Short description (under 132 characters)
Make WhatsApp Web match your wallpaper: frosted-glass panels, accent colors and chat background from any image.

## Full description
Make WhatsApp Web look like it belongs on your desktop.

Drop in any image, or pick a ready-made style, and the theme does the rest:

• Your wallpaper as the chat background, sharp in the chat and blurred behind the sidebar, like one picture across the whole window
• Frosted-glass sidebar, top bar, typing box and side panels
• Message bubbles, buttons, links, status dots and even the tab icon recolored from your image
• Choose which accent color to use when your image has several
• Works on Windows, macOS and Linux

How to use: click the extension icon, choose "Choose wallpaper", pick an image or a style, press "Use this wallpaper", then open web.whatsapp.com.

Private by design: the extension only changes how WhatsApp Web looks. It never reads, stores or sends your messages or any other WhatsApp content, and it makes no requests to any server. Your chosen image stays in your browser.

Optional for Linux users: a small local helper (see the project page) can make WhatsApp follow your desktop wallpaper automatically.

Open source: https://github.com/SammyNashed/whatsapp-matugen-theme

Not affiliated with, endorsed by, or sponsored by WhatsApp or Meta.

## Permission justifications (reviewers ask for these)
- **Host access to https://web.whatsapp.com/\***: the extension's single purpose is to restyle WhatsApp Web (colors, background, panel styling). It does not read or transmit page content.
- **Host access to http://127.0.0.1:8765/\***: optional local helper on the user's own computer (Linux) that supplies the desktop wallpaper and colors. Nothing is sent over the internet.
- **storage / unlimitedStorage**: saves the user's chosen wallpaper image and palette locally in the browser. A full-size image can exceed the default quota.
- **alarms**: checks for a wallpaper change every 30 seconds when the optional helper is used.
- **No remote code**: all code is bundled in the package. (The Material color library in `lib/mcu.js` is open source, Apache-2.0, bundled locally.)
- **Single purpose**: apply a user-chosen wallpaper and matching colors to WhatsApp Web.

## Notes for the reviewer
To test: open web.whatsapp.com, click the extension icon, choose "Choose wallpaper", pick a style (for example "Aqua"), press "Use this wallpaper", and reload web.whatsapp.com. The theme applies after login. The optional local helper is not needed for review.


---

# Firefox (addons.mozilla.org)

Package: `whatsapp-matugen-theme-firefox.zip` (from `./tools/build.sh`; the only difference is the manifest).
Add-on ID: `wallpaper-theme-whatsapp@sammynashed.github.io`. Minimum Firefox: 142. Data collection: none.
Listing text, categories ("Appearance" or "Social & Communication"), screenshots and permission justifications: reuse the sections above.
Source code: AMO asks for the source of minified files. `extension/lib/mcu.js` is a bundle of `@material/material-color-utilities` 0.4.0; upload `source.zip` (a copy of this repository) and paste the build steps from `tools/BUILD.md`:

> `cd tools && npm install && npm run build` regenerates `extension/lib/mcu.js` from `tools/mcu-entry.js`; `./tools/build.sh` then builds the add-on zip.
