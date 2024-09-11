import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { constructMetadata } from "@/lib/metadata";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";


const inter = Inter({ subsets: ["latin"] });
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable}  min-h-screen pt-12 bg-slate-50 antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <div className="container max-w-7xl mx-auto h-full pt-12">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
