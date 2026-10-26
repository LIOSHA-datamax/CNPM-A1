import Link from 'next/link';
import { Coffee, ArrowRight, ShieldCheck, Zap, Clock, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-coffee-900 via-coffee-800 to-coffee-950 text-white p-8 sm:p-14 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" />
            Sprint 1 & Task 9 • Ready for Testing
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Hello World! <br />
            Chào mừng đến với <span className="text-amber-400">BrewLite</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-coffee-100 font-light leading-relaxed">
            Ứng dụng đặt cà phê và thanh toán không dùng tiền mặt trong vài chạm.
            Giảm tối đa thời gian xếp hàng, nhận đồ uống nhanh chóng tại quầy.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <Link
              href="/orders"
              className="px-6 py-3 rounded-xl bg-amber-400 text-stone-950 font-bold hover:bg-amber-300 transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20 text-sm"
            >
              <Clock className="w-4 h-4" />
              Xem Lịch sử đơn hàng (Task 9)
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="http://localhost:4000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition border border-white/20 text-sm flex items-center gap-2"
            >
              Kiểm tra Swagger API (Backend)
            </a>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 opacity-10 hidden md:block">
          <Coffee className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">Đặt món tức thì</h3>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            Xem menu sinh động, tùy chỉnh kích cỡ S/M/L, lựa chọn thêm topping theo sở thích cá nhân.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">Thanh toán không tiền mặt</h3>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            Tích hợp cổng thanh toán giả lập (Ví MoMo, Thẻ ngân hàng), cơ chế Idempotent chống trừ tiền 2 lần.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-800">Theo dõi trạng thái trực tiếp</h3>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            Dễ dàng tra cứu lịch sử đơn hàng từ PENDING $\rightarrow$ PAID $\rightarrow$ PREPARING $\rightarrow$ READY $\rightarrow$ COMPLETED.
          </p>
        </div>
      </div>

      {/* Quick Task 1 & 9 Status Box */}
      <div className="mt-8 p-6 rounded-2xl bg-amber-50/70 border border-amber-200">
        <h4 className="font-bold text-amber-950 flex items-center gap-2 text-base">
          🎯 Báo cáo nhiệm vụ Thành viên 1:
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-amber-900">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <strong>Task 1:</strong> Khởi tạo monorepo Frontend (Next.js) + Backend (NestJS), chạy được Hello World, có file .env.example, Git, README.md.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <strong>Task 9:</strong> Xây dựng API và Màn hình lịch sử đơn hàng (<code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">GET /orders/me</code>), màn hình xác nhận đơn, đóng gói docker-compose 3 service (Frontend, Backend, PostgreSQL), chuẩn bị tài liệu demo và Burndown Chart.
          </li>
        </ul>
      </div>
    </div>
  );
}
