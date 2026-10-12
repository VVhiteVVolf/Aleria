
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
from PIL import Image, ImageTk, ImageChops
import json
import shutil

CONFIG_FILE = "splitter_config.json"

class AvatarSplitterPro:

    def __init__(self, root):
        self.root = root
        self.root.title("Avatar Splitter Pro V2")
        self.root.geometry("1400x900")

        self.image = None
        self.preview_img = None

        self.cols = tk.IntVar(value=2)
        self.rows = tk.IntVar(value=2)
        self.gap_x = tk.IntVar(value=6)
        self.gap_y = tk.IntVar(value=6)
        self.autocrop = tk.BooleanVar(value=False)

        self.load_config()
        self.build_ui()

    def build_ui(self):

        top = ttk.Frame(self.root)
        top.pack(fill="x", padx=5, pady=5)

        ttk.Button(top, text="Bild laden", command=self.load_image).pack(side="left")

        ttk.Label(top, text="Spalten").pack(side="left", padx=5)
        ttk.Spinbox(top, from_=1, to=20, width=5, textvariable=self.cols).pack(side="left")

        ttk.Label(top, text="Zeilen").pack(side="left", padx=5)
        ttk.Spinbox(top, from_=1, to=20, width=5, textvariable=self.rows).pack(side="left")

        ttk.Label(top, text="Vert. Lücke").pack(side="left", padx=5)
        ttk.Spinbox(top, from_=0, to=100, width=5, textvariable=self.gap_x).pack(side="left")

        ttk.Label(top, text="Horiz. Lücke").pack(side="left", padx=5)
        ttk.Spinbox(top, from_=0, to=100, width=5, textvariable=self.gap_y).pack(side="left")

        ttk.Checkbutton(top, text="Autocrop", variable=self.autocrop).pack(side="left", padx=10)

        ttk.Button(top, text="Kreuz automatisch erkennen", command=self.detect_cross).pack(side="left", padx=5)
        ttk.Button(top, text="Vorschau aktualisieren", command=self.update_preview).pack(side="left", padx=5)
        ttk.Button(top, text="Ordner verarbeiten", command=self.process_folder).pack(side="right")

        main = ttk.Frame(self.root)
        main.pack(fill="both", expand=True)

        self.canvas = tk.Canvas(main, bg="black")
        self.canvas.pack(side="left", fill="both", expand=True)

        self.preview_frame = ttk.Frame(main)
        self.preview_frame.pack(side="right", fill="y")

    def load_config(self):
        try:
            if Path(CONFIG_FILE).exists():
                data = json.loads(Path(CONFIG_FILE).read_text(encoding="utf8"))
                self.cols.set(data.get("cols", 2))
                self.rows.set(data.get("rows", 2))
                self.gap_x.set(data.get("gap_x", 6))
                self.gap_y.set(data.get("gap_y", 6))
        except:
            pass

    def save_config(self):
        data = {
            "cols": self.cols.get(),
            "rows": self.rows.get(),
            "gap_x": self.gap_x.get(),
            "gap_y": self.gap_y.get()
        }
        Path(CONFIG_FILE).write_text(json.dumps(data), encoding="utf8")

    def load_image(self):
        file = filedialog.askopenfilename(
            filetypes=[("Images", "*.png *.jpg *.jpeg *.webp")]
        )
        if not file:
            return

        self.image = Image.open(file)
        self.update_preview()

    def detect_cross(self):

        if not self.image:
            return

        w, h = self.image.size

        center_x = w // 2
        center_y = h // 2

        img = self.image.convert("L")

        vx = 0
        for x in range(center_x - 25, center_x + 25):
            column = [img.getpixel((x, y)) for y in range(h)]
            avg = sum(column) / len(column)
            if avg > 230:
                vx += 1

        hy = 0
        for y in range(center_y - 25, center_y + 25):
            row = [img.getpixel((x, y)) for x in range(w)]
            avg = sum(row) / len(row)
            if avg > 230:
                hy += 1

        if vx > 0:
            self.gap_x.set(vx)

        if hy > 0:
            self.gap_y.set(hy)

        self.update_preview()

        messagebox.showinfo(
            "Erkennung",
            f"Vertikale Trennlinie: {vx}px\nHorizontale Trennlinie: {hy}px"
        )

    def get_crops(self, img):

        cols = self.cols.get()
        rows = self.rows.get()

        w, h = img.size

        cell_w = w / cols
        cell_h = h / rows

        crops = []

        for r in range(rows):
            for c in range(cols):

                left = int(c * cell_w)
                top = int(r * cell_h)
                right = int((c + 1) * cell_w)
                bottom = int((r + 1) * cell_h)

                if c > 0:
                    left += self.gap_x.get() // 2

                if c < cols - 1:
                    right -= self.gap_x.get() // 2

                if r > 0:
                    top += self.gap_y.get() // 2

                if r < rows - 1:
                    bottom -= self.gap_y.get() // 2

                crop = img.crop((left, top, right, bottom))

                if self.autocrop.get():
                    bg = Image.new(crop.mode, crop.size, crop.getpixel((0, 0)))
                    diff = ImageChops.difference(crop, bg)
                    bbox = diff.getbbox()
                    if bbox:
                        crop = crop.crop(bbox)

                crops.append(crop)

        return crops

    def update_preview(self):

        if not self.image:
            return

        self.canvas.delete("all")

        img = self.image.copy()
        img.thumbnail((900, 800))

        self.preview_img = ImageTk.PhotoImage(img)
        self.canvas.create_image(0, 0, image=self.preview_img, anchor="nw")

        w, h = img.size

        cols = self.cols.get()
        rows = self.rows.get()

        for c in range(1, cols):
            x = w * c / cols
            self.canvas.create_line(x, 0, x, h, fill="red", width=2)

        for r in range(1, rows):
            y = h * r / rows
            self.canvas.create_line(0, y, w, y, fill="red", width=2)

        for widget in self.preview_frame.winfo_children():
            widget.destroy()

        crops = self.get_crops(self.image)

        for i, crop in enumerate(crops[:12]):

            thumb = crop.copy()
            thumb.thumbnail((120, 120))

            tkimg = ImageTk.PhotoImage(thumb)

            lbl = ttk.Label(self.preview_frame, image=tkimg)
            lbl.image = tkimg
            lbl.pack(pady=2)

    def process_folder(self):

        folder = filedialog.askdirectory()
        if not folder:
            return

        folder = Path(folder)

        output = folder / "output"
        used = folder / "Benutzt"

        output.mkdir(exist_ok=True)
        used.mkdir(exist_ok=True)

        files = [
            f for f in folder.iterdir()
            if f.suffix.lower() in [".png", ".jpg", ".jpeg", ".webp"]
        ]

        count = 0

        for file in files:

            img = Image.open(file)

            crops = self.get_crops(img)

            for idx, crop in enumerate(crops, start=1):

                n = 1

                while True:

                    name = f"Bild{idx}.png" if n == 1 else f"Bild{idx}_{n}.png"
                    target = output / name

                    if not target.exists():
                        crop.save(target)
                        break

                    n += 1

            shutil.move(str(file), str(used / file.name))
            count += 1

        self.save_config()

        messagebox.showinfo("Fertig", f"{count} Bilder verarbeitet.")


root = tk.Tk()
AvatarSplitterPro(root)
root.mainloop()
