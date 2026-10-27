import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrewLite - Cà phê & Đặt món không tiền mặt',
  description: 'Ứng dụng đặt cà phê và thanh toán không dùng tiền mặt BrewLite',
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
