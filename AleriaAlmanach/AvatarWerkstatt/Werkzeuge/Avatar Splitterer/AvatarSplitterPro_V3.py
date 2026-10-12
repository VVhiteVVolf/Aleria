import json
import shutil
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

from PIL import Image, ImageChops, ImageTk

APP_NAME = "Avatar Splitter Pro V3"
CONFIG_FILE = Path(__file__).with_name("splitter_config_v3.json")
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


class AvatarSplitterProV3:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_NAME)
        self.root.geometry("1500x930")
        self.root.minsize(1180, 720)

        self.image = None
        self.image_path = None
        self.preview_photo = None
        self.detail_photo = None
        self.preview_scale = 1.0
        self.preview_origin = (0, 0)
        self.preview_size = (0, 0)

        self.cols = tk.IntVar(value=3)
        self.rows = tk.IntVar(value=3)
        self.gap_x = tk.IntVar(value=0)
        self.gap_y = tk.IntVar(value=0)
        self.autocrop = tk.BooleanVar(value=False)
        self.mode = tk.StringVar(value="cell")
        self.selected_index = tk.IntVar(value=0)

        self.grid_x = []  # normalized positions, includes 0 and 1
        self.grid_y = []
        self.adjustments = []

        self.edge_vars = {
            "left": tk.IntVar(value=0),
            "top": tk.IntVar(value=0),
            "right": tk.IntVar(value=0),
            "bottom": tk.IntVar(value=0),
        }

        self.drag_kind = None
        self.drag_index = None
        self.drag_start = None
        self.drag_start_value = None

        self.load_config()
        self._ensure_layout(reset=True)
        self.build_ui()
        self.bind_events()

    # ---------- UI ----------
    def build_ui(self):
        toolbar = ttk.Frame(self.root, padding=(8, 6))
        toolbar.pack(fill="x")

        ttk.Button(toolbar, text="Bild laden", command=self.load_image).pack(side="left")
        ttk.Button(toolbar, text="3×3", command=lambda: self.set_grid(3, 3)).pack(side="left", padx=(6, 0))

        ttk.Label(toolbar, text="Spalten").pack(side="left", padx=(14, 4))
        cols_box = ttk.Spinbox(toolbar, from_=1, to=20, width=4, textvariable=self.cols, command=self.on_grid_size_changed)
        cols_box.pack(side="left")
        cols_box.bind("<Return>", lambda e: self.on_grid_size_changed())
        cols_box.bind("<FocusOut>", lambda e: self.on_grid_size_changed())

        ttk.Label(toolbar, text="Zeilen").pack(side="left", padx=(10, 4))
        rows_box = ttk.Spinbox(toolbar, from_=1, to=20, width=4, textvariable=self.rows, command=self.on_grid_size_changed)
        rows_box.pack(side="left")
        rows_box.bind("<Return>", lambda e: self.on_grid_size_changed())
        rows_box.bind("<FocusOut>", lambda e: self.on_grid_size_changed())

        ttk.Label(toolbar, text="Lücke X").pack(side="left", padx=(14, 4))
        gapx = ttk.Spinbox(toolbar, from_=0, to=300, width=5, textvariable=self.gap_x, command=self.refresh)
        gapx.pack(side="left")
        gapx.bind("<KeyRelease>", lambda e: self.refresh())

        ttk.Label(toolbar, text="Lücke Y").pack(side="left", padx=(10, 4))
        gapy = ttk.Spinbox(toolbar, from_=0, to=300, width=5, textvariable=self.gap_y, command=self.refresh)
        gapy.pack(side="left")
        gapy.bind("<KeyRelease>", lambda e: self.refresh())

        ttk.Checkbutton(toolbar, text="Autocrop", variable=self.autocrop, command=self.refresh).pack(side="left", padx=12)

        ttk.Button(toolbar, text="Raster zurücksetzen", command=self.reset_grid).pack(side="left", padx=4)
        ttk.Button(toolbar, text="Alle Korrekturen löschen", command=self.reset_all_adjustments).pack(side="left", padx=4)
        ttk.Button(toolbar, text="Ordner verarbeiten", command=self.process_folder).pack(side="right")

        body = ttk.Panedwindow(self.root, orient="horizontal")
        body.pack(fill="both", expand=True, padx=8, pady=(0, 8))

        left = ttk.Frame(body)
        right = ttk.Frame(body, width=360)
        body.add(left, weight=4)
        body.add(right, weight=1)

        modebar = ttk.Frame(left, padding=(0, 2, 0, 6))
        modebar.pack(fill="x")
        ttk.Label(modebar, text="Mausmodus:").pack(side="left")
        ttk.Radiobutton(modebar, text="Einzelzelle / einzelne Kante", variable=self.mode, value="cell", command=self.refresh).pack(side="left", padx=(8, 0))
        ttk.Radiobutton(modebar, text="Rasterlinien verschieben", variable=self.mode, value="grid", command=self.refresh).pack(side="left", padx=(12, 0))
        ttk.Label(modebar, text="  |  Klick auf Zelle = auswählen").pack(side="left", padx=(14, 0))

        canvas_frame = ttk.Frame(left)
        canvas_frame.pack(fill="both", expand=True)
        self.canvas = tk.Canvas(canvas_frame, bg="#171717", highlightthickness=0, cursor="crosshair")
        self.canvas.pack(fill="both", expand=True)

        self.status = ttk.Label(left, text="Bild laden. Danach Zelle anklicken und eine Kante ziehen.", anchor="w")
        self.status.pack(fill="x", pady=(5, 0))

        # Right panel
        ttk.Label(right, text="Ausgewählter Avatar", font=("Segoe UI", 12, "bold")).pack(anchor="w", pady=(4, 6))
        self.selected_label = ttk.Label(right, text="Avatar 1")
        self.selected_label.pack(anchor="w")

        self.detail_canvas = tk.Canvas(right, width=310, height=310, bg="#222", highlightthickness=1, highlightbackground="#555")
        self.detail_canvas.pack(pady=8)

        ttk.Label(right, text="Kantenkorrektur in Original-Pixeln", font=("Segoe UI", 10, "bold")).pack(anchor="w", pady=(4, 5))
        edge_grid = ttk.Frame(right)
        edge_grid.pack(fill="x")

        labels = [("left", "Links"), ("top", "Oben"), ("right", "Rechts"), ("bottom", "Unten")]
        for row, (key, text) in enumerate(labels):
            ttk.Label(edge_grid, text=text, width=9).grid(row=row, column=0, sticky="w", pady=2)
            spin = ttk.Spinbox(edge_grid, from_=-1000, to=1000, width=8, textvariable=self.edge_vars[key], command=self.apply_edge_vars)
            spin.grid(row=row, column=1, sticky="w", pady=2)
            spin.bind("<KeyRelease>", lambda e: self.apply_edge_vars())
            spin.bind("<FocusOut>", lambda e: self.apply_edge_vars())
            ttk.Button(edge_grid, text="−1", width=4, command=lambda k=key: self.nudge_edge(k, -1)).grid(row=row, column=2, padx=(8, 2))
            ttk.Button(edge_grid, text="+1", width=4, command=lambda k=key: self.nudge_edge(k, 1)).grid(row=row, column=3, padx=2)
            ttk.Button(edge_grid, text="−10", width=4, command=lambda k=key: self.nudge_edge(k, -10)).grid(row=row, column=4, padx=2)
            ttk.Button(edge_grid, text="+10", width=4, command=lambda k=key: self.nudge_edge(k, 10)).grid(row=row, column=5, padx=2)

        ttk.Button(right, text="Nur diesen Avatar zurücksetzen", command=self.reset_selected_adjustment).pack(fill="x", pady=(10, 4))

        sep = ttk.Separator(right)
        sep.pack(fill="x", pady=10)

        ttk.Label(right, text="Bedienung", font=("Segoe UI", 10, "bold")).pack(anchor="w")
        help_text = (
            "Einzelzelle:\n"
            "• Avatar anklicken\n"
            "• nahe an dessen Kante klicken und ziehen\n"
            "• nur diese eine Kante verändert sich\n\n"
            "Rasterlinien:\n"
            "• rote Trennlinie ziehen\n"
            "• beide angrenzenden Bereiche folgen\n\n"
            "Pfeiltasten:\n"
            "• ausgewählte Zelle wechseln\n"
            "• Alt + Pfeil = passende Kante um 1 px\n"
            "• Alt + Shift + Pfeil = 10 px"
        )
        ttk.Label(right, text=help_text, justify="left").pack(anchor="w", pady=(5, 0))

        ttk.Button(right, text="Aktuelles Bild als 9/alle Avatare exportieren", command=self.export_current_image).pack(fill="x", side="bottom", pady=(8, 0))

    def bind_events(self):
        self.canvas.bind("<Configure>", lambda e: self.refresh())
        self.canvas.bind("<Button-1>", self.on_mouse_down)
        self.canvas.bind("<B1-Motion>", self.on_mouse_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_mouse_up)
        self.root.bind("<KeyPress>", self.on_keypress)

    # ---------- Configuration / layout ----------
    def load_config(self):
        try:
            if CONFIG_FILE.exists():
                data = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
                self.cols.set(int(data.get("cols", 3)))
                self.rows.set(int(data.get("rows", 3)))
                self.gap_x.set(int(data.get("gap_x", 0)))
                self.gap_y.set(int(data.get("gap_y", 0)))
                self.autocrop.set(bool(data.get("autocrop", False)))
        except Exception:
            pass

    def save_config(self):
        data = {
            "cols": self.safe_int(self.cols, 3),
            "rows": self.safe_int(self.rows, 3),
            "gap_x": self.safe_int(self.gap_x, 0),
            "gap_y": self.safe_int(self.gap_y, 0),
            "autocrop": bool(self.autocrop.get()),
        }
        try:
            CONFIG_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception:
            pass

    @staticmethod
    def safe_int(var, fallback=0):
        try:
            return int(var.get())
        except Exception:
            return fallback

    def _ensure_layout(self, reset=False):
        cols = max(1, self.safe_int(self.cols, 3))
        rows = max(1, self.safe_int(self.rows, 3))
        count = cols * rows

        if reset or len(self.grid_x) != cols + 1:
            self.grid_x = [i / cols for i in range(cols + 1)]
        if reset or len(self.grid_y) != rows + 1:
            self.grid_y = [i / rows for i in range(rows + 1)]
        if reset or len(self.adjustments) != count:
            self.adjustments = [self.empty_adjustment() for _ in range(count)]

        if self.selected_index.get() >= count:
            self.selected_index.set(count - 1)
        if self.selected_index.get() < 0:
            self.selected_index.set(0)
        self.sync_edge_vars()

    @staticmethod
    def empty_adjustment():
        return {"left": 0, "top": 0, "right": 0, "bottom": 0}

    def set_grid(self, cols, rows):
        self.cols.set(cols)
        self.rows.set(rows)
        self._ensure_layout(reset=True)
        self.refresh()

    def on_grid_size_changed(self):
        self._ensure_layout(reset=True)
        self.refresh()

    def reset_grid(self):
        cols = max(1, self.safe_int(self.cols, 3))
        rows = max(1, self.safe_int(self.rows, 3))
        self.grid_x = [i / cols for i in range(cols + 1)]
        self.grid_y = [i / rows for i in range(rows + 1)]
        self.refresh()

    def reset_all_adjustments(self):
        self.adjustments = [self.empty_adjustment() for _ in self.adjustments]
        self.sync_edge_vars()
        self.refresh()

    def reset_selected_adjustment(self):
        if not self.adjustments:
            return
        self.adjustments[self.selected_index.get()] = self.empty_adjustment()
        self.sync_edge_vars()
        self.refresh()

    # ---------- Image handling ----------
    def load_image(self):
        file = filedialog.askopenfilename(filetypes=[("Bilder", "*.png *.jpg *.jpeg *.webp")])
        if not file:
            return
        try:
            with Image.open(file) as im:
                self.image = im.convert("RGBA")
            self.image_path = Path(file)
            self._ensure_layout(reset=True)
            self.refresh()
        except Exception as exc:
            messagebox.showerror("Fehler", f"Bild konnte nicht geladen werden:\n{exc}")

    def base_boxes(self, img):
        cols = max(1, self.safe_int(self.cols, 3))
        rows = max(1, self.safe_int(self.rows, 3))
        w, h = img.size
        gx = max(0, self.safe_int(self.gap_x, 0))
        gy = max(0, self.safe_int(self.gap_y, 0))
        boxes = []

        for r in range(rows):
            for c in range(cols):
                left = round(self.grid_x[c] * w)
                right = round(self.grid_x[c + 1] * w)
                top = round(self.grid_y[r] * h)
                bottom = round(self.grid_y[r + 1] * h)

                if c > 0:
                    left += gx // 2
                if c < cols - 1:
                    right -= gx - gx // 2
                if r > 0:
                    top += gy // 2
                if r < rows - 1:
                    bottom -= gy - gy // 2
                boxes.append([left, top, right, bottom])
        return boxes

    def crop_box(self, img, index):
        boxes = self.base_boxes(img)
        if not boxes:
            return (0, 0, img.width, img.height)
        index = min(max(0, index), len(boxes) - 1)
        left, top, right, bottom = boxes[index]
        adj = self.adjustments[index]

        # Positive left/top move inward/right/down. Positive right/bottom expand outward.
        left += int(adj["left"])
        top += int(adj["top"])
        right += int(adj["right"])
        bottom += int(adj["bottom"])

        left = max(0, min(left, img.width - 1))
        top = max(0, min(top, img.height - 1))
        right = max(left + 1, min(right, img.width))
        bottom = max(top + 1, min(bottom, img.height))
        return (left, top, right, bottom)

    def get_crops(self, img):
        crops = []
        for i in range(len(self.adjustments)):
            crop = img.crop(self.crop_box(img, i))
            if self.autocrop.get() and crop.width > 1 and crop.height > 1:
                try:
                    bg = Image.new(crop.mode, crop.size, crop.getpixel((0, 0)))
                    diff = ImageChops.difference(crop, bg)
                    bbox = diff.getbbox()
                    if bbox:
                        crop = crop.crop(bbox)
                except Exception:
                    pass
            crops.append(crop)
        return crops

    # ---------- Preview ----------
    def refresh(self):
        if not hasattr(self, "canvas"):
            return
        self.draw_main_preview()
        self.draw_detail_preview()
        self.update_selected_label()

    def draw_main_preview(self):
        self.canvas.delete("all")
        if self.image is None:
            self.canvas.create_text(30, 30, anchor="nw", fill="#ddd", text="Bild laden", font=("Segoe UI", 18, "bold"))
            return

        cw = max(100, self.canvas.winfo_width())
        ch = max(100, self.canvas.winfo_height())
        iw, ih = self.image.size
        scale = min((cw - 30) / iw, (ch - 30) / ih, 1.0)
        scale = max(scale, 0.02)
        pw, ph = max(1, round(iw * scale)), max(1, round(ih * scale))
        preview = self.image.resize((pw, ph), Image.Resampling.LANCZOS)
        self.preview_photo = ImageTk.PhotoImage(preview)
        ox = max(10, (cw - pw) // 2)
        oy = max(10, (ch - ph) // 2)
        self.preview_scale = scale
        self.preview_origin = (ox, oy)
        self.preview_size = (pw, ph)
        self.canvas.create_image(ox, oy, image=self.preview_photo, anchor="nw")

        cols = max(1, self.safe_int(self.cols, 3))
        rows = max(1, self.safe_int(self.rows, 3))

        # Global grid lines
        for c in range(1, cols):
            x = ox + self.grid_x[c] * pw
            self.canvas.create_line(x, oy, x, oy + ph, fill="#ff4d4d", width=2, dash=(7, 4), tags=("grid",))
        for r in range(1, rows):
            y = oy + self.grid_y[r] * ph
            self.canvas.create_line(ox, y, ox + pw, y, fill="#ff4d4d", width=2, dash=(7, 4), tags=("grid",))

        # Cell rectangles and labels, including individual corrections
        for idx in range(cols * rows):
            l, t, r, b = self.crop_box(self.image, idx)
            x1, y1 = ox + l * scale, oy + t * scale
            x2, y2 = ox + r * scale, oy + b * scale
            selected = idx == self.selected_index.get()
            width = 4 if selected else 1
            color = "#32d583" if selected else "#ffd166"
            self.canvas.create_rectangle(x1, y1, x2, y2, outline=color, width=width, tags=(f"cell{idx}",))
            self.canvas.create_text(x1 + 7, y1 + 7, text=str(idx + 1), anchor="nw", fill=color, font=("Segoe UI", 10, "bold"))

        if self.mode.get() == "cell":
            self.draw_selected_edge_handles()

    def draw_selected_edge_handles(self):
        if self.image is None or not self.adjustments:
            return
        idx = self.selected_index.get()
        l, t, r, b = self.crop_box(self.image, idx)
        ox, oy = self.preview_origin
        s = self.preview_scale
        x1, y1, x2, y2 = ox + l * s, oy + t * s, ox + r * s, oy + b * s
        handle = 8
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        for x, y, tag in [(x1, my, "left"), (x2, my, "right"), (mx, y1, "top"), (mx, y2, "bottom")]:
            self.canvas.create_rectangle(x - handle, y - handle, x + handle, y + handle, fill="#32d583", outline="white", tags=("handle", tag))

    def draw_detail_preview(self):
        self.detail_canvas.delete("all")
        if self.image is None or not self.adjustments:
            return
        idx = self.selected_index.get()
        crop = self.image.crop(self.crop_box(self.image, idx))
        max_w = max(1, self.detail_canvas.winfo_width() - 12)
        max_h = max(1, self.detail_canvas.winfo_height() - 12)
        crop.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
        self.detail_photo = ImageTk.PhotoImage(crop)
        x = self.detail_canvas.winfo_width() // 2
        y = self.detail_canvas.winfo_height() // 2
        self.detail_canvas.create_image(x, y, image=self.detail_photo, anchor="center")

    def update_selected_label(self):
        idx = self.selected_index.get()
        cols = max(1, self.safe_int(self.cols, 3))
        row = idx // cols + 1
        col = idx % cols + 1
        self.selected_label.configure(text=f"Avatar {idx + 1}  •  Zeile {row}, Spalte {col}")

    # ---------- Selection / adjustments ----------
    def select_cell_at(self, x, y):
        if self.image is None:
            return None
        ix, iy = self.canvas_to_image(x, y)
        if ix is None:
            return None
        boxes = self.base_boxes(self.image)
        for idx, (l, t, r, b) in enumerate(boxes):
            if l <= ix <= r and t <= iy <= b:
                self.selected_index.set(idx)
                self.sync_edge_vars()
                return idx
        return None

    def sync_edge_vars(self):
        if not self.adjustments:
            return
        idx = min(max(0, self.selected_index.get()), len(self.adjustments) - 1)
        adj = self.adjustments[idx]
        for key, var in self.edge_vars.items():
            var.set(int(adj[key]))

    def apply_edge_vars(self):
        if not self.adjustments:
            return
        idx = self.selected_index.get()
        for key, var in self.edge_vars.items():
            try:
                self.adjustments[idx][key] = int(var.get())
            except Exception:
                pass
        self.refresh()

    def nudge_edge(self, key, delta):
        if not self.adjustments:
            return
        idx = self.selected_index.get()
        self.adjustments[idx][key] += delta
        self.sync_edge_vars()
        self.refresh()

    def nearest_selected_edge(self, x, y, threshold=14):
        if self.image is None:
            return None
        idx = self.selected_index.get()
        l, t, r, b = self.crop_box(self.image, idx)
        ox, oy = self.preview_origin
        s = self.preview_scale
        x1, y1, x2, y2 = ox + l * s, oy + t * s, ox + r * s, oy + b * s
        candidates = []
        if y1 - threshold <= y <= y2 + threshold:
            candidates.extend([("left", abs(x - x1)), ("right", abs(x - x2))])
        if x1 - threshold <= x <= x2 + threshold:
            candidates.extend([("top", abs(y - y1)), ("bottom", abs(y - y2))])
        if not candidates:
            return None
        edge, distance = min(candidates, key=lambda item: item[1])
        return edge if distance <= threshold else None

    def nearest_grid_line(self, x, y, threshold=12):
        if self.image is None:
            return None
        ox, oy = self.preview_origin
        pw, ph = self.preview_size
        cols = max(1, self.safe_int(self.cols, 3))
        rows = max(1, self.safe_int(self.rows, 3))
        if not (ox - threshold <= x <= ox + pw + threshold and oy - threshold <= y <= oy + ph + threshold):
            return None

        choices = []
        for i in range(1, cols):
            gx = ox + self.grid_x[i] * pw
            choices.append(("x", i, abs(x - gx)))
        for i in range(1, rows):
            gy = oy + self.grid_y[i] * ph
            choices.append(("y", i, abs(y - gy)))
        if not choices:
            return None
        axis, idx, dist = min(choices, key=lambda item: item[2])
        return (axis, idx) if dist <= threshold else None

    def on_mouse_down(self, event):
        if self.image is None:
            return

        if self.mode.get() == "grid":
            hit = self.nearest_grid_line(event.x, event.y)
            if hit:
                self.drag_kind = "grid"
                self.drag_index = hit
                return
            self.select_cell_at(event.x, event.y)
            self.refresh()
            return

        # In individual mode, first try current cell edge. If not hit, select cell and try again.
        edge = self.nearest_selected_edge(event.x, event.y)
        if edge is None:
            self.select_cell_at(event.x, event.y)
            edge = self.nearest_selected_edge(event.x, event.y)
            self.refresh()
        if edge:
            idx = self.selected_index.get()
            self.drag_kind = "edge"
            self.drag_index = edge
            self.drag_start = (event.x, event.y)
            self.drag_start_value = self.adjustments[idx][edge]

    def on_mouse_drag(self, event):
        if self.image is None or self.drag_kind is None:
            return

        if self.drag_kind == "grid":
            axis, idx = self.drag_index
            ox, oy = self.preview_origin
            pw, ph = self.preview_size
            min_gap = 0.02
            if axis == "x" and pw > 0:
                value = (event.x - ox) / pw
                value = max(self.grid_x[idx - 1] + min_gap, min(value, self.grid_x[idx + 1] - min_gap))
                self.grid_x[idx] = value
            elif axis == "y" and ph > 0:
                value = (event.y - oy) / ph
                value = max(self.grid_y[idx - 1] + min_gap, min(value, self.grid_y[idx + 1] - min_gap))
                self.grid_y[idx] = value
            self.refresh()
            return

        if self.drag_kind == "edge":
            edge = self.drag_index
            dx = event.x - self.drag_start[0]
            dy = event.y - self.drag_start[1]
            px_dx = round(dx / self.preview_scale)
            px_dy = round(dy / self.preview_scale)
            delta = px_dx if edge in ("left", "right") else px_dy
            idx = self.selected_index.get()
            self.adjustments[idx][edge] = self.drag_start_value + delta
            self.sync_edge_vars()
            self.refresh()

    def on_mouse_up(self, event):
        self.drag_kind = None
        self.drag_index = None
        self.drag_start = None
        self.drag_start_value = None

    def canvas_to_image(self, x, y):
        if self.image is None:
            return (None, None)
        ox, oy = self.preview_origin
        pw, ph = self.preview_size
        if not (ox <= x <= ox + pw and oy <= y <= oy + ph):
            return (None, None)
        return ((x - ox) / self.preview_scale, (y - oy) / self.preview_scale)

    def on_keypress(self, event):
        if self.image is None:
            return
        if event.keysym not in {"Left", "Right", "Up", "Down"}:
            return

        alt = bool(event.state & 0x0008) or bool(event.state & 0x20000)
        shift = bool(event.state & 0x0001)
        amount = 10 if shift else 1
        cols = max(1, self.safe_int(self.cols, 3))
        rows = max(1, self.safe_int(self.rows, 3))
        idx = self.selected_index.get()

        if alt:
            mapping = {
                "Left": ("left", -amount),
                "Right": ("right", amount),
                "Up": ("top", -amount),
                "Down": ("bottom", amount),
            }
            edge, delta = mapping[event.keysym]
            self.nudge_edge(edge, delta)
            return "break"

        row, col = divmod(idx, cols)
        if event.keysym == "Left":
            col = max(0, col - 1)
        elif event.keysym == "Right":
            col = min(cols - 1, col + 1)
        elif event.keysym == "Up":
            row = max(0, row - 1)
        elif event.keysym == "Down":
            row = min(rows - 1, row + 1)
        self.selected_index.set(row * cols + col)
        self.sync_edge_vars()
        self.refresh()
        return "break"

    # ---------- Export ----------
    def export_current_image(self):
        if self.image is None:
            messagebox.showwarning("Kein Bild", "Bitte zuerst ein Bild laden.")
            return
        folder = filedialog.askdirectory(title="Ausgabeordner wählen")
        if not folder:
            return
        out = Path(folder)
        base = self.image_path.stem if self.image_path else "AvatarSet"
        try:
            crops = self.get_crops(self.image)
            for i, crop in enumerate(crops, 1):
                crop.save(out / f"{base}_Bild{i}.png")
            self.save_config()
            messagebox.showinfo("Fertig", f"{len(crops)} Avatare exportiert nach:\n{out}")
        except Exception as exc:
            messagebox.showerror("Exportfehler", str(exc))

    def process_folder(self):
        folder = filedialog.askdirectory(title="Ordner mit Avatar-Sets wählen")
        if not folder:
            return
        folder = Path(folder)
        output = folder / "output"
        used = folder / "Benutzt"
        output.mkdir(exist_ok=True)
        used.mkdir(exist_ok=True)

        files = [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS]
        if not files:
            messagebox.showinfo("Keine Bilder", "Im ausgewählten Ordner wurden keine unterstützten Bilder gefunden.")
            return

        count = 0
        errors = []
        for file in files:
            try:
                with Image.open(file) as im:
                    img = im.convert("RGBA")
                crops = self.get_crops(img)
                for idx, crop in enumerate(crops, 1):
                    n = 1
                    while True:
                        name = f"Bild{idx}.png" if n == 1 else f"Bild{idx}_{n}.png"
                        target = output / name
                        if not target.exists():
                            crop.save(target)
                            break
                        n += 1
                destination = used / file.name
                if destination.exists():
                    stem, suffix = file.stem, file.suffix
                    n = 2
                    while (used / f"{stem}_{n}{suffix}").exists():
                        n += 1
                    destination = used / f"{stem}_{n}{suffix}"
                shutil.move(str(file), str(destination))
                count += 1
            except Exception as exc:
                errors.append(f"{file.name}: {exc}")

        self.save_config()
        text = f"{count} Bild(er) verarbeitet.\nAusgabe: {output}\nOriginale: {used}"
        if errors:
            text += f"\n\n{len(errors)} Fehler:\n" + "\n".join(errors[:8])
        messagebox.showinfo("Fertig", text)


if __name__ == "__main__":
    root = tk.Tk()
    try:
        root.tk.call("tk", "scaling", 1.1)
    except Exception:
        pass
    AvatarSplitterProV3(root)
    root.mainloop()
