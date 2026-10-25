"""Deterministic verification script for BrewLite NestJS Backend (Task 2, 7, 8)."""
import os
import subprocess
import sys
import time

REQUIRED_FILES = [
    "src/main.ts",
    "src/app.module.ts",
    "src/prisma/prisma.module.ts",
    "src/prisma/prisma.service.ts",
    "src/products/products.module.ts",
    "src/products/products.controller.ts",
    "src/products/products.service.ts",
    "src/auth/auth.module.ts",
    "src/auth/auth.controller.ts",
    "src/auth/auth.service.ts",
    "src/auth/guards/jwt-auth.guard.ts",
    "src/auth/strategies/jwt.strategy.ts",
    "src/payments/payments.module.ts",
    "src/payments/payments.controller.ts",
    "src/payments/payments.service.ts",
]


def main() -> int:
    backend_dir = sys.argv[1] if len(sys.argv) > 1 else "CNPM-A1/backend"
    backend_dir = os.path.abspath(backend_dir)
    print(f"[verify_backend] Inspecting: {backend_dir}")

    missing = [
        rel for rel in REQUIRED_FILES if not os.path.isfile(os.path.join(backend_dir, rel))
    ]
    if missing:
        print(f"[FAIL] Missing required files: {missing}")
        return 1
    print(f"[PASS] All {len(REQUIRED_FILES)} required source files exist.")

    t0 = time.time()
    build_res = subprocess.run(
        ["npm", "run", "build"],
        cwd=backend_dir,
        shell=True,
        capture_output=True,
        text=True,
    )
    if build_res.returncode != 0:
        print("[FAIL] npm run build failed:")
        print(build_res.stdout)
        print(build_res.stderr)
        return 1
    print(f"[PASS] npm run build succeeded in {time.time() - t0:.2f}s.")

    t1 = time.time()
    test_res = subprocess.run(
        ["npm", "test", "--", "--runInBand"],
        cwd=backend_dir,
        shell=True,
        capture_output=True,
        text=True,
    )
    if test_res.returncode != 0:
        print("[FAIL] npm test failed:")
        print(test_res.stdout)
        print(test_res.stderr)
        return 1
    print(f"[PASS] npm test succeeded in {time.time() - t1:.2f}s.")
    print(test_res.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
