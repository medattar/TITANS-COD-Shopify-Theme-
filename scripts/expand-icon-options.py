#!/usr/bin/env python3
"""Replace the __ICON_OPTIONS__ token in block/section schemas with the shared icon list.

Run after adding a schema that uses the token: python3 scripts/expand-icon-options.py
"""
import json
import pathlib

ICONS = [
    ("none", "— None"), ("check", "✓ Check"), ("check-circle", "✅ Check circle"),
    ("sparkle", "✦ Sparkle"), ("star", "★ Star"), ("heart", "♥ Heart"),
    ("fire", "🔥 Fire"), ("flame", "🔥 Flame"), ("blaze", "💥 Blaze"),
    ("shield", "🛡 Shield"), ("verified", "✔ Verified"), ("truck", "🚚 Truck"),
    ("package-check", "📦 Package"), ("box", "📦 Box"), ("cash", "💵 Cash"),
    ("credit-card", "💳 Card"), ("lock", "🔒 Lock"), ("return", "↩ Return"),
    ("gift", "🎁 Gift"), ("clock", "🕒 Clock"), ("calendar", "📅 Calendar"),
    ("phone", "📞 Phone"), ("chat", "💬 Chat"), ("whatsapp", "🟢 WhatsApp"),
    ("mail", "✉ Mail"), ("headset", "🎧 Support"), ("location", "📍 Location"),
    ("store", "🏪 Store"), ("home", "🏠 Home"), ("globe", "🌐 Globe"),
    ("leaf", "🍃 Leaf"), ("droplet", "💧 Droplet"), ("moon", "🌙 Moon"),
    ("sun", "☀ Sun"), ("bolt", "⚡ Bolt"), ("battery", "🔋 Battery"),
    ("award", "🏅 Award"), ("trophy", "🏆 Trophy"), ("medal", "🥇 Medal"),
    ("crown", "👑 Crown"), ("diamond", "💎 Diamond"), ("rocket", "🚀 Rocket"),
    ("bell", "🔔 Bell"), ("megaphone", "📣 Megaphone"), ("target", "🎯 Target"),
    ("percent", "% Percent"), ("tag", "🏷 Tag"), ("thumbs-up", "👍 Thumbs up"),
    ("smile", "☺ Smile"), ("users", "👥 Users"), ("eye", "👁 Eye"),
    ("info", "ℹ Info"), ("dot", "● Dot"),
]

options = json.dumps([{"value": v, "label": l} for v, l in ICONS], ensure_ascii=False)
root = pathlib.Path(__file__).resolve().parent.parent
changed = 0
for folder in ("blocks", "sections"):
    for path in (root / folder).glob("*.liquid"):
        text = path.read_text()
        if "__ICON_OPTIONS__" in text:
            path.write_text(text.replace("__ICON_OPTIONS__", options))
            changed += 1
print(f"expanded icon options in {changed} file(s)")
