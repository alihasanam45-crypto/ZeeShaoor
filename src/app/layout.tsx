import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZeeShaoor.pk",
  description: "Pakistan's No. 1 Educational Software and Paper Generator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} bg-[#F8FAFC] font-sans text-slate-900 antialiased`}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
