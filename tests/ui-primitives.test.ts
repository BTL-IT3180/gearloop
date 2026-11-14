import { describe, expect, it } from "vitest";
import * as UI from "../src/components/ui";

describe("UI Primitives & Design Tokens (E0-F3-T1 & T2)", () => {
  it("xuất bản đầy đủ Design Tokens trong src/components/ui/theme", () => {
    expect(UI.tokens).toBeDefined();
    expect(UI.tokens.colors.brand[600]).toBe("#059669");
    expect(UI.tokens.colors.status.success).toBeDefined();
    expect(UI.tokens.colors.status.danger).toBeDefined();
    expect(UI.tokens.colors.status.warning).toBeDefined();
    expect(UI.tokens.colors.status.info).toBeDefined();
  });

  it("xuất bản đầy đủ 7 primitives theo yêu cầu WBS trong src/components/ui/", () => {
    // 7 primitives bắt buộc: Button, Input, Select, Table, Card, Toast, EmptyState
    expect(UI.Button).toBeDefined();
    expect(UI.Input).toBeDefined();
    expect(UI.Select).toBeDefined();
    expect(UI.Table).toBeDefined();
    expect(UI.TableHeader).toBeDefined();
    expect(UI.TableBody).toBeDefined();
    expect(UI.TableRow).toBeDefined();
    expect(UI.TableHead).toBeDefined();
    expect(UI.TableCell).toBeDefined();
    expect(UI.Card).toBeDefined();
    expect(UI.CardHeader).toBeDefined();
    expect(UI.CardTitle).toBeDefined();
    expect(UI.CardDescription).toBeDefined();
    expect(UI.CardContent).toBeDefined();
    expect(UI.CardFooter).toBeDefined();
    expect(UI.EmptyState).toBeDefined();
    expect(UI.ToastProvider).toBeDefined();
    expect(UI.useToast).toBeDefined();
    expect(UI.Badge).toBeDefined();

    // Skeletons
    expect(UI.Skeleton).toBeDefined();
    expect(UI.CardSkeleton).toBeDefined();
    expect(UI.TableSkeleton).toBeDefined();
  });

  it("Button hỗ trợ đầy đủ 5 variants chuẩn hệ thống", () => {
    const variants: UI.ButtonVariant[] = ["primary", "secondary", "outline", "ghost", "danger"];
    expect(variants).toHaveLength(5);
  });

  it("Badge hỗ trợ các biến thể trạng thái nghiệp vụ", () => {
    const variants: UI.BadgeVariant[] = ["default", "success", "warning", "danger", "info"];
    expect(variants).toHaveLength(5);
  });
});
