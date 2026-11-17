import { describe, expect, it } from "vitest";
import { filterCategories } from "../src/components/home/categories";

describe("editorial category search", () => {
  it.each(["máy ảnh", "MAY ANH", "  Máy  Ảnh  ", "camera"])(
    "finds camera categories for %s",
    (query) => {
      expect(filterCategories(query).map((item) => item.id)).toEqual([
        "camera",
      ]);
    },
  );
  it("combines the chosen category with keywords", () => {
    expect(filterCategories("máy ảnh", "outdoor")).toEqual([]);
    expect(filterCategories("đèn", "outdoor").map((item) => item.id)).toEqual([
      "outdoor",
    ]);
    expect(
      filterCategories("cắm trại", "outdoor").map((item) => item.id),
    ).toEqual(["outdoor"]);
  });
  it("returns no matches for unknown categories or literal markup", () => {
    expect(filterCategories("", "invalid")).toEqual([]);
    expect(filterCategories("<script>alert(1)</script>")).toEqual([]);
  });
  it("returns all editorial categories when no filter is supplied", () => {
    expect(filterCategories().map((item) => item.id)).toEqual([
      "camera",
      "outdoor",
      "tools",
    ]);
  });
});
