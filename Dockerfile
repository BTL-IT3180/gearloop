FROM node:20-alpine

WORKDIR /app

# Cài dependency trước để tận dụng layer cache
COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

EXPOSE 3000

# Giống MedBook: lần chạy đầu tự tạo schema và nạp dữ liệu mẫu. Có prisma/migrations
# → migrate deploy; chưa có (trước GL-104) → db push để container vẫn lên được.
# Seed bỏ qua và exit 0 nếu có booking/ledger/audit; dữ liệu nghiệp vụ được giữ lại.
# Nếu chỉ có dữ liệu mẫu, wipe + seed chạy trong một transaction.
CMD ["sh", "-c", "if [ -d prisma/migrations ]; then npx prisma migrate deploy; else npx prisma db push --skip-generate; fi && npm run db:seed && npm run start"]
