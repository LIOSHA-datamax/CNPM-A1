# ==========================================================
# Dockerfile for NestJS Backend
# ==========================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Sao chép file cấu hình dependency
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

# Cài đặt dependency & sinh Prisma Client
RUN npm install
RUN npx prisma generate

# Sao chép toàn bộ mã nguồn backend
COPY src ./src

# Build NestJS sang Javascript (thư mục dist)
RUN npm run build

# --- Runner Stage (Image nhẹ để chạy ứng dụng) ---
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 4000

# Khởi động: Tự động đồng bộ DB schema, nạp dữ liệu mẫu (seed) rồi chạy NestJS
CMD ["sh", "-c", "npx prisma db push && (node dist/prisma/seed.js || npx ts-node prisma/seed.ts || true) && (node dist/src/main.js || node dist/main.js)"]
