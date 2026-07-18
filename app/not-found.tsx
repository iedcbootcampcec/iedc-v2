import type { Metadata } from "next";
import NotFound from "./components/NotFound";

export const metadata: Metadata = {
  title: "404 — Page Not Found | IEDC BOOTCAMP CEC",
  description: "This page never made it past the idea stage.",
};

export default function NotFoundPage() {
  return <NotFound />;
}
