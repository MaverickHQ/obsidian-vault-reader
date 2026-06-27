// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { applyPanelZoomInputBounds } from "../../src/reader/view/panel-zoom-controller";

describe("panel zoom controller", () => {
  it("keeps slider and number input bounds/value synchronized", () => {
    const numberInput = document.createElement("input");
    const sliderInput = document.createElement("input");

    applyPanelZoomInputBounds([numberInput, sliderInput], {
      min: 80,
      max: 125,
      value: 115,
    });

    for (const input of [numberInput, sliderInput]) {
      expect(input.min).toBe("80");
      expect(input.max).toBe("125");
      expect(input.step).toBe("5");
      expect(input.value).toBe("115");
    }
  });
});
