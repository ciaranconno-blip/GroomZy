"""
Generates placeholder PWA/Android icons matching the in-app logo mark
(indigo gradient square, dark inner square, indigo "G"). Swap for a real
designed icon before Play Store submission — these exist so the manifest
and TWA build have something valid to point at right now.
"""
from PIL import Image, ImageDraw, ImageFont

INDIGO_LIGHT = (129, 140, 248)   # #818cf8
INDIGO_DARK = (99, 102, 241)     # #6366f1
BG_DARK = (12, 12, 20)           # #0c0c14
FONT_PATH = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

def make_icon(size: int, path: str, maskable: bool = False):
    img = Image.new("RGB", (size, size), INDIGO_LIGHT)
    draw = ImageDraw.Draw(img)

    # crude vertical gradient indigo -> purple-ish, close enough for a placeholder
    for y in range(size):
        t = y / size
        r = int(INDIGO_LIGHT[0] + (99 - INDIGO_LIGHT[0]) * t)
        g = int(INDIGO_LIGHT[1] + (60 - INDIGO_LIGHT[1]) * t)
        b = int(INDIGO_LIGHT[2] + (230 - INDIGO_LIGHT[2]) * t)
        draw.line([(0, y), (size, y)], fill=(r, g, b))

    # maskable icons need content inside a safe zone (~66% of the canvas, centered)
    inner_margin = int(size * (0.22 if maskable else 0.08))
    inner_box = [inner_margin, inner_margin, size - inner_margin, size - inner_margin]
    radius = int(size * 0.2)
    draw.rounded_rectangle(inner_box, radius=radius, fill=BG_DARK)

    font_size = int((inner_box[2] - inner_box[0]) * 0.55)
    font = ImageFont.truetype(FONT_PATH, font_size)
    text = "G"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    cx = (inner_box[0] + inner_box[2]) / 2
    cy = (inner_box[1] + inner_box[3]) / 2
    draw.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1]), text, fill=INDIGO_LIGHT, font=font)

    img.save(path, "PNG")
    print(f"wrote {path}")

make_icon(192, "public/icons/icon-192.png")
make_icon(512, "public/icons/icon-512.png")
make_icon(512, "public/icons/icon-maskable-512.png", maskable=True)
make_icon(180, "public/icons/apple-touch-icon.png")
