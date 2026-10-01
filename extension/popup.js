const out = document.getElementById("out");
const row = (cls, text) => { const li = document.createElement("li"); li.className = cls; li.textContent = text; out.appendChild(li); };

document.getElementById("go").addEventListener("click", async () => {
  out.textContent = "";
  try { const st = await (await fetch("http://127.0.0.1:8765/state")).json(); row("ok", "Helper running, wallpaper " + st.wallpaper); }
  catch (e) { row("bad", "Helper not reachable on 127.0.0.1:8765"); }
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !/^https:\/\/web\.whatsapp\.com\//.test(tab.url || "")) return row("dim", "Open WhatsApp Web in this tab to check the theme.");
  chrome.tabs.sendMessage(tab.id, "health", (bad) => {
    if (chrome.runtime.lastError || !bad) return row("bad", "Theme script not running on this tab. Reload WhatsApp.");
    if (!bad.length) return row("ok", "All hooks match. Everything is working.");
    row("bad", "Something stopped matching:");
    bad.forEach((b) => row("bad", "• " + b));
  });
});
