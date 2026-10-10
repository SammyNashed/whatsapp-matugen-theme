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
    chrome.runtime.sendMessage({ health: bad, tabId: tab.id }); // keep the toolbar badge in sync with this fresh result
    if (!bad.length) return row("ok", "All hooks match. Everything is working.");
    row("bad", "Something stopped matching:");
    bad.forEach((b) => row("bad", "• " + b));
  });
});

document.getElementById("pick").addEventListener("click", () => chrome.runtime.openOptionsPage());

document.getElementById("diag").addEventListener("click", async () => {
  out.textContent = "";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !/^https:\/\/web\.whatsapp\.com\//.test(tab.url || "")) return row("dim", "Open WhatsApp Web (with a chat open) in this tab first.");
  chrome.tabs.sendMessage(tab.id, "diag", async (txt) => {
    if (chrome.runtime.lastError || !txt) return row("bad", "Theme script not running on this tab. Reload WhatsApp.");
    try { await navigator.clipboard.writeText(txt); row("ok", "Copied. Paste it in a message to the developer."); }
    catch (e) { const ta = document.createElement("textarea"); ta.value = txt; ta.rows = 8; ta.style.width = "100%"; out.appendChild(ta); ta.select(); row("dim", "Select all and copy the text above."); }
  });
});
