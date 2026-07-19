import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IDEATHON SUBMISSION | IEDC BOOTCAMP CEC",
  description:
    "Submit your ideas, pitch decks, and prototypes for IDEATHON ‘26. Show your innovation and build the future.",
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

export default function IdeathonSubmissionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
