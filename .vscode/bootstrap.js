const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// Helper kiểm tra cổng mạng mở bằng Node.js net socket
function checkPortOpen(port, host = '127.0.0.1', timeoutMs = 1200) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

function sleep(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  }
}

// Chạy lệnh silent để loại bỏ các cảnh báo thừa
function runQuiet(cmd, cwd = rootDir) {
  try {
    execSync(cmd, {
      cwd,
      stdio: ['ignore', 'ignore', 'ignore'],
      shell: process.platform === 'win32' ? true : undefined,
    });
    return true;
  } catch {
    return false;
  }
}

// Kiểm tra Docker daemon có đang chạy không
function isDockerRunning() {
  try {
    execSync('docker info', {
      stdio: ['ignore', 'ignore', 'ignore'],
      shell: process.platform === 'win32' ? true : undefined,
    });
    return true;
  } catch {
    return false;
  }
}

// Tự động kích hoạt Docker Desktop nếu người dùng chưa bật
function tryStartDockerDesktop() {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWin) {
    const candidates = [
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'DockerDesktop', 'Docker Desktop.exe'),
      'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
      'C:\\Program Files (x86)\\Docker\\Docker\\Docker Desktop.exe',
    ];

    for (const exePath of candidates) {
      if (fs.existsSync(exePath)) {
        try {
          const child = spawn(exePath, [], { detached: true, stdio: 'ignore' });
          child.unref();
          return true;
        } catch {}
      }
    }
  } else if (isMac) {
    if (fs.existsSync('/Applications/Docker.app')) {
      try {
        const child = spawn('open', ['-a', 'Docker'], { detached: true, stdio: 'ignore' });
        child.unref();
        return true;
      } catch {}
    }
  }
  return false;
}

async function bootstrap() {
  console.log('\n======================================================');
  console.log('  BrewLite Monorepo | Khoi tao moi truong phat trien  ');
  console.log('======================================================\n');

  // 1. Cấu hình file môi trường
  process.stdout.write('[1/4] Cau hinh moi truong (.env, .env.local) ...... ');
  const backendEnv = path.join(backendDir, '.env');
  const backendEnvExample = path.join(rootDir, '.env.example');
  if (!fs.existsSync(backendEnv)) {
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
    fs.writeFileSync(frontendEnv, 'NEXT_PUBLIC_API_URL=http://localhost:4000\n');
  }
  console.log('[OK]');

  // 2. Cài đặt dependencies nếu chưa có
  process.stdout.write('[2/4] Kiem tra dependencies (Root, Backend, Web) .. ');
  const needRoot = !fs.existsSync(path.join(rootDir, 'node_modules'));
  const needBackend = !fs.existsSync(path.join(backendDir, 'node_modules'));
  const needFrontend = !fs.existsSync(path.join(frontendDir, 'node_modules'));

  if (needRoot || needBackend || needFrontend) {
    console.log('[INSTALLING]');
    if (needRoot) runQuiet('npm install --no-audit --no-fund --loglevel=error', rootDir);
    if (needBackend) runQuiet('npm install --no-audit --no-fund --loglevel=error', backendDir);
    if (needFrontend) runQuiet('npm install --no-audit --no-fund --loglevel=error', frontendDir);
    console.log('      > Hoan tat cai dat packages ................. [OK]');
  } else {
    console.log('[OK]');
  }

  // 3. Khởi động PostgreSQL
  process.stdout.write('[3/4] Khoi dong co so du lieu PostgreSQL ......... ');

  let isPort5432Up = await checkPortOpen(5432);

  if (!isPort5432Up) {
    let dockerOk = isDockerRunning();

    if (!dockerOk) {
      console.log('[STARTING DOCKER]');
      const launched = tryStartDockerDesktop();
      if (launched) {
        for (let i = 0; i < 15; i++) {
          sleep(2000);
          if (isDockerRunning()) {
            dockerOk = true;
            break;
          }
        }
      }
    }

    if (dockerOk) {
      runQuiet('docker stop brewlite_frontend brewlite_backend');
      const started = runQuiet('docker compose up -d postgres') || runQuiet('docker-compose up -d postgres');
      if (started) {
        for (let i = 0; i < 10; i++) {
          sleep(1000);
          if (await checkPortOpen(5432)) {
            isPort5432Up = true;
            break;
          }
        }
      }
    }

    if (isPort5432Up) {
      console.log('      > PostgreSQL container (Port 5432) .......... [OK]');
    } else {
      console.log('[WARN]');
      console.log('      > Chua the ket noi Docker hoac PostgreSQL tai cong 5432.');
      console.log('      > Luu y: Hay mo Docker Desktop tren may de tu dong khoi tao DB.');
    }
  } else {
    console.log('[OK]');
  }

  // 4. Đồng bộ Schema Prisma & nạp dữ liệu mẫu
  process.stdout.write('[4/4] Dong bo Prisma Schema & Seed data ........... ');
  if (isPort5432Up) {
    try {
      runQuiet('npx prisma generate', backendDir);
      runQuiet('npx prisma db push --skip-generate', backendDir);
      runQuiet('npx prisma db seed', backendDir);
      console.log('[OK]');
    } catch {
      console.log('[SKIPPED]');
    }
  } else {
    console.log('[PENDING]');
  }

  console.log('\n------------------------------------------------------');
  console.log('He thong da san sang:');
  console.log('  > Frontend : http://localhost:3000');
  console.log('  > Backend  : http://localhost:4000');
  console.log('  > Swagger  : http://localhost:4000/api/docs');
  console.log('------------------------------------------------------\n');
}

bootstrap().catch((err) => {
  console.error('\n[BOOTSTRAP ERROR]', err.message);
  process.exit(1);
});
