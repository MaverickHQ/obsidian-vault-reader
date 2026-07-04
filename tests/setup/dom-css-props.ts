if (typeof HTMLElement !== "undefined" && !("setCssProps" in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, "setCssProps", {
    value(this: HTMLElement, props: Record<string, string>) {
      for (const [name, value] of Object.entries(props)) {
        this.style.setProperty(name, value);
      }
    },
  });
}

if (typeof document !== "undefined") {
  (globalThis as unknown as { activeDocument?: Document }).activeDocument = document;
}
