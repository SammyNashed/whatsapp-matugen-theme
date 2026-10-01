// WhatsApp themes itself by switching CSS variables, so we override those variables (stable) instead of scrambled class names.
const root = document.documentElement;
const style = document.createElement("style");
style.id = "wt-vars";
root.appendChild(style);

// Sidebar opacity: lower = more see-through (0.3 very clear, 0.8 mostly solid).
const GLASS_ALPHA = 0.55;

// Favicon: recolor the green parts of WhatsApp's own icon with the accent, keep white/other pixels (so unread-badge variants still work).
// WhatsApp keeps several <link rel~=icon> elements and resets them, so every one is tracked and re-recolored when it changes.
let accent = null;
const iconState = new WeakMap(); // link -> { orig, out, accent }
const iconPending = new WeakSet();
async function recolor(src, hex) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const w = img.naturalWidth || 64, h = img.naturalHeight || 64;
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h), px = data.data;
  const [tr, tg, tb] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    if (g > r + 30 && g > b + 30) { // green-ish pixel: keep its brightness, swap the hue
      const k = Math.min(1, g / 211);
      px[i] = tr * k; px[i + 1] = tg * k; px[i + 2] = tb * k;
    }
  }
  ctx.putImageData(data, 0, 0);
  return cv.toDataURL("image/png");
}
function fixIcon() {
  if (!accent) return;
  for (const link of document.querySelectorAll('link[rel~="icon"]')) {
    const st = iconState.get(link);
    const ours = st && link.href === st.out;
    if (ours && st.accent === accent) continue;
    if (iconPending.has(link)) continue;
    const orig = ours ? st.orig : link.href; // WhatsApp set a new icon -> that is the new original
    iconPending.add(link);
    const wanted = accent;
    recolor(orig, wanted)
      .then((out) => { iconState.set(link, { orig, out, accent: wanted }); link.href = out; })
      .catch(() => {})
      .finally(() => iconPending.delete(link));
  }
}
// Watch only <head> (where the icon links live) and coalesce bursts into one pass per frame.
let iconQueued = false;
const iconObserver = new MutationObserver(() => {
  if (iconQueued) return;
  iconQueued = true;
  requestAnimationFrame(() => { iconQueued = false; fixIcon(); });
});
const headOpts = { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] };
function attachHead() { if (!document.head) return false; iconObserver.observe(document.head, headOpts); return true; }
if (!attachHead()) new MutationObserver((_, o) => { if (attachHead()) o.disconnect(); }).observe(document.documentElement, { childList: true });

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");

function apply(t) {
  if (!t) return;
  const c = t.colors;
  const decl = (name, hex) => `${name}: ${hex} !important; ${name}-RGB: ${rgb(hex)} !important;`;
  style.textContent =
    `html[data-wt-on], html[data-wt-on] * { ` +
    decl("--WDS-systems-bubble-surface-outgoing", c.primary_container) +
    decl("--WDS-systems-bubble-surface-incoming", c.surface_container_high) +
    decl("--WDS-accent", c.primary) +
    decl("--WDS-accent-emphasized", c.on_primary_container) +
    decl("--WDS-accent-deemphasized", c.primary_container) +
    decl("--WDS-content-action-emphasized", c.primary) +
    decl("--WDS-content-external-link", c.primary) +
    decl("--WDS-content-on-accent", c.on_primary) +
    decl("--WDS-persistent-activity-indicator", c.primary) +
    decl("--WDS-persistent-always-branded", c.primary) +
    `--WDS-systems-chat-surface-tray: transparent !important; ` +
    `--outgoing-background: ${c.primary_container} !important; ` +
    `--wt-wall: url("${t.image}"); ` +
    `--wt-glass: rgba(${rgb(c.surface)}, ${GLASS_ALPHA}); --wt-glass-pill: rgba(${rgb(c.surface)}, ${GLASS_ALPHA - 0.1}); --wt-glass-rail: rgba(${rgb(c.surface)}, ${GLASS_ALPHA + 0.15}); }`;
  root.dataset.wtOn = "1";
  accent = c.primary;
  fixIcon();
}
chrome.storage.local.get("theme", (r) => apply(r.theme));
chrome.storage.onChanged.addListener((ch) => { if (ch.theme) apply(ch.theme.newValue); });
chrome.runtime.sendMessage("refresh");

