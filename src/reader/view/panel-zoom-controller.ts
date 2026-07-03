import { setValueIfChanged } from "../dom-writes";
import type { PanelZoomBounds } from "../reader-view-model";
import { PANEL_ZOOM_STEP } from "./reader-view-shell";

export function applyPanelZoomInputBounds(
  inputs: HTMLInputElement[],
  bounds: PanelZoomBounds,
): void {
  const min = String(bounds.min);
  const max = String(bounds.max);
  const step = String(PANEL_ZOOM_STEP);
  const value = String(bounds.value);

  for (const input of inputs) {
    if (input.min !== min) {
      input.min = min;
    }
    if (input.max !== max) {
      input.max = max;
    }
    if (input.step !== step) {
      input.step = step;
    }
    setValueIfChanged(input, value);
  }
}
