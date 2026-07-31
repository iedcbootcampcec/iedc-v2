import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GAMING ARENA '26 | IEDC BOOTCAMP CEC",
  description:
    "Register for Gaming Arena '26, the ultimate gaming arena of Ideathon! Compete in Mini Militia (Team Game, up to 6 players) and eFootball (Individual). Early bird discount available for the first 20 registrations!",
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

export default function GamingArenaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
