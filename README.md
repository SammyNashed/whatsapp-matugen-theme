<div align="center">

<img src="extension/icons/icon128.png" width="104" alt="WhatsApp Matugen Theme icon">

# WhatsApp Matugen Theme

**Make WhatsApp Web match your wallpaper.**<br>
Your wallpaper becomes the chat background, the sidebar turns to frosted glass,<br>
and every color follows your desktop when you change wallpapers.

<br>

<img src="docs/theme-cycle.gif" alt="WhatsApp Web changing colors as the wallpaper changes" width="900">

</div>

<br>

## What it does

- 🖼️ **Your wallpaper, everywhere.** The chat background is your current desktop wallpaper, sharp in the chat and blurred behind the sidebar, like one picture across the window.
- 🧊 **Frosted glass.** The sidebar, the top bar, the typing box and the side panels are see-through and blurred.
- 🎨 **Colors that match.** Message bubbles, buttons, links, the little status dots and even the tab icon take the colors of your wallpaper.
- 🔄 **Follows you.** Change your wallpaper and WhatsApp updates by itself within about 30 seconds. Nothing to click.
- 🔒 **Private.** Everything stays on your computer. Nothing is sent anywhere, and your messages are never read.

## Looks like this

One extension, seven different wallpapers:

<table>
  <tr>
    <td><img src="docs/previews/blue.jpg" alt="Blue theme"></td>
    <td><img src="docs/previews/pink.jpg" alt="Pink theme"></td>
  </tr>
  <tr>
    <td align="center">Blue</td>
    <td align="center">Pink</td>
  </tr>
  <tr>
    <td><img src="docs/previews/red.jpg" alt="Red theme"></td>
    <td><img src="docs/previews/orange.jpg" alt="Orange theme"></td>
  </tr>
  <tr>
    <td align="center">Red</td>
    <td align="center">Orange</td>
  </tr>
  <tr>
    <td><img src="docs/previews/cyan.jpg" alt="Cyan theme"></td>
    <td><img src="docs/previews/sky.jpg" alt="Sky theme"></td>
  </tr>
  <tr>
    <td align="center">Cyan</td>
    <td align="center">Sky</td>
  </tr>
</table>

<sub>The chats in these pictures are made up.</sub>

## Before you start

This is made for Linux desktops that already color themselves from the wallpaper. You need:

- **Hyprland** with **[matugen](https://github.com/InioX/matugen)** (picks the colors from your wallpaper) and **[awww](https://codeberg.org/LGFae/awww)** (sets the wallpaper). If your desktop changes colors when you change wallpapers, you most likely have these.
- A **Chromium-based browser**: Chrome, Chromium, Brave, Helium, Vivaldi, Edge…

## Install

### Step 1: run the installer

Open a terminal and paste this:

```sh
curl -fsSL https://raw.githubusercontent.com/SammyNashed/whatsapp-matugen-theme/main/install.sh | bash
```

It checks your setup, installs a tiny helper that runs in the background, and tells you exactly what to do next.

<details>
<summary>Prefer to download it first?</summary>

```sh
git clone https://github.com/SammyNashed/whatsapp-matugen-theme
cd whatsapp-matugen-theme
./install.sh
```

</details>

### Step 2: add it to your browser

Browsers don't let installers add extensions for you, so this part is four clicks:

1. Go to **`chrome://extensions`** in your browser (in Helium: `helium://extensions`, in Brave: `brave://extensions`).
2. Turn on **Developer mode** with the switch in the top right corner.
3. Click **Load unpacked** and pick the folder the installer showed you:<br>
   `~/.local/share/whatsapp-matugen-theme/extension`<br>
   <sub>The installer already copied this path to your clipboard, so you can just paste it.</sub>
4. Open **[web.whatsapp.com](https://web.whatsapp.com)**, or reload it if it's already open.

That's it. Your WhatsApp now matches your wallpaper. Pin the extension icon if you like: <img src="extension/icons/icon32.png" width="18" alt="extension icon">

## Using it

There is nothing to set up. Change your wallpaper the way you always do, and WhatsApp follows within about 30 seconds.

**Is it working?** Click the extension icon and press **Check now**. It tells you if everything is in place. If WhatsApp ever changes its website in a way the theme doesn't expect, a small red **!** appears on the icon and says which part needs an update. Your chats keep working either way.

**Want the glass more or less see-through?** Open `extension/content.js` in the install folder, change `GLASS_ALPHA` near the top (lower = clearer, higher = more solid), then click the reload arrow on the extension in `chrome://extensions`.

## Uninstall

```sh
bash ~/.local/share/whatsapp-matugen-theme/uninstall.sh
```

Then click **Remove** on the extension in `chrome://extensions`.

## Questions

<details>
<summary><b>Does it read my messages?</b></summary>

No. It only changes how WhatsApp looks. It doesn't read, store or send any of your chats, and it doesn't talk to any server on the internet.
</details>

<details>
<summary><b>What is the "helper" that runs in the background?</b></summary>

A web page can't see your desktop, so a small program on your computer tells the extension which wallpaper and colors you're using. It only answers your own computer (address `127.0.0.1`, port `8765`) and uses almost no resources.
</details>

<details>
<summary><b>WhatsApp looks normal again. What happened?</b></summary>

Usually the helper isn't running. Run `systemctl --user restart whatsapp-theme-helper` and reload WhatsApp. If the red **!** shows on the extension icon, WhatsApp changed something; please open an issue and mention what the popup says.
</details>

<details>
<summary><b>Does it work on Windows, macOS, KDE or GNOME?</b></summary>

Not yet. The helper reads colors from matugen and the wallpaper from awww. The extension itself works in any Chromium browser, so other setups only need a different helper (`helper/server.py` is short).
</details>

---

<div align="center">
<sub>Not affiliated with WhatsApp or Meta. Released under the MIT license.</sub>
</div>