// Blurred wallpaper behind the whole app, visible only through the translucent sidebar.
const backdrop = document.createElement("div");
backdrop.id = "wt-backdrop";
document.addEventListener("DOMContentLoaded", () => document.body.prepend(backdrop));
// Tag the chat-list column (header + list) so CSS can make it glass; WhatsApp re-renders, so re-check.
function tagUi() {
  const side = document.getElementById("side");
  if (side && side.parentElement && !side.parentElement.dataset.wtGlass) side.parentElement.dataset.wtGlass = "1";
  // Composer pill: the rounded, opaque, wide box inside the chat footer.
  const foot = document.querySelector("#main footer");
  if (foot && !foot.querySelector("[data-wt-pill]")) {
    for (const e of foot.querySelectorAll("div")) {
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      if (r.width > 300 && parseFloat(cs.borderTopLeftRadius) >= 20 && !/, 0\)$/.test(cs.backgroundColor) && cs.backgroundColor !== "transparent") { e.dataset.wtPill = "1"; break; }
    }
  }
  // Chat header + Contact-info drawer: inject a layer holding the same blurred wallpaper slice the sidebar shows.
  for (const el of document.querySelectorAll('#main header, [data-testid="drawer-right"], [data-testid="drawer-left"], [data-testid="drawer-middle"], [data-testid="intro-panel"]')) {
    // WhatsApp leaves empty drawers mounted after you leave a tab; an empty drawer must stay see-through, so drop its glass.
    if (el.dataset.testid !== undefined || el.getAttribute("data-testid")) {
      if (!el.textContent.trim()) {
        const old = el.querySelector(":scope > .wt-hdr");
        if (old) old.remove();
        delete el.dataset.wtHdr;
        continue;
      }
    }
    el.dataset.wtHdr = "1";
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    let layer = el.querySelector(":scope > .wt-hdr");
    if (!layer) { layer = document.createElement("div"); layer.className = "wt-hdr"; layer.appendChild(document.createElement("i")); el.prepend(layer); }
    const r = el.getBoundingClientRect();
    layer.style.setProperty("--wt-hx", r.left + "px");
    layer.style.setProperty("--wt-hy", r.top + "px");
  }
  // Chat wallpaper: one image spanning the whole window; the chat pane shows the slice behind it, the sidebar shows the blurred left part.
  const stock = document.querySelector('[data-testid="stock-wallpaper-image"]');
  if (stock) {
    let wall = stock.querySelector(":scope > .wt-wall");
    if (!wall) { wall = document.createElement("i"); wall.className = "wt-wall"; stock.prepend(wall); }
    const r = stock.getBoundingClientRect();
    wall.style.setProperty("--wt-wx", r.left + "px");
    wall.style.setProperty("--wt-wy", r.top + "px");
  }
  // Drawer panels: clear every large opaque layer (don't rely on variables) so the injected glass layer shows through.
  for (const drawer of document.querySelectorAll('[data-testid="drawer-right"], [data-testid="drawer-left"], [data-testid="drawer-middle"], [data-testid="intro-panel"]')) {
    for (const e of drawer.querySelectorAll("div, span, header, section, main, aside, nav")) {
      if (e.dataset.wtClear === "1" || e.classList.contains("wt-hdr")) continue;
      const r = e.getBoundingClientRect();
      if (r.width < 300 || r.height < 40) continue;
      const cs = getComputedStyle(e);
      if (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderTopLeftRadius) < 12) e.dataset.wtClear = "1";
      else e.dataset.wtClear = "0";
    }
  }
  if (side) root.dataset.wtReady = "1"; // only show the backdrop once the real UI exists (not on the loading screen)
}
let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; tagUi(); });
}).observe(document, { childList: true, subtree: true });
tagUi();

addEventListener("resize", tagUi);

// Health check: verifies every hook this theme depends on. Only runs once after load and on demand from the popup (never continuously).
function runHealth() {
  const bad = [];
  const declared = (name) => {
    for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (r.style && r.style.getPropertyValue(name)) return true; } catch (e) {} }
    return false;
  };
  for (const v of ["--WDS-accent", "--WDS-systems-bubble-surface-outgoing", "--WDS-persistent-always-branded", "--WDS-surface-default"])
    if (!declared(v)) bad.push(`WhatsApp no longer defines ${v} (colors)`);
  if (!root.dataset.wtOn) bad.push("no theme yet (pick a wallpaper in the extension popup, or start the helper)");
  const side = document.getElementById("side");
  if (side && !(side.parentElement && side.parentElement.dataset.wtGlass)) bad.push("sidebar glass");
  if (root.dataset.wtReady && !document.getElementById("wt-backdrop")) bad.push("background layer");
  if (document.getElementById("main")) {
    const stock = document.querySelector('[data-testid="stock-wallpaper-image"]');
    if (!stock) bad.push("wallpaper layer (stock-wallpaper-image) not found");
    else if (!stock.querySelector(".wt-wall")) bad.push("wallpaper image not injected");
    const hdr = document.querySelector("#main header");
    if (!hdr || !hdr.querySelector(":scope > .wt-hdr")) bad.push("chat header glass");
    const foot = document.querySelector("#main footer");
    if (foot && !foot.querySelector("[data-wt-pill]")) bad.push("typing bar glass");
  }
  for (const id of ["drawer-right", "drawer-left", "drawer-middle", "intro-panel"])
    for (const el of document.querySelectorAll(`[data-testid="${id}"]`))
      if (el.textContent.trim() && !el.querySelector(":scope > .wt-hdr")) bad.push(`${id} panel glass`);
  if (accent) for (const link of document.querySelectorAll('link[rel~="icon"]')) {
    const st = iconState.get(link);
    if (!st || link.href !== st.out) { bad.push("tab icon"); break; }
  }
  return [...new Set(bad)];
}
chrome.runtime.onMessage.addListener((m, _s, reply) => { if (m === "health") reply(runHealth()); });
// One passive check per page load. WhatsApp can still be starting up at 10s, so a failure is re-checked a few times before raising the badge.
let healthTries = 0;
const passiveHealth = () => {
  const bad = runHealth();
  if (bad.length && ++healthTries < 4) return setTimeout(passiveHealth, 8000);
  try { chrome.runtime.sendMessage({ health: bad }); } catch (e) { /* extension was reloaded; this old copy is orphaned */ }
};
setTimeout(passiveHealth, 10000);
