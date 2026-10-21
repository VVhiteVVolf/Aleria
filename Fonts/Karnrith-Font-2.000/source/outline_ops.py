"""Combine filled glyph parts without cancellation at mirrored overlaps."""
import pathops
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen

def union_parts(glyphs, parts):
    merged = None
    for name, transform in parts:
        outline = pathops.Path()
        glyphs[name].draw(TransformPen(outline.getPen(), transform), glyphs)
        outline = pathops.simplify(outline, clockwise=True)
        merged = outline if merged is None else pathops.op(merged, outline, pathops.PathOp.UNION, clockwise=True)
    pen = TTGlyphPen(None)
    if merged is not None:
        merged.draw(Cu2QuPen(pen, max_err=.5))
    return pen.glyph()
