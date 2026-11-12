import { describe, expect, it } from "vitest";
import { errorCatalog, errorMessage, type ActiveErrorCode } from "../src/lib/error-catalog";
import { loginSchema } from "../src/lib/validation/auth";
import { dateRangeSchema } from "../src/lib/validation/date-range";
import { AppError } from "../src/server/errors";
import { withApi } from "../src/server/api/withApi";
import { requireRole } from "../src/server/middleware/requireRole";
import { parseInput, parseJsonInput } from "../src/server/utils/validation";

const context = () => ({ params: Promise.resolve({}) });
const request = (body: string) => new Request("http://localhost/api/auth/login", {
  method: "POST", headers: { "Content-Type": "application/json" }, body,
});

describe("catalog B4", () => {
  it("giữ 24 mã USR và 3 mã SYS; mã pending không thể phát ở runtime", () => {
    expect(Object.keys(errorCatalog)).toHaveLength(27);
    for (const [code, entry] of Object.entries(errorCatalog)) {
      expect(code).toMatch(/^ERR-(USR|SYS)-\d{3}$/);
      if ("pending" in entry) {
        // Mô phỏng JavaScript caller vượt kiểm tra TypeScript.
        expect(() => new AppError(code as ActiveErrorCode)).toThrow("pending review");
      }
    }
  });

  it("định dạng danh sách trường bằng nhãn, không nhận giá trị người dùng", () => {
    expect(new AppError("ERR-USR-005", ["Tiêu đề", "Ảnh"]).message)
      .toBe("Vui lòng điền đầy đủ các trường bắt buộc: Tiêu đề, Ảnh.");
    expect(() => new AppError("ERR-USR-005")).toThrow("requires field labels");
  });
});

describe("schema dùng chung", () => {
  it("chuẩn hóa email, giữ nguyên password và dữ liệu nhập gốc", () => {
    const input = { email: " an@example.test ", password: " secret ", role: "ADMIN" };
    expect(parseInput(loginSchema, input, "ERR-USR-010"))
      .toEqual({ email: "an@example.test", password: " secret " });
    expect(input.email).toBe(" an@example.test ");
    expect(input.role).toBe("ADMIN");
  });

  it.each([null, {}, { email: "bad", password: "p" },
    { email: "a@example.test", password: "" }, { email: 1, password: false }])(
    "từ chối login input sai và dùng thông điệp catalog: %j", (input) => {
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.every((issue) => issue.message === errorMessage("ERR-USR-010"))).toBe(true);
      }
      expect(() => parseInput(loginSchema, input, "ERR-USR-010"))
        .toThrow(errorMessage("ERR-USR-010"));
    },
  );

  it.each([
    ["2030-01-01", "2030-01-01", true],
    ["2028-02-29", "2028-03-01", true],
    ["2030-01-02", "2030-01-01", false],
    ["2030-02-29", "2030-03-01", false],
    ["2030-04-31", "2030-05-01", false],
    ["2030-1-1", "2030-01-02", false],
    ["2030-01-01T00:00:00Z", "2030-01-02", false],
  ])("khoảng ngày %s → %s: %s", (startDate, endDate, valid) => {
    expect(dateRangeSchema.safeParse({ startDate, endDate }).success).toBe(valid);
  });
});

describe("response API", () => {
  it("giữ nguyên envelope thành công, chuyển params tới handler", async () => {
    const route = withApi(async (_req, ctx) => ({ id: (await ctx.params).id }));
    const response = await route(request("{}"), { params: Promise.resolve({ id: "12" }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(await response.json()).toEqual({ data: { id: "12" } });
  });

  it.each([
    ["ERR-USR-001", 409], ["ERR-USR-004", 404], ["ERR-USR-008", 403],
    ["ERR-USR-010", 401], ["ERR-USR-011", 403], ["ERR-SYS-002", 409],
  ] as const)("trả %s với HTTP %s", async (code, status) => {
    const route = withApi(async () => { throw new AppError(code); });
    const response = await route(request("{}"), context());
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: errorMessage(code), code });
  });

  it.each(["{", "null", '{"email":"bad","password":"p"}'])(
    "từ chối JSON/input login sai trước khi thực hiện thao tác ghi: %s", async (body) => {
      let writes = 0;
      const route = withApi(async (req) => {
        await parseJsonInput(req, loginSchema, "ERR-USR-010");
        writes++;
        return { saved: true };
      });
      const response = await route(request(body), context());
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: errorMessage("ERR-USR-010"), code: "ERR-USR-010" });
      expect(writes).toBe(0);
    },
  );

  it("validation ngày trả 400 theo ngữ cảnh, không rơi vào 500", async () => {
    const route = withApi(async (req) => parseJsonInput(req, dateRangeSchema, "ERR-USR-003"));
    const response = await route(request('{"startDate":"2030-02-30","endDate":"2030-03-01"}'), context());
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: errorMessage("ERR-USR-003"), code: "ERR-USR-003" });
  });

  it("lỗi chưa phân loại trả SYS-001, không trả thông điệp nội bộ", async () => {
    const route = withApi(async () => { throw new Error("internal diagnostic"); });
    const response = await route(request("{}"), context());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: errorMessage("ERR-SYS-001"), code: "ERR-SYS-001" });
  });

  it("lỗi Zod trong xử lý nội bộ vẫn là lỗi hệ thống", async () => {
    const route = withApi(async () => loginSchema.parse(null));
    const response = await route(request("{}"), context());
    expect(response.status).toBe(500);
    expect((await response.json()).code).toBe("ERR-SYS-001");
  });
});

describe("guard hiện có dùng catalog", () => {
  it("cho phép role phù hợp", () => {
    expect(() => requireRole("OWNER", "ADMIN", "OWNER")).not.toThrow();
  });

  it.each([[undefined, "ERR-SYS-003", 401], ["RENTER", "ERR-USR-008", 403]] as const)(
    "từ chối role %s", async (role, code, status) => {
      const route = withApi(async () => { requireRole(role, "ADMIN"); return null; });
      const response = await route(request("{}"), context());
      expect(response.status).toBe(status);
      expect(await response.json()).toEqual({ error: errorMessage(code), code });
    },
  );
});
