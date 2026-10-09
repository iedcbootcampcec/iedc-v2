import type { Metadata } from "next";
import LaunchCountdown from "./LaunchCountdown";

export const metadata: Metadata = {
  title: "Website Launch | IEDC BOOTCAMP CEC",
  description: "A new chapter for IEDC Bootcamp CEC. Count down to our website launch and step into a world of ideas.",
};

export default async function LaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ time?: string | string[] }>;
}) {
  const { time } = await searchParams;
  const seconds = typeof time === "string" && /^\d+$/.test(time) ? Number(time) : NaN;
  const countdownSeconds = Number.isSafeInteger(seconds) && seconds >= 0 ? seconds : null;

  return (
    <LaunchCountdown
      key={countdownSeconds ?? "scheduled"}
      countdownSeconds={countdownSeconds}
    />
  );
}
