import type { Metadata } from "next";
import LaunchCountdown from "./LaunchCountdown";

export const metadata: Metadata = {
  title: "Website Launch | IEDC BOOTCAMP CEC",
  description: "A new chapter for IEDC Bootcamp CEC. Count down to our website launch and step into a world of ideas.",
};

export default function LaunchPage() {
  return <LaunchCountdown />;
}
