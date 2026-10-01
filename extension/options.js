// "Choose your wallpaper" page: turns an image (or a preset color) into a wallpaper + palette and saves it for the content script.
const API = "http://127.0.0.1:8765";
const store = chrome.storage.local;
const $ = (id) => document.getElementById(id);
const PRESETS = [
  ["Ocean", "#2f5bff"], ["Violet", "#8f5bff"], ["Rose", "#ff4f8b"], ["Ember", "#ff7a2f"],
  ["Mint", "#1fcf9a"], ["Aqua", "#00c2d1"], ["Gold", "#ffc12a"], ["Graphite", "#8a95a8", "neutral"],
];
let pending = null; // { image, colors, name }

// ---- image -> downscaled JPEG data URL + palette -------------------------------------------------------------
async function fromFile(file) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, 1920 / bmp.width), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
  const cv = Object.assign(document.createElement("canvas"), { width: w, height: h });
  cv.getContext("2d").drawImage(bmp, 0, 0, w, h);
  const image = cv.toDataURL("image/jpeg", 0.86);
  const img = new Image(); img.src = image; await img.decode();
  const cands = MCU.candidatesFromImage(img, 5);
  return { image, colors: MCU.paletteFromArgb(cands[0]), name: file.name, cands };
}

// ---- preset color -> generated wallpaper (soft aurora from the palette) --------------------------------------
function fromPreset(name, hex, variant) {
  const colors = MCU.paletteFromHex(hex, variant);
  const cv = Object.assign(document.createElement("canvas"), { width: 1920, height: 1080 });
  const g = cv.getContext("2d");
  g.fillStyle = colors.surface; g.fillRect(0, 0, 1920, 1080);
  const blob = (x, y, r, c, a) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, c + a); rg.addColorStop(1, c + "00"); g.fillStyle = rg; g.fillRect(0, 0, 1920, 1080); };
  blob(380, 260, 900, colors.primary_container, "ff"); blob(1500, 820, 1000, colors.secondary_container, "ff");
  blob(1100, 160, 700, colors.primary, "55"); blob(300, 950, 650, colors.primary_container, "aa");
  return { image: cv.toDataURL("image/jpeg", 0.9), colors, name };
}

// ---- UI --------------------------------------------------------------------------------------------------------
function show(p) {
  pending = p;
  $("preview").hidden = false;
  const c = p.colors;
  $("shot").style.backgroundImage = `url(${p.image})`;
  $("shot").style.setProperty("--glass", c.surface + "bb");
  $("shot").style.setProperty("--out", c.primary_container); $("shot").style.setProperty("--outfg", c.on_primary_container);
  $("shot").style.setProperty("--in", c.surface_container_high);
  $("swatches").replaceChildren(...[c.primary, c.primary_container, c.secondary_container, c.surface_container_high, c.surface].map((x) => Object.assign(document.createElement("i"), { style: `background:${x}`, title: x })));
  // accent choices found in the image (like matugen's --prefer): click one to recolor
  $("accentRow").hidden = !p.cands;
  if (p.cands) $("accents").replaceChildren(...p.cands.map((argb, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "dot" + (p.accent === undefined ? (i === 0 ? " on" : "") : (p.accent === i ? " on" : ""));
    b.style.background = MCU.hexFromArgb(argb); b.title = MCU.hexFromArgb(argb);
    b.onclick = () => { p.accent = i; p.colors = MCU.paletteFromArgb(argb); show(p); };
    return b;
  }));
  $("status").textContent = ""; $("save").disabled = false;
  $("preview").scrollIntoView({ behavior: "smooth", block: "center" });
}

async function save() {
  $("save").disabled = true;
  await store.set({ manual: { id: Date.now(), name: pending.name, image: pending.image, colors: pending.colors }, mode: "manual" });
  document.querySelector('input[value="manual"]').checked = true;
  $("status").textContent = "Done! Open or reload web.whatsapp.com to see it.";
}

async function pick(file) {
  if (!file || !file.type.startsWith("image/")) return;
  $("status").textContent = "";
  try { show(await fromFile(file)); } catch (e) { $("preview").hidden = false; $("status").textContent = "Couldn't read that image. Try a JPG or PNG."; }
}

PRESETS.forEach(([name, hex, variant]) => {
  const b = document.createElement("button"); b.className = "preset"; b.type = "button";
  const p = fromPreset(name, hex, variant);
  const tile = document.createElement("div"); tile.className = "tile"; tile.style.background = `url(${p.image}) center/cover`;
  const label = document.createElement("span"); label.textContent = name;
  b.append(tile, label);
  b.onclick = () => { document.querySelectorAll(".preset").forEach((x) => x.classList.remove("on")); b.classList.add("on"); show(fromPreset(name, hex, variant)); };
  $("presets").appendChild(b);
});
$("file").onchange = (e) => pick(e.target.files[0]);
$("drop").addEventListener("dragover", (e) => { e.preventDefault(); $("drop").classList.add("over"); });
$("drop").addEventListener("dragleave", () => $("drop").classList.remove("over"));
$("drop").addEventListener("drop", (e) => { e.preventDefault(); $("drop").classList.remove("over"); pick(e.dataTransfer.files[0]); });
$("save").onclick = save;
document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener("change", () => store.set({ mode: r.value })));

(async () => {
  const { mode } = await store.get("mode");
  let helper = false;
  try { await fetch(API + "/state"); helper = true; $("helperState").textContent = "Helper found on this computer."; }
  catch (e) { $("helperState").textContent = "Needs the small helper from the project page (Linux with matugen). Not found on this computer."; }
  document.querySelector(`input[value="${mode || (helper ? "auto" : "manual")}"]`).checked = true; // same default the background uses
})();
