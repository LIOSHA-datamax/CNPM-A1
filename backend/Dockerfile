# ==========================================================
# Dockerfile for NestJS Backend
# ==========================================================
FROM node:20-alpine AS builder

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

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Chỉ cài production dependencies
RUN npm install --omit=dev
RUN npx prisma generate

# Sao chép dist từ builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000

# Script khởi động: Chờ DB, push DB schema rồi start server
CMD ["node", "dist/src/main.js"]
