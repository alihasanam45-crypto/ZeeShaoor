import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Yahan hum premium font load kar rahe hain
const montserrat = Montserrat({ subsets: ["latin"] });

// Yahan aap ki website ka Global Title aur Description set ho raha hai (SEO ke liye)
export const metadata: Metadata = {
  title: "ZeeShaoor.Pk",
  description: "Pakistan's No. 1 Educational Software and Paper Generator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Font ke sath dark background aur white text force kiya gaya hai */}
      <body 
        className={`${montserrat.className} bg-[#050810] text-white`} 
        style={{ backgroundColor: "#050810", color: "white" }}
      >
        {children}
      </body>
    </html>
  );
}