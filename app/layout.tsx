import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LACRIMA | Visual Rock Band",
  description: "LACRIMA official website — schedule, news, media and more.",
  openGraph: {
    title: "LACRIMA | Beauty in the Dark",
    description: "LACRIMA official website — schedule, news, media and more.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LACRIMA | Beauty in the Dark",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
