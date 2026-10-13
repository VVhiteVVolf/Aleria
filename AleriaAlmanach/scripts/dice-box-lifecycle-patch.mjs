// Pinned Dice Box 1.1.4 has no canvas transfer API and registers another resize
// listener on each show(). Keep one renderer/physics pair for all Aleria boards.
export function patchDiceBoxLifecycleSource(source) {
  const pattern = /  resizeWorld\(\) \{\n    const b = pl\(\(\) => \{\n      W\(this, u\)\.resize\([\s\S]*?\n    window\.addEventListener\("resize", b\);\n  \}\n  async init\(\) \{/g;
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) throw new Error(`Dice-Box-Lifecycle erwartet genau eine Resize-Methode, gefunden: ${matches.length}.`);
  return source.replace(pattern, `  resizeWorld() {
    if (!this.aleriaResizeHandler) {
      this.aleriaResizeHandler = pl(() => {
        if (!this.aleriaWorldReady) return;
        W(this, u).resize({ width: this.canvas.clientWidth, height: this.canvas.clientHeight });
        if (W(this, p)) W(this, p).postMessage({ action: "resize", width: this.canvas.clientWidth, height: this.canvas.clientHeight });
      });
      window.addEventListener("resize", this.aleriaResizeHandler);
    }
  }
  mount(container) {
    if (!container?.id || !this.canvas) throw new Error("Dice board unavailable");
    container.appendChild(this.canvas);
    this.config.container = "#" + container.id;
    this.resizeWorld();
    this.aleriaWorldReady = true;
    this.aleriaResizeHandler();
    return this;
  }
  async init() {`);
}
