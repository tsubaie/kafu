import type { Metadata } from "next";
import { Baloo_Bhaijaan_2 } from "next/font/google";
import "./globals.css";

const balooBhaijaan = Baloo_Bhaijaan_2({
  variable: "--font-baloo-bhaijaan",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "كفوو — تقدير الموظفين",
  description: "نظام تقدير الموظفين - أداء",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${balooBhaijaan.variable} h-full antialiased`}
    >
      <body className="h-full bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
