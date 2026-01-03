import { expect, test, describe } from "bun:test";
import { toggleInfinite, adjustInfiniteValue } from "./infiniteToggle";

describe("infiniteToggle", () => {
  describe("toggleInfinite", () => {
    test("should toggle from finite to 'Infinite'", () => {
      expect(toggleInfinite(5, 5)).toBe("Infinite");
    });

    test("should toggle from 'Infinite' to last finite value", () => {
      expect(toggleInfinite("Infinite", 10)).toBe(10);
    });

    test("should respect minValue when toggling off 'Infinite'", () => {
      expect(toggleInfinite("Infinite", 5, 10)).toBe(10);
    });
  });

  describe("adjustInfiniteValue", () => {
    test("should return null when adjusting 'Infinite'", () => {
      expect(adjustInfiniteValue("Infinite", 1)).toBeNull();
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
