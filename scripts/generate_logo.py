import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Canvas setup - supersampled 4x for extreme crispness
SIZE = 1024
SCALE = 2
CANVAS_SIZE = SIZE * SCALE

# Create base image
img = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

cx, cy = CANVAS_SIZE // 2, CANVAS_SIZE // 2

# 1. Background Rounded Hexagon / Squircle
bg_radius = int(450 * SCALE)
bg_color = (10, 13, 20, 255) # Deep slate #0a0d14
border_color = (30, 41, 59, 255) # Border slate-800 #1e293b

# Draw rounded card container
padding = int(40 * SCALE)
card_box = [padding, padding, CANVAS_SIZE - padding, CANVAS_SIZE - padding]
corner_radius = int(180 * SCALE)
draw.rounded_rectangle(card_box, radius=corner_radius, fill=bg_color, outline=border_color, width=int(6 * SCALE))

# Subtle inner tactical grid lines
grid_step = int(60 * SCALE)
grid_color = (20, 28, 42, 120)
for x in range(padding + grid_step, CANVAS_SIZE - padding, grid_step):
    draw.line([(x, padding), (x, CANVAS_SIZE - padding)], fill=grid_color, width=int(1.5 * SCALE))
for y in range(padding + grid_step, CANVAS_SIZE - padding, grid_step):
    draw.line([(padding, y), (CANVAS_SIZE - padding, y)], fill=grid_color, width=int(1.5 * SCALE))

# Clip grid to inner rounded rect
mask = Image.new("L", (CANVAS_SIZE, CANVAS_SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle(card_box, radius=corner_radius, fill=255)
# Composite grid inside mask
# We'll draw elements on top

# 2. Concentric Radar / Scope Rings
# Outer Ring
r_outer = int(320 * SCALE)
draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], outline=(59, 130, 246, 70), width=int(4 * SCALE))

# Mid Dotted/Dashed Ring (simulated with arc ticks)
r_mid = int(240 * SCALE)
draw.ellipse([cx - r_mid, cy - r_mid, cx + r_mid, cy + r_mid], outline=(30, 58, 110, 180), width=int(3 * SCALE))

# Inner Scope Ring
r_inner = int(160 * SCALE)
draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], outline=(6, 182, 212, 120), width=int(4 * SCALE))

# 3. Crosshairs & Reticle Marks
tick_len = int(30 * SCALE)
cross_color = (59, 130, 246, 200) # Cyan-blue
accent_emerald = (16, 185, 129, 230) # Emerald #10b981
accent_cyan = (6, 182, 212, 255)

# 4 Cardinal Crosshairs
gap = int(70 * SCALE)
cross_outer = int(350 * SCALE)
# Left
draw.line([(cx - cross_outer, cy), (cx - gap, cy)], fill=cross_color, width=int(4 * SCALE))
# Right
draw.line([(cx + gap, cy), (cx + cross_outer, cy)], fill=cross_color, width=int(4 * SCALE))
# Top
draw.line([(cx, cy - cross_outer), (cx, cy - gap)], fill=cross_color, width=int(4 * SCALE))
# Bottom
draw.line([(cx, cy + gap), (cx, cy + cross_outer)], fill=cross_color, width=int(4 * SCALE))

# Corner Brackets / Tactical Hud Marks
bracket_r = int(285 * SCALE)
b_len = int(45 * SCALE)
b_width = int(5 * SCALE)
for angle_deg in [45, 135, 225, 315]:
    rad = math.radians(angle_deg)
    bx = cx + bracket_r * math.cos(rad)
    by = cy + bracket_r * math.sin(rad)
    draw.ellipse([bx - int(8*SCALE), by - int(8*SCALE), bx + int(8*SCALE), by + int(8*SCALE)], fill=accent_cyan)

