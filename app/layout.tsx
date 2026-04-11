import type { Metadata } from "next";
import { Inter, Anton, Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IEDC Bootcamp CEC",
  description:
    "A startup-driven innovation forum at CEC. We experiment, validate, ship, repeat.",
  icons: {
    icon: [
      { url: "/site/favicon.ico" },
      { url: "/site/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/site/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/site/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/site/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/site/android-chrome-512x512.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} ${playfair.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
