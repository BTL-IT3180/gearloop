# GearLoop — lệnh một chạm cho dev (E0-F1-T2).
# Cần: Docker đang chạy, Node 20+. Lần đầu: make dev (tự cài deps + .env).
.PHONY: dev db setup down reset test

dev: db
	@test -f .env || cp .env.example .env
	@test -d node_modules || npm ci
	@if [ -d prisma/migrations ]; then npx prisma migrate deploy; else npx prisma db push; fi
	npm run dev

setup: db
	@test -f .env || cp .env.example .env
	@test -d node_modules || npm ci
	@if [ -d prisma/migrations ]; then npx prisma migrate deploy; else npx prisma db push; fi
	npm run db:seed

db: ## Chỉ bật PostgreSQL (cổng 55432) và đợi healthy
	docker compose up -d --wait db

down: ## Dừng container, giữ dữ liệu
	docker compose down

reset: ## Xoá sạch DB rồi seed lại
	docker compose down -v
	$(MAKE) db
	@if [ -d prisma/migrations ]; then npx prisma migrate deploy; else npx prisma db push; fi
	npm run db:seed

test: db ## Chạy vitest với DB thật đã seed
	@if [ -d prisma/migrations ]; then npx prisma migrate deploy; else npx prisma db push; fi
	npm run db:seed
	npm test
