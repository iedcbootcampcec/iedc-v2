"use client";

import { useRef } from "react";
import styles from "./About.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set([`.${styles.revealRail}`, `.${styles.revealUp}`], {
          clearProps: "all",
          opacity: 1,
        });
        return;
      }

      gsap.fromTo(
        `.${styles.revealRail}`,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        `.${styles.revealUp}`,
        { y: 42, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.contentWrapper}`,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section className={styles.about} id="about" ref={sectionRef}>
      <div
        className={`${styles.topRail} ${styles.revealRail}`}
        style={{ opacity: 0 }}
      >
        <span>About</span>
        <span>Startup practice / campus-built / serious student energy</span>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.leftCol}>
          <p
            className={`${styles.eyebrow} ${styles.revealUp}`}
            style={{ opacity: 0 }}
          >
            Why this exists
          </p>
          <h2
            className={`${styles.heading} ${styles.revealUp}`}
            style={{ opacity: 0 }}
          >
            More working room <br />
            <span className={styles.headingAccent}>than club room.</span>
          </h2>
        </div>

        <div className={styles.rightCol}>
          <p
            className={`${styles.lead} ${styles.revealUp}`}
            style={{ opacity: 0 }}
          >
            IEDC Bootcamp CEC is where curious students stop consuming startup
            culture and start practicing it. A room to start messy, validate
            fast, and learn in public.
          </p>

          <div
            className={`${styles.simpleProcess} ${styles.revealUp}`}
            style={{ opacity: 0 }}
          >
            <div className={styles.step}>
              <span className={styles.stepNum}>01</span>
              <span className={styles.stepText}>Spot the problem</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>02</span>
              <span className={styles.stepText}>Make it tangible</span>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>03</span>
              <span className={styles.stepText}>Learn in public</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
