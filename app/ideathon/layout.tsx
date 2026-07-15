import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IDEATHON ‘26 | IEDC Bootcamp CEC",
  description:
    "IDEATHON ‘26, the Ultimate Arena for Kerala’s Innovators, where you can connect with entrepreneurs, showcase your ideas, compete with the brightest minds, and take the first step toward building the future.",
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

export default function IdeathonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
