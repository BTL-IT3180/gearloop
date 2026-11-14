/**
 * db:reset — xoá sạch dữ liệu, chạy lại toàn bộ migration và seed lại.
 * Guard local-only: từ chối (exit 1, không đụng database) nếu NODE_ENV=production
 * hoặc DATABASE_URL không trỏ tới localhost/127.0.0.1/::1.
 * Cấu hình lấy từ biến môi trường đã export, sau đó tới `.env` ở repo root; `.env`
 * được đọc bằng parser chuẩn của Node (`process.loadEnvFile`, cần Node ≥ 20.12) nên
 * hiểu đúng nháy, khoảng trắng và comment cuối dòng. Biến đã export luôn thắng `.env`.
 * `.env` khai báo trùng DATABASE_URL/NODE_ENV thì từ chối — không rõ giá trị nào đang dùng.
 * Prisma reset chạy với `--skip-seed` vì script tự chạy seed đúng một lần phía sau
 * (tránh seed hai lần do cấu hình `prisma.seed` trong package.json).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const ENV_FILE = ".env";
/** Biến mà guard phụ thuộc — trong `.env` chỉ được khai báo một lần. */
const GUARD_KEYS = ["DATABASE_URL", "NODE_ENV"] as const;

/** Số dòng khai báo `key` trong nội dung `.env` (bỏ qua dòng trống và dòng comment). */
function declarationLines(content: string, key: string): number[] {
  const declaration = new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=`);
  return content
    .split(/\r?\n/)
    .flatMap((line, index) => (declaration.test(line) ? [index + 1] : []));
}

/**
 * Nạp `.env` (nếu có) bằng parser chuẩn của Node. Từ chối khi `.env` khai báo trùng
 * biến guard: parser lấy dòng cuối cùng, nên giá trị đang dùng có thể khác ý người viết.
 */
function loadRepoEnv(): void {
  if (!existsSync(ENV_FILE)) {
    return;
  }
  const loadEnvFile: ((path?: string) => void) | undefined = process.loadEnvFile;
  if (loadEnvFile === undefined) {
    reject(
      `cần Node.js ≥ 20.12 để đọc ${ENV_FILE} (process.loadEnvFile) — hoặc export DATABASE_URL rồi chạy lại`,
    );
  }
  const content = readFileSync(ENV_FILE, "utf8");
  for (const key of GUARD_KEYS) {
    const lines = declarationLines(content, key);
    if (lines.length > 1) {
      reject(
        `${ENV_FILE} khai báo ${key} ${lines.length} lần (dòng ${lines.join(", ")}) — giữ đúng một dòng rồi chạy lại`,
      );
    }
  }
  const exported = { ...process.env };
  loadEnvFile(ENV_FILE);
  // Khôi phục tường minh biến đã export để quy tắc "export thắng .env" không phụ thuộc bản Node.
  for (const [key, value] of Object.entries(exported)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

/** In lý do từ chối bằng tiếng Việt rồi thoát 1 — chưa đụng tới database. */
function reject(reason: string): never {
  console.error(`db:reset bị từ chối: ${reason}`);
  process.exit(1);
}

loadRepoEnv();

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  reject("không tìm thấy DATABASE_URL trong biến môi trường hoặc file .env");
}
// NODE_ENV đọc từ cấu hình đã nạp: production trong shell hoặc `.env` đều chặn reset.
if (process.env.NODE_ENV?.trim().toLowerCase() === "production") {
  reject("NODE_ENV=production — db:reset chỉ dùng cho database local");
}

let url: URL | null = null;
try {
  url = new URL(databaseUrl);
} catch {
  url = null;
}
if (url === null) {
  reject("DATABASE_URL không parse được như một URL kết nối");
}
if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
  reject(`DATABASE_URL có protocol "${url.protocol}" — chỉ hỗ trợ postgres: hoặc postgresql:`);
}
const host = (
  url.hostname.startsWith("[") ? url.hostname.slice(1, -1) : url.hostname
).toLowerCase();
if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") {
  reject(`host "${host}" không phải database local (chỉ cho phép localhost, 127.0.0.1, ::1)`);
}

console.log(`db:reset — database đích: ${url.host}/${url.pathname.slice(1)}`);

// Cấu hình đã kiểm tra (DATABASE_URL + NODE_ENV + các biến còn lại của `.env`) cho cả hai tiến trình.
const childEnv = { ...process.env, DATABASE_URL: databaseUrl };

const reset = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "reset", "--force", "--skip-seed"],
  { stdio: "inherit", env: childEnv },
);
if (reset.status !== 0) {
  process.exit(reset.status ?? 1);
}

const seed = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "src/db/seed.ts"], {
  stdio: "inherit",
  env: childEnv,
});
process.exit(seed.status ?? 1);
