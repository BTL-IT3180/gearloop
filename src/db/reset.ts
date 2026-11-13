/**
 * db:reset — xoá sạch dữ liệu, chạy lại toàn bộ migration và seed lại.
 * Guard local-only: từ chối (exit 1, không đụng database) nếu NODE_ENV=production
 * hoặc DATABASE_URL không trỏ tới localhost/127.0.0.1/::1.
 * Prisma reset chạy với `--skip-seed` vì script tự chạy seed đúng một lần phía sau
 * (tránh seed hai lần do cấu hình `prisma.seed` trong package.json).
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

/** Đọc DATABASE_URL từ .env ở repo root: bỏ qua dòng trống/comment, cắt nháy bao quanh. */
function readEnvFileDatabaseUrl(): string | null {
  let content: string;
  try {
    content = readFileSync(".env", "utf8");
  } catch {
    return null;
  }
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#") || !trimmed.startsWith("DATABASE_URL=")) {
      continue;
    }
    let value = trimmed.slice("DATABASE_URL=".length).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1);
    }
    if (value !== "") {
      return value;
    }
  }
  return null;
}

/** In lý do từ chối bằng tiếng Việt rồi thoát 1 — chưa đụng tới database. */
function reject(reason: string): never {
  console.error(`db:reset bị từ chối: ${reason}`);
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL?.trim() || readEnvFileDatabaseUrl();
if (databaseUrl === null) {
  reject("không tìm thấy DATABASE_URL trong biến môi trường hoặc file .env");
}
if (process.env.NODE_ENV === "production") {
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

const env = { ...process.env, DATABASE_URL: databaseUrl };

const reset = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "reset", "--force", "--skip-seed"],
  { stdio: "inherit", env },
);
if (reset.status !== 0) {
  process.exit(reset.status ?? 1);
}

const seed = spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "src/db/seed.ts"], {
  stdio: "inherit",
  env,
});
process.exit(seed.status ?? 1);
