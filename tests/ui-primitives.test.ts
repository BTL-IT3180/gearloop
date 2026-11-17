import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as UI from "../src/components/ui";

describe("UI primitives", () => {
  it("disables a loading button and exposes busy state", () => {
    const html = renderToStaticMarkup(
      createElement(UI.Button, { isLoading: true, type: "submit" }, "Lưu"),
    );
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('type="submit"');
  });
  it("associates a field label and error without hiding the invalid state", () => {
    const html = renderToStaticMarkup(
      createElement(UI.Input, {
        id: "email",
        label: "Email",
        error: "Email không hợp lệ",
      }),
    );
    expect(html).toContain('for="email"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="email-error"');
    expect(html).toContain('id="email-error"');
  });
  it("associates helper text and preserves disabled select options", () => {
    const html = renderToStaticMarkup(
      createElement(UI.Select, {
        id: "category",
        label: "Danh mục",
        helperText: "Chọn một nhóm",
        options: [
          { label: "Máy ảnh", value: "camera" },
          { label: "Sắp có", value: "soon", disabled: true },
        ],
      }),
    );
    expect(html).toContain('for="category"');
    expect(html).toContain('aria-describedby="category-helper"');
    expect(html).toContain('value="soon" disabled=""');
  });
  it("renders an empty state with an actionable link", () => {
    const html = renderToStaticMarkup(
      createElement(UI.EmptyState, {
        title: "Chưa có kết quả",
        description: "Thử từ khóa khác",
        action: createElement("a", { href: "/" }, "Xem tất cả"),
      }),
    );
    expect(html).toContain("Chưa có kết quả");
    expect(html).toContain('href="/"');
  });
  it("keeps all seven primitives and loading helpers available", () => {
    for (const component of [
      UI.Button,
      UI.Input,
      UI.Select,
      UI.Table,
      UI.Card,
      UI.ToastProvider,
      UI.EmptyState,
      UI.CardSkeleton,
      UI.TableSkeleton,
    ])
      expect(component).toBeDefined();
    expect(UI.tokens.colors.status.success).toBeDefined();
    expect(UI.tokens.typography.fontSans).toContain("--font-vietnamese");
  });
});
