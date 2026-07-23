import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";
import ThemeProvider from "@/components/providers/ThemeProvider";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} bg-[#F8FAFC] font-sans text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50`}>
        <ThemeProvider>
          <SessionWrapper>{children}</SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
