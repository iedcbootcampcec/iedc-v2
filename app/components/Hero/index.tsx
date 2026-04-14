"use client";

import { useRef } from "react";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP);

const stats = [
  { value: "EST. 2015", label: "student-led startup culture" },
  { value: "01", label: "campus room for first-time founders" },
  { value: "SHIP > HYPE", label: "build, test, learn, repeat" },
];

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set(
          [
            `.${styles.revealRail}`,
            `.${styles.revealMask}`,
            `.${styles.revealUp}`,
            `.${styles.revealScale}`,
            `.${styles.revealCard}`,
          ],
          { clearProps: "all", opacity: 1 },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        `.${styles.revealRail}`,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45 },
      )
        .fromTo(
          `.${styles.revealMask}`,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          {
            clipPath: "inset(0 0% 0 0)",
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
          },
          "-=0.15",
        )
        .fromTo(
          `.${styles.revealUp}`,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.1 },
          "-=0.45",
        )
        .fromTo(
          `.${styles.revealScale}`,
          { scale: 0.92, opacity: 0, rotate: -2 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.75,
            ease: "back.out(1.2)",
          },
          "-=0.45",
        )
        .fromTo(
          `.${styles.revealCard}`,
          { y: 36, opacity: 0, rotate: 6 },
          {
            y: 0,
            opacity: 1,
            rotate: 0,
            duration: 0.55,
            stagger: 0.12,
            ease: "back.out(1.3)",
          },
          "-=0.45",
        );
    },
    { scope: containerRef },
  );

  return (
    <section className={styles.hero} id="hero" ref={containerRef}>
      <div className={`${styles.topRail} ${styles.revealRail}`}>
        <span>IEDC BOOTCAMP CEC</span>
        <span>STARTUP ROOM / MAKER CULTURE / CAMPUS-BUILT</span>
      </div>

      <div className={styles.heroInner}>
        <div className={styles.copyColumn}>
          <p className={`${styles.kicker} ${styles.revealUp}`}>
            A student-led bootcamp for builders, dreamers, and first-time
            founders.
          </p>

          <h1 className={styles.heading}>
            <span className={`${styles.headingLine} ${styles.revealMask}`}>
              START
            </span>
            <span
              className={`${styles.headingLine} ${styles.headingAccent} ${styles.revealMask}`}
            >
              something
            </span>
            <span className={`${styles.headingLine} ${styles.revealMask}`}>
              real.
            </span>
          </h1>

          <div className={`${styles.actions} ${styles.revealUp}`}>
            <a href="#about" className={styles.primaryCta}>
              <span>Explore Bootcamp</span>
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>

          <div className={`${styles.statsGrid} ${styles.revealUp}`}>
            {stats.map((item) => (
              <div className={styles.statCard} key={item.value}>
                <span className={styles.statValue}>{item.value}</span>
                <span className={styles.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.posterColumn}>
          <article className={`${styles.posterCard} ${styles.revealScale}`}>
            <span className={styles.posterTape} aria-hidden="true" />

            <div className={styles.posterTopline}>
              <span>bootcamp note / 01</span>
            </div>

            <div className={styles.posterBody}>
              <p className={styles.posterLabel}>
                founder energy, campus timing
              </p>
              <h2 className={styles.posterHeadline}>
                Experiment.
                <br />
                Validate.
                <br />
                Ship.
                <br />
                Repeat.
              </h2>
            </div>
          </article>

          <aside
            className={`${styles.noteCard} ${styles.noteOne} ${styles.revealCard}`}
          >
            <span className={styles.noteLabel}>field note</span>
            <p>
              Builders / dreamers / chaos managers. The vibe is serious work
              with student energy still intact.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
