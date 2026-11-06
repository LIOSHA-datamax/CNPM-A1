const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

function sleep(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  }
}

function run(cmd, cwd = rootDir) {
  console.log(`[BOOTSTRAP] Executing: ${cmd}`);
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32' ? true : undefined,
  });
}

console.log('====================================================');
console.log('BrewLite: Đang tự động kiểm tra và chuẩn bị môi trường...');
console.log('====================================================');

// 1. Tự động tạo file .env nếu người dùng chưa có
const backendEnv = path.join(backendDir, '.env');
const backendEnvExample = path.join(rootDir, '.env.example');
if (!fs.existsSync(backendEnv)) {
  console.log('[BOOTSTRAP] Tạo backend/.env từ .env.example...');
  if (fs.existsSync(backendEnvExample)) {
    fs.copyFileSync(backendEnvExample, backendEnv);
  } else {
    fs.writeFileSync(
      backendEnv,
      'DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/brewlite?schema=public"\nPORT=4000\nJWT_SECRET=brewlite_jwt_secret_dev_2026\n',
    );
  }
}

const frontendEnv = path.join(frontendDir, '.env.local');
if (!fs.existsSync(frontendEnv)) {
  console.log('[BOOTSTRAP] Tạo frontend/.env.local...');
  fs.writeFileSync(frontendEnv, 'NEXT_PUBLIC_API_URL=http://localhost:4000\n');
}

// 2. Tự động cài đặt dependencies nếu người dùng mới clone về chưa có node_modules
if (!fs.existsSync(path.join(rootDir, 'node_modules'))) {
  console.log('[BOOTSTRAP] Đang cài đặt thư viện tại thư mục gốc...');
  run('npm install', rootDir);
}

if (!fs.existsSync(path.join(backendDir, 'node_modules'))) {
  console.log('[BOOTSTRAP] Đang cài đặt thư viện Backend (NestJS)...');
  run('npm install', backendDir);
}

if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
  console.log('[BOOTSTRAP] Đang cài đặt thư viện Frontend (Next.js)...');
  run('npm install', frontendDir);
}

// 3. Tự động bật Docker PostgreSQL (hỗ trợ cả "docker compose" và "docker-compose")
try {
  // Giải phóng cổng 3000 và 4000 nếu trước đó có container docker compose up toàn bộ
  try {
    execSync('docker stop brewlite_frontend brewlite_backend', {
      stdio: 'ignore',
      shell: process.platform === 'win32' ? true : undefined,
    });
  } catch {}

  console.log('[BOOTSTRAP] Khởi động PostgreSQL trong Docker...');
  try {
    run('docker compose up -d postgres', rootDir);
  } catch {
    run('docker-compose up -d postgres', rootDir);
  }
} catch (err) {
  console.warn('[BOOTSTRAP] Lưu ý: Không bật được Docker (bỏ qua nếu bạn dùng PostgreSQL cài trực tiếp trên máy).');
}

// 4. Đồng bộ Schema Prisma và nạp dữ liệu mẫu nếu cần
try {
  let dbReady = false;
  for (let i = 0; i < 8; i++) {
    try {
      execSync('npx prisma db push --skip-generate', {
        cwd: backendDir,
        stdio: 'ignore',
        shell: process.platform === 'win32' ? true : undefined,
      });
      dbReady = true;
      break;
    } catch {
      sleep(1200);
    }
  }

  if (dbReady) {
    run('npx prisma generate', backendDir);
    run('npx prisma db push', backendDir);
    try {
      run('npx prisma db seed', backendDir);
    } catch {
      // Dữ liệu đã có sẵn thì không sao
    }
  }
} catch (err) {
  console.warn('[BOOTSTRAP] Hoàn tất bước kiểm tra CSDL.');
}

console.log('====================================================');
console.log('Môi trường đã sẵn sàng! Đang khởi chạy Backend & Frontend...');
console.log('====================================================\n');

