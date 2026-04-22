import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interactive Horizontal Slider",
  description: "Unity WebGL build embedded in a Next.js iframe"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
