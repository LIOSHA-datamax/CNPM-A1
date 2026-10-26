import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'BrewLite - Cà phê & Thanh toán không tiền mặt',
  description: 'Hệ thống đặt cà phê và thanh toán không tiền mặt - Đồ án Công nghệ Phần mềm',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-semibold text-stone-700">BrewLite Ver 1.0 - Đồ án Công nghệ Phần mềm</p>
            <p className="mt-1">Xây dựng theo quy trình Agile Scrum • NestJS + Next.js + PostgreSQL</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