# 4. Dual-Runtime Node Orbits (Representing EVM H160 & Substrate SS58)
node_orbit_r = int(200 * SCALE)
# Node 1: EVM Blue (Top-Right / 30 deg)
rad_evm = math.radians(35)
nx_evm = cx + node_orbit_r * math.cos(rad_evm)
ny_evm = cy - node_orbit_r * math.sin(rad_evm)

# Node 2: Substrate Emerald (Bottom-Left / 215 deg)
rad_sub = math.radians(215)
nx_sub = cx + node_orbit_r * math.cos(rad_sub)
ny_sub = cy - node_orbit_r * math.sin(rad_sub)

# Connecting dual-runtime laser trajectory
draw.line([(nx_evm, ny_evm), (nx_sub, ny_sub)], fill=(59, 130, 246, 90), width=int(3 * SCALE))

# Draw Node 1 (EVM - Hexagon / Diamond)
def draw_poly(center_x, center_y, radius, sides, color, outline_c):
    points = []
    for i in range(sides):
        ang = math.radians(i * (360 / sides) - 90)
        px = center_x + radius * math.cos(ang)
        py = center_y + radius * math.sin(ang)
        points.append((px, py))
    draw.polygon(points, fill=color, outline=outline_c)

# Node 1 Glow & Diamond
draw.ellipse([nx_evm - int(32*SCALE), ny_evm - int(32*SCALE), nx_evm + int(32*SCALE), ny_evm + int(32*SCALE)], fill=(59, 130, 246, 50))
draw_poly(nx_evm, ny_evm, int(22*SCALE), 4, (59, 130, 246, 255), (147, 197, 253, 255))

# Node 2 Glow & Hexagon
draw.ellipse([nx_sub - int(32*SCALE), ny_sub - int(32*SCALE), nx_sub + int(32*SCALE), ny_sub + int(32*SCALE)], fill=(16, 185, 129, 50))
draw_poly(nx_sub, ny_sub, int(22*SCALE), 6, (16, 185, 129, 255), (110, 231, 183, 255))

# 5. Central Tactical Core / Scope Eye
r_core_glow = int(75 * SCALE)
draw.ellipse([cx - r_core_glow, cy - r_core_glow, cx + r_core_glow, cy + r_core_glow], fill=(6, 182, 212, 40))

r_core_outer = int(50 * SCALE)
draw.ellipse([cx - r_core_outer, cy - r_core_outer, cx + r_core_outer, cy + r_core_outer], fill=(15, 23, 42, 255), outline=accent_cyan, width=int(5 * SCALE))

r_core_inner = int(24 * SCALE)
draw.ellipse([cx - r_core_inner, cy - r_core_inner, cx + r_core_inner, cy + r_core_inner], fill=(255, 255, 255, 255))

# 6. Subtle Perimeter Calibration Ticks
for i in range(36):
    ang = math.radians(i * 10)
    tick_outer = r_outer + int(12 * SCALE)
    tick_inner = r_outer - (int(8 * SCALE) if i % 3 == 0 else int(3 * SCALE))
    tx1 = cx + tick_outer * math.cos(ang)
    ty1 = cy + tick_outer * math.sin(ang)
    tx2 = cx + tick_inner * math.cos(ang)
    ty2 = cy + tick_inner * math.sin(ang)
    t_col = (96, 165, 250, 200) if i % 9 == 0 else (59, 130, 246, 90)
    draw.line([(tx1, ty1), (tx2, ty2)], fill=t_col, width=int(2 * SCALE) if i % 9 == 0 else int(1.5 * SCALE))

# Downsample with Lanczos filter for razor-sharp antialiasing
final_logo = img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)

# Save to public directory of project and workspace root
out_path_1 = "E:/AI-Agent/Workspace/portaldot-revivescope/public/logo.png"
out_path_2 = "E:/AI-Agent/Workspace/portaldot-revivescope-logo.png"

os.makedirs(os.path.dirname(out_path_1), exist_ok=True)
final_logo.save(out_path_1, "PNG")
final_logo.save(out_path_2, "PNG")

print("Logo successfully generated at:")
print(out_path_1)
print(out_path_2)
