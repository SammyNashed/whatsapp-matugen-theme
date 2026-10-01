// Polls the local helper; pushes palette + wallpaper to every open WhatsApp tab when the wallpaper changes.
const API = "http://127.0.0.1:8765";
let last = null;

async function toDataUrl(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return "data:" + (blob.type || "image/jpeg") + ";base64," + btoa(s);
}

async function fetchTheme() {
  const st = await (await fetch(API + "/state")).json();
  const img = await toDataUrl(await (await fetch(API + "/wallpaper")).blob());
  return { ...st, image: img };
}

async function applyManual(manual, force) {
  const key = "manual" + manual.id;
  if (!force && key === last) return;
  last = key;
  chrome.storage.local.set({ theme: { wallpaper: manual.name || "chosen", colors: manual.colors, image: manual.image } });
}

// Source of the theme: "manual" = the image/preset chosen on the options page (works anywhere); otherwise the desktop helper,
// falling back to the chosen image when the helper isn't running.
async function sync(force) {
  const { mode, manual } = await chrome.storage.local.get(["mode", "manual"]);
  if (mode === "manual" && manual) return applyManual(manual, force);
  try {
    const st = await (await fetch(API + "/state", { cache: "no-store" })).json();
    const key = st.wallpaper + JSON.stringify(st.colors);
    if (!force && key === last) return;
    last = key;
    chrome.storage.local.set({ theme: await fetchTheme() });
  } catch (e) { if (manual) applyManual(manual, force); /* else: helper not running and nothing chosen yet */ }
}

chrome.storage.onChanged.addListener((ch) => { if (ch.mode || ch.manual) sync(true); });

chrome.alarms.create("poll", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(() => sync(false));
chrome.runtime.onStartup.addListener(() => sync(true));
chrome.runtime.onInstalled.addListener(async (d) => {
  sync(true);
  if (d.reason !== "install") return;
  try { await fetch(API + "/state"); } catch (e) { chrome.runtime.openOptionsPage(); } // no helper: welcome the user with the wallpaper picker
});
chrome.runtime.onMessage.addListener((m, sender) => {
  if (m === "refresh") sync(true);
  else if (m && m.health && (sender.tab || m.tabId)) {
    const tabId = sender.tab ? sender.tab.id : m.tabId, bad = m.health;
    chrome.action.setBadgeText({ tabId, text: bad.length ? "!" : "" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#d93025" });
    chrome.action.setTitle({ tabId, title: bad.length ? "Needs attention: " + bad.join(", ") : "WhatsApp Matugen Theme" });
  }
});
