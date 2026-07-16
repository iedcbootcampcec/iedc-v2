"use client";

import { useRef } from "react";
import styles from "./Mascot.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Mascot() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set([`.${styles.reveal}`], { clearProps: "all", opacity: 1 });
        return;
      }

      gsap.fromTo(
        `.${styles.reveal}`,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <section className={styles.mascotSection} ref={containerRef}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={`${styles.textCol} ${styles.reveal}`}>
            <div className={styles.kickerContainer}>
              <span className={styles.kickerBar} />
              <span className={styles.kickerText}>THE SPIRIT OF CEC</span>
            </div>
            
            <div className={styles.headerMobileRow}>
              <div className={styles.textLeft}>
                <h2 className={styles.heading}>
                  MEET <span className={styles.accentText}>VOLT</span>
                </h2>
                <p className={styles.description}>
                  Volt is the official mascot of IEDC Bootcamp CEC. With burning flame hair representing infinite curiosity, and a cape built for shipping fast, Volt is the digital companion for every student creator, developer, and founder on campus.
                </p>
              </div>

              <div className={styles.mobileImageWrapper}>
                <img
                  src="/assets/mascot.png"
                  alt="IEDC Volt Mascot"
                  className={styles.mascotImgMobile}
                />
              </div>
            </div>

            <div className={styles.rulesCard}>
              <h3 className={styles.rulesTitle}>VOLT&apos;S CODE FOR BUILDERS:</h3>
              <ul className={styles.rulesList}>
                <li>
                  <strong className={styles.ruleNumber}>01</strong>
                  <span>Always ship over hype. Tangible MVPs win arguments.</span>
                </li>
                <li>
                  <strong className={styles.ruleNumber}>02</strong>
                  <span>Failure is just high-quality debugging. Keep iterating.</span>
                </li>
                <li>
                  <strong className={styles.ruleNumber}>03</strong>
                  <span>Keep the student-led founder energy serious and loud.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`${styles.imageCol} ${styles.reveal}`}>
            <div className={styles.imageWrapper}>
              <img
                src="/assets/mascot.png"
                alt="IEDC Volt Mascot"
                className={styles.mascotImg}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
