import { expect, test, describe } from "vitest";
import { toggleInfinite, adjustInfiniteValue } from "./infiniteToggle";

describe("infiniteToggle", () => {
  describe("toggleInfinite", () => {
    test("should toggle from finite to 'unlimited'", () => {
      expect(toggleInfinite(5, 5)).toBe("unlimited");
    });

    test("should toggle from 'unlimited' to last finite value", () => {
      expect(toggleInfinite("unlimited", 10)).toBe(10);
    });

    test("should respect minValue when toggling off 'unlimited'", () => {
      expect(toggleInfinite("unlimited", 5, 10)).toBe(10);
    });
  });

  describe("adjustInfiniteValue", () => {
    test("should return null when adjusting 'unlimited'", () => {
      expect(adjustInfiniteValue("unlimited", 1)).toBeNull();
    });

    test("should adjust finite value by delta", () => {
      expect(adjustInfiniteValue(10, 5)).toBe(15);
      expect(adjustInfiniteValue(10, -3)).toBe(7);
    });

    test("should respect minValue and maxValue", () => {
      expect(adjustInfiniteValue(5, -10, 0)).toBe(0);
      expect(adjustInfiniteValue(5, 10, 0, 10)).toBe(10);
    });
  });
});
