#!/usr/bin/env python3
"""Serves the current wallpaper + matugen palette to the WhatsApp theme extension on 127.0.0.1:8765."""
import json, os, re, subprocess
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOME = os.path.expanduser("~")
CONF = f"{HOME}/.config/matugen/generated/hyprland-colors.conf"  # matugen output; holds palette + real wallpaper path
KEYS = ("primary", "on_primary", "primary_container", "on_primary_container",
        "secondary_container", "surface", "surface_container_high", "on_surface")

def current_wallpaper(conf_wall):
    """awww knows the real current image; matugen's $image can be stale or 'Null' (e.g. after live wallpapers)."""
    try:
        out = subprocess.run(["awww", "query"], capture_output=True, text=True, timeout=3).stdout
        out = re.sub(r"\x1b\[[0-9;]*m", "", out)
        m = re.search(r"currently displaying: image: (.+)", out)
        if m and os.path.isfile(m.group(1).strip()):
            return m.group(1).strip()
    except Exception:
        pass
    return conf_wall

def read_conf():
    colors, wall = {}, None
    for line in open(CONF):
        line = line.strip()
        if line.startswith("$image ="):
            wall = line.split("=", 1)[1].strip()
        elif line.startswith("$") and "rgba(" in line:
            name, val = line[1:].split("=", 1)
            if name.strip() in KEYS:
                colors[name.strip()] = "#" + val.strip()[5:11]
    return colors, current_wallpaper(wall)

class H(BaseHTTPRequestHandler):
    def _send(self, code, ctype, body):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        try:
            if self.path == "/state":
                colors, wall = read_conf()
                st = {"wallpaper": os.path.basename(wall), "colors": colors}
                self._send(200, "application/json", json.dumps(st).encode())
            elif self.path == "/wallpaper":
                self._send(200, "image/jpeg", open(read_conf()[1], "rb").read())
            else:
                self._send(404, "text/plain", b"not found")
        except Exception as e:
            self._send(500, "text/plain", str(e).encode())

    def log_message(self, *a): pass

ThreadingHTTPServer(("127.0.0.1", 8765), H).serve_forever()
