
# GearLoop — Môi trường phát triển local (E0-F1-T2)
# Yêu cầu: Docker Desktop, Node.js 22+, npm, Make (Git Bash).
#
# Lần đầu:       make setup (khởi tạo DB và dữ liệu mẫu)
# Hằng ngày:     make dev   (chạy ứng dụng, không xóa dữ liệu)
# Kiểm thử:      make test  (sử dụng database gearloop_test riêng)
#
# CẢNH BÁO: make setup sẽ seed lại và xóa dữ liệu ứng dụng hiện có.
# Chỉ sử dụng với database local có thể khởi tạo lại.

.PHONY: dev db setup down reset test

# Khởi động Next.js mà không tự động seed lại database
dev: db
	@test -f .env || cp .env.example .env
	@test -d node_modules || npm ci
	@if [ -d prisma/migrations ]; then \
		npx prisma migrate deploy; \
	else \
		npx prisma db push; \
	fi
	npm run dev

# Khởi động PostgreSQL và chờ container ở trạng thái healthy
db:
	docker compose up -d --wait db

# Khởi tạo database và nạp dữ liệu mẫu cho lần chạy đầu tiên
# CẢNH BÁO: Seed sẽ xóa dữ liệu ứng dụng hiện có
setup: db
	@test -f .env || cp .env.example .env
	@test -d node_modules || npm ci
	@if [ -d prisma/migrations ]; then \
		npx prisma migrate deploy; \
	else \
		npx prisma db push; \
	fi
	npm run db:seed

# Dừng các container nhưng giữ nguyên dữ liệu trong Docker volume
down:
	docker compose down

# Đặt lại toàn bộ database local về trạng thái dữ liệu mẫu
# CẢNH BÁO: Xóa Docker volume chứa dữ liệu PostgreSQL
reset:
	docker compose down -v
	$(MAKE) setup

# Chạy kiểm thử với database gearloop_test riêng biệt
# CẢNH BÁO: Dữ liệu trong database kiểm thử có thể bị xóa khi seed
test: db
	@test -f .env.test || (echo "LỖI: Chưa có file .env.test"; exit 1)
	@set -e; \
	set -a; \
	. ./.env.test; \
	set +a; \
	case "$$DATABASE_URL" in \
		*/gearloop_test|*/gearloop_test\?*) ;; \
		*) echo "LỖI: DATABASE_URL phải trỏ đến gearloop_test"; exit 1 ;; \
	esac; \
	if ! docker compose exec -T db psql -U gearloop -d postgres -tAc \
		"SELECT 1 FROM pg_database WHERE datname='gearloop_test'" | grep -q 1; then \
		docker compose exec -T db psql -U gearloop -d postgres \
			-c "CREATE DATABASE gearloop_test;"; \
	fi; \
	if [ -d prisma/migrations ]; then \
		npx prisma migrate deploy; \
	else \
		npx prisma db push; \
	fi; \
	npm run db:seed; \
	npm test
