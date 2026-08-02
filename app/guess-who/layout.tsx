import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GUESS WHO | IEDC BOOTCAMP CEC",
  description:
    "Register for Guess Who, hosted by IEDC Bootcamp CEC. Test your deduction skills, identify mystery personalities, and compete for top honors.",
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

export default function GuessWhoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
