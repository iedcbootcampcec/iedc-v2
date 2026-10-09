"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowUpRight, FiPlus } from "react-icons/fi";
import TechText from "../components/TechText/TechText";
import styles from "./launch.module.css";

// Launch time in IST. Change this one value to reschedule the countdown.
export const LAUNCH_AT = "2026-10-09T14:30:00+05:30";
const launchTimestamp = Date.parse(LAUNCH_AT);

function subscribeToClock(onChange: () => void) {
  const interval = window.setInterval(onChange, 1000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(interval);
    document.removeEventListener("visibilitychange", onChange);
  };
}
const getClockSnapshot = () => Math.floor(Date.now() / 1000);
const getServerClockSnapshot = () => null;

export default function LaunchCountdown() {
  const now = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot,
  );
  const secondsLeft =
    now === null ? null : Math.max(0, Math.ceil(launchTimestamp / 1000 - now));
  const isLive = secondsLeft === 0;
  const countdown = [
    {
      label: "Days",
      value: secondsLeft === null ? null : Math.floor(secondsLeft / 86400),
    },
    {
      label: "Hours",
      value: secondsLeft === null ? null : Math.floor(secondsLeft / 3600) % 24,
    },
    {
      label: "Minutes",
      value: secondsLeft === null ? null : Math.floor(secondsLeft / 60) % 60,
    },
    { label: "Seconds", value: secondsLeft === null ? null : secondsLeft % 60 },
  ];
  const [isLaunching, setIsLaunching] = useState(false);
  const launchStarted = useRef(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLaunching) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    loaderRef.current?.focus();
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timeout = window.setTimeout(
      () => router.push("/"),
      reduceMotion ? 150 : 2800,
    );
    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLaunching, router]);

  const enterWebsite = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    if (launchStarted.current) return;
    launchStarted.current = true;
    setIsLaunching(true);
  };

  return (
    <>
      <main className={styles.page} inert={isLaunching}>
        <div className={styles.shell}>
          <section className={styles.content} aria-labelledby="launch-heading">
            <div className={styles.titleRow}>
              <div>
                <p className={styles.eyebrow}>
                  <span /> IEDC BOOTCAMP CEC / WEBSITE LAUNCH
                </p>
                <h1 id="launch-heading" className={styles.heading}>
                  {isLive ? (
                    <>
                      LET’S BUILD.
                      <br />
                      <span>WHAT’S NEXT?</span>
                    </>
                  ) : (
                    <>
                      GOOD IDEAS.
                      <br />
                      <span>NEW BEGINNINGS.</span>
                    </>
                  )}
                </h1>
                <p className={styles.handwritten}>
                  {isLive ? "The wait is over." : "Almost here."}
                </p>
              </div>
              <div className={styles.stamp} aria-hidden="true">
                <svg viewBox="0 0 160 160" className={styles.stampRing}>
                  <defs>
                    <path
                      id="launch-stamp-circle"
                      d="M80,80 m-59,0 a59,59 0 1,1 118,0 a59,59 0 1,1 -118,0"
                    />
                  </defs>
                  <text>
                    <textPath href="#launch-stamp-circle">
                      IDEAS • BUILD • REALITY • IDEAS • BUILD • REALITY •{" "}
                    </textPath>
                  </text>
                </svg>
                <FiArrowUpRight className={styles.stampArrow} />
              </div>
            </div>

            <dl
              className={styles.countdown}
              role="timer"
              aria-label="Time remaining until the website launch"
              aria-live="off"
            >
              {countdown.map(({ label, value }, index) => (
                <div
                  key={label}
                  className={`${styles.timeTile} ${index === 3 ? styles.secondsTile : ""}`}
                >
                  <dt>{label}</dt>
                  <dd>
                    {value === null ? "--" : String(value).padStart(2, "0")}
                  </dd>
                  <FiPlus aria-hidden="true" className={styles.tileMark} />
                </div>
              ))}
            </dl>

            <div className={styles.bottomRow}>
              <p className={styles.description}>
                {isLive
                  ? "Our new home for ideas is ready. Come on in."
                  : "A new space for curious minds, bold ideas, and the things we’ll build together."}
              </p>
              <Link
                href="/"
                onClick={enterWebsite}
                className={styles.enterButton}
              >
                Enter website <FiArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      {isLaunching && (
        <div
          ref={loaderRef}
          className={styles.loader}
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-heading"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") router.push("/");
          }}
        >
          <h2 id="loading-heading" className={styles.srOnly}>
            Loading IEDC
          </h2>
          <div className={styles.loaderTop}>
            <span>IEDC BOOTCAMP CEC</span>
            <span>
              LET’S MAKE IT REAL <FiPlus aria-hidden="true" />
            </span>
          </div>
          <div className={styles.loaderCenter}>
            <p className={styles.loaderEyebrow}>A NEW CHAPTER BEGINS</p>
            <div className={styles.loaderWord}>
              <TechText
                text="IEDC"
                fontSize={260}
                fontWeight={400}
                letterSpacing={0.035}
                color="#1a1a1a"
                accentColor="#e8a020"
                reach={100}
                strokeWidth={1.3}
                specks={8}
                draggable={false}
                speed={4}
              />
            </div>
            <p className={styles.loaderCaption} role="status">
              Good ideas are coming your way.
            </p>
            <div className={styles.loadingTrack} aria-hidden="true">
              <span />
            </div>
          </div>
          <div className={styles.loaderBottom}>
            <span>IDEAS. BUILD. REALITY.</span>
            <Link href="/" className={styles.skipLink}>
              Skip animation <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
