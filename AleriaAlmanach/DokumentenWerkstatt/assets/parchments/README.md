# Erzeugte Pergamentgrundlagen

Erzeugt mit dem eingebauten Imagegen-Werkzeug, keine API-/CLI-Ausführung.
Beide Original-PNGs liegen im Projekt. Farben und zusätzliche Alterung entstehen danach
reproduzierbar in `js/paper/paper-generator.js`; der Seed wird im Dokument gespeichert.

## archive-ivory.png

1024 × 1536 Pixel, deckendes elfenbeinfarbenes Archivpergament.

Vollständiger Prompt:

> Use case: product-mockup. Asset type: blank parchment background for a fantasy document editor, production PNG asset. Create one high resolution vertical parchment sheet viewed perfectly orthogonally from above, warm pale ivory and honey antique paper with subtle organic fibers, gentle cloudy stains, fine worn grain. Entire central 80% must be blank and clean for highly legible document text, no writing, no letters, no symbols, no objects, no border artwork, no watermarks. The paper occupies the whole rectangular image edge to edge with subtle dark aged corners; flat even lighting, absolutely no perspective. Portrait 2:3 composition. Save the generated image so it can be copied into the project.

## torn-vellum.png

1024 × 1536 Pixel, angerissenes Pergament mit echtem Alpha-Kanal.
Der PNG-Export wurde zusätzlich auf transparente Eckpixel geprüft.

Vollständiger Prompt:

> Use case: product-mockup. Asset type: transparent PNG parchment background for a fantasy document editor. Generate ONE blank antique vellum sheet in portrait 2:3 aspect, top down orthographic, natural warm ivory with gentle honey edge stains, realistic fine paper fibers. Ragged irregular torn edges on all four sides, two slightly deeper tears on the sides, chipped corners. Preserve a large quiet blank central writing area, 80 percent of sheet. Sheet almost fills canvas, only a narrow transparent margin around all torn edges. Background MUST be truly transparent alpha channel, including the missing paper inside tears. No checkerboard baked into image, no floor, no table, no drop shadow, no objects, no writing, no lettering, no symbols, no border decoration. Opaque paper, transparent outside. Production quality high resolution PNG.
