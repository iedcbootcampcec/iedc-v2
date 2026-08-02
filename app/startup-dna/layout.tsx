import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STARTUP DNA '26 | IEDC BOOTCAMP CEC",
  description:
    "Register for Startup DNA '26, part of IEDC Bootcamp at College of Engineering Chengannur. Decode the entrepreneur in you and learn the fundamentals of building a startup.",
  icons: {
    icon: [
      { url: "/site/favicon.ico" },
      { url: "/site/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/site/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/site/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/site/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/site/android-chrome-512x512.png",
      },
    ],
  },
};

export default function StartupDnaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
