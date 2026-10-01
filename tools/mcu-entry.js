import { QuantizerCelebi, Score, Hct, SchemeVibrant, SchemeNeutral, argbFromHex, hexFromArgb, sourceColorFromImage } from "@material/material-color-utilities";

// Builds the same palette keys the helper provides, from a source color, using the same Material algorithm matugen uses.
export function paletteFromArgb(argb, variant) {
  const s = variant === "neutral" ? new SchemeNeutral(Hct.fromInt(argb), true, 0) : new SchemeVibrant(Hct.fromInt(argb), true, 0);
  const h = (n) => hexFromArgb(n);
  return {
    primary: h(s.primary), on_primary: h(s.onPrimary),
    primary_container: h(s.primaryContainer), on_primary_container: h(s.onPrimaryContainer),
    secondary_container: h(s.secondaryContainer),
    surface: h(s.surface), surface_container_high: h(s.surfaceContainerHigh ?? s.surfaceVariant), on_surface: h(s.onSurface),
  };
}
export const paletteFromHex = (hex, variant) => paletteFromArgb(argbFromHex(hex), variant);
export const sourceFromImage = (img) => sourceColorFromImage(img);
export { argbFromHex, hexFromArgb };

// Up to n distinct accent candidates from an image (most suitable first), so the user can choose like matugen's --prefer.
export function candidatesFromImage(img, n = 5) {
  const w = 128, h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  const cv = Object.assign(document.createElement("canvas"), { width: w, height: h });
  const ctx = cv.getContext("2d"); ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data, px = [];
  for (let i = 0; i < d.length; i += 4) px.push(((255 << 24) | (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]) >>> 0);
  return Score.score(QuantizerCelebi.quantize(px, 128), { desired: n, filter: true });
}
