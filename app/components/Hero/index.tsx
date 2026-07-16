"use client";

import { useRef } from "react";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from "./Hero.module.css";

gsap.registerPlugin(useGSAP);

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
        );
    },
    { scope: containerRef },
  );

  return (
    <section className={styles.hero} id="hero" ref={containerRef}>
      <div className={styles.heroInner}>
        <div className={styles.copyColumn}>
          <div className={`${styles.kickerContainer} ${styles.revealRail}`}>
            <span className={styles.kickerBar} />
            <span className={styles.kickerText}>IEDC BOOTCAMP CEC</span>
          </div>

          <h1 className={styles.heading}>
            <span
              className={`${styles.headingLine} ${styles.ideasWrapper} ${styles.revealMask}`}
            >
              <span className={styles.ideasText}>IDEAS</span>
              <img
                src="/assets/sparkle.svg"
                alt=""
                aria-hidden="true"
                className={styles.sparkles}
              />
            </span>
            <span
              className={`${styles.headingLine} ${styles.buildText} ${styles.revealMask}`}
            >
              BUILD
            </span>
            <span
              className={`${styles.headingLine} ${styles.realityText} ${styles.revealMask}`}
            >
              REALITY
            </span>
          </h1>

          <div className={`${styles.ctaSection} ${styles.revealUp}`}>
            <a href="#about" className={styles.primaryCta}>
              <span>
                Explore<span className={styles.ctaBootcamp}> BOOTCAMP</span>
              </span>
              <FiArrowUpRight aria-hidden="true" />
            </a>

            <img
              src="/assets/start_building.svg"
              alt="Start building today"
              className={styles.startBuildingSvg}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
