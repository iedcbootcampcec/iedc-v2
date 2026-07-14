"use client";

import { useRef } from "react";
import styles from "./About.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const pillars = [
  {
    num: "01",
    title: "IDEATE",
    variant: "ideate" as const,
    description:
      "Turn raw concepts into actionable roadmaps. We host design sprints, weekly masterclasses, and campus hackathons to turn chaotic ideas into clear plans.",
  },
  {
    num: "02",
    title: "BUILD",
    variant: "build" as const,
    description:
      "Get hands-on in the campus startup room. Access collaborative workspace, rapid prototyping resources, and full-stack technical peer mentorship to build your MVP.",
  },
  {
    num: "03",
    title: "LAUNCH",
    variant: "launch" as const,
    description:
      "Pitch to real investors, secure incubator placement, and apply for equity-free grants. We help you scale from a prototype to active campus adoption.",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        gsap.set([`.${styles.revealUp}`], {
          clearProps: "all",
          opacity: 1,
        });
        return;
      }

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
            trigger: sectionRef.current,
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
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.leftCol}>
            <div className={`${styles.headingBlock} ${styles.revealUp}`}>
              <h2 className={styles.heading}>WHO WE</h2>
              <div className={styles.accentRow}>
                <span className={styles.accentBadge}>ARE</span>
              </div>
            </div>

            <p className={`${styles.description} ${styles.revealUp}`}>
              IEDC Bootcamp CEC is where curious students stop consuming startup
              culture and start practicing it. A room to start messy, validate
              fast, and learn in public.
            </p>

            <div className={`${styles.missionCard} ${styles.revealUp}`}>
              <p className={styles.missionText}>
                OUR MISSION: Build real-world applications, encourage failure as
                a stepping stone, and create founders before they graduate.
              </p>
            </div>
          </div>

          <div className={styles.rightCol}>
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className={`${styles.pillarCard} ${styles[pillar.variant]} ${styles.revealUp}`}
              >
                <div className={styles.pillarHeader}>
                  <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                  <span className={styles.pillarBadge}>
                    PILLAR {pillar.num}
                  </span>
                </div>
                <p className={styles.pillarDescription}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
