#!/usr/bin/env python3
"""Adds the shared "Box style" and "Text style" settings to every block and section.

Blocks get a data-box attribute on their root element (next to block.shopify_attributes);
sections are styled through their #shopify-section-<id> wrapper. Safe to re-run.
Usage: python3 scripts/add-style-controls.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_SECTIONS = {"cart-drawer", "main-password"}
SCHEMA_RE = re.compile(r"({%-?\s*schema\s*-?%})(.*?)({%-?\s*endschema\s*-?%})", re.S)


def opt(*pairs):
    return [{"value": v, "label": l} for v, l in pairs]


def box_settings(scope, is_section):
    vis = "{{ %s.settings.box_enable }}" % scope
    tvis = "{{ %s.settings.tx_enable }}" % scope

    def r(id_, label, mn, mx, step, default=0, unit="px"):
        d = {"type": "range", "id": id_, "label": label, "min": mn, "max": mx, "step": step, "default": default, "visible_if": vis}
        if unit:
            d["unit"] = unit
        return d

    s = [
        {"type": "header", "content": "Box style"},
        {"type": "checkbox", "id": "box_enable", "label": "Customize spacing, border and shadow", "default": False},
        r("box_mt", "Space above (desktop)", 0, 160, 2),
        r("box_mb", "Space below (desktop)", 0, 160, 2),
        r("box_mt_m", "Space above (mobile)", 0, 120, 2),
        r("box_mb_m", "Space below (mobile)", 0, 120, 2),
    ]
    if not is_section:
        s += [
            r("box_py", "Inner padding top/bottom (desktop)", 0, 80, 2),
            r("box_px", "Inner padding left/right (desktop)", 0, 80, 2),
            r("box_py_m", "Inner padding top/bottom (mobile)", 0, 60, 2),
            r("box_px_m", "Inner padding left/right (mobile)", 0, 60, 2),
        ]
    else:
        s.append(r("box_inset", "Side inset", 0, 80, 2))
    s += [
        r("box_radius", "Corner radius", 0, 80, 1),
        r("box_border_width", "Border width", 0, 10, 1),
        {"type": "select", "id": "box_border_style", "label": "Border style", "default": "solid", "visible_if": vis,
         "options": opt(("solid", "Solid"), ("dashed", "Dashed"), ("dotted", "Dotted"), ("double", "Double"))},
        {"type": "color", "id": "box_border_color", "label": "Border color", "visible_if": vis},
        {"type": "color", "id": "box_bg", "label": "Background color", "visible_if": vis},
        {"type": "color_background", "id": "box_bg_gradient", "label": "Background gradient", "visible_if": vis},
        {"type": "select", "id": "box_shadow", "label": "Shadow", "default": "none", "visible_if": vis,
         "options": opt(("none", "None"), ("soft", "Soft"), ("medium", "Medium"), ("hard", "Hard (offset)"), ("glow", "Glow"))},
        {"type": "color", "id": "box_shadow_color", "label": "Shadow color", "default": "#000000", "visible_if": vis},
        {"type": "select", "id": "box_effect", "label": "Hover effect", "default": "none", "visible_if": vis,
         "options": opt(("none", "None"), ("lift", "Lift"), ("grow", "Grow"), ("glow", "Glow"), ("dim", "Dim"))},
        r("box_max_width", "Max width (0 = full)", 0, 1600, 20),
        {"type": "select", "id": "box_align", "label": "Position when narrower", "default": "center", "visible_if": vis,
         "options": opt(("left", "Left"), ("center", "Center"), ("right", "Right"))},
        {"type": "header", "content": "Text style"},
        {"type": "checkbox", "id": "tx_enable", "label": "Customize fonts and spacing", "default": False},
        {"type": "select", "id": "tx_font", "label": "Font", "default": "inherit", "visible_if": tvis,
         "options": opt(("inherit", "Default"), ("display", "Display"), ("heading", "Heading"), ("body", "Body"))},
        {"type": "select", "id": "tx_weight", "label": "Weight", "default": "inherit", "visible_if": tvis,
         "options": opt(("inherit", "Default"), ("300", "Light"), ("400", "Regular"), ("500", "Medium"), ("600", "Semibold"), ("700", "Bold"), ("800", "Extra bold"), ("900", "Black"))},
        {"type": "range", "id": "tx_size", "label": "Font size, desktop (0 = default)", "min": 0, "max": 120, "step": 2, "unit": "px", "default": 0, "visible_if": tvis},
        {"type": "range", "id": "tx_size_m", "label": "Font size, mobile (0 = default)", "min": 0, "max": 96, "step": 2, "unit": "px", "default": 0, "visible_if": tvis},
        {"type": "range", "id": "tx_letter", "label": "Letter spacing (1/100 em)", "min": -10, "max": 40, "step": 1, "default": 0, "visible_if": tvis},
        {"type": "range", "id": "tx_word", "label": "Word spacing (1/100 em)", "min": -20, "max": 100, "step": 2, "default": 0, "visible_if": tvis},
        {"type": "range", "id": "tx_line", "label": "Line height (10 = 1.0, 0 = default)", "min": 0, "max": 30, "step": 1, "default": 0, "visible_if": tvis},
        {"type": "select", "id": "tx_transform", "label": "Letter case", "default": "inherit", "visible_if": tvis,
         "options": opt(("inherit", "Default"), ("none", "As typed"), ("uppercase", "UPPERCASE"), ("lowercase", "lowercase"), ("capitalize", "Capitalize"))},
        {"type": "select", "id": "tx_align", "label": "Alignment", "default": "inherit", "visible_if": tvis,
         "options": opt(("inherit", "Default"), ("left", "Left"), ("center", "Center"), ("right", "Right"))},
        {"type": "color", "id": "tx_color", "label": "Text color", "visible_if": tvis},
    ]
    return s


BLOCK_RENDER = (
    "{%- capture box_sel -%}[data-box=\"{{ block.id }}\"]{%- endcapture -%}\n"
    "{%- render 'box-style', bs: block.settings, sel: box_sel, clip: true -%}\n"
)
SECTION_RENDER = (
    "{%- capture box_sel -%}#shopify-section-{{ section.id }} > :not(style, link, script, template){%- endcapture -%}\n"
    "{%- render 'box-style', bs: section.settings, sel: box_sel -%}\n"
)


def process(path, is_section):
    text = path.read_text()
    m = SCHEMA_RE.search(text)
    if not m:
        return False
    schema = json.loads(m.group(2))
    if any(s.get("id") == "box_enable" for s in schema.get("settings", [])):
        return False
    scope = "section" if is_section else "block"
    schema.setdefault("settings", []).extend(box_settings(scope, is_section))
    body = text[: m.start()]
    if is_section:
        body = SECTION_RENDER + body
    else:
        if "{{ block.shopify_attributes }}" not in body:
            return False
        body = body.replace("{{ block.shopify_attributes }}", 'data-box="{{ block.id }}" {{ block.shopify_attributes }}')
        body = BLOCK_RENDER + body
    new_schema = json.dumps(schema, indent=2, ensure_ascii=False)
    path.write_text(body + m.group(1) + "\n" + new_schema + "\n" + m.group(3) + text[m.end():])
    return True


changed = []
for p in sorted((ROOT / "blocks").glob("*.liquid")):
    if process(p, False):
        changed.append(p.name)
for p in sorted((ROOT / "sections").glob("*.liquid")):
    if p.stem in SKIP_SECTIONS:
        continue
    if process(p, True):
        changed.append(p.name)
print("updated", len(changed), "files")
