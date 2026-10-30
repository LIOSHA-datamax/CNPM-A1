import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrewLite - Cà phê & Thanh toán không tiền mặt',
  description: 'Hệ thống đặt cà phê và thanh toán không tiền mặt - Đồ án Công nghệ Phần mềm',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-[#FAF9F6] text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
