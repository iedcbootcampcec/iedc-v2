"use client";

import { useRef, Fragment } from "react";
import styles from "./About.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const phases = [
  {
    step: "01",
    label: "Ideate",
    desc: "We help students turn raw ideas into validated concepts.",
  },
  {
    step: "02",
    label: "Build",
    desc: "Workshops, sprints, and real product execution.",
  },
  {
    step: "03",
    label: "Scale",
    desc: "Mentorship, funding guidance, ecosystem exposure.",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Heading reveal
      gsap.fromTo(
        `.${styles.heading}`,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.heading}`,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Phase blocks staggered reveal
      gsap.fromTo(
        `.${styles.phase}`,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.pipeline}`,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Connector lines draw-in
      gsap.fromTo(
        `.${styles.connectorLine}`,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.6,
          stagger: 0.25,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: `.${styles.pipeline}`,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Bottom tagline
      gsap.fromTo(
        `.${styles.taglineBottom}`,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: `.${styles.taglineBottom}`,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section className={styles.about} id="about" ref={sectionRef}>
      {/* ── Heading ── */}
      <div className={styles.heading} style={{ opacity: 0 }}>
        <h2>
          We Build <span className={styles.headingAccent}>Founders.</span>
        </h2>
      </div>

      {/* ── Pipeline / Journey ── */}
      <div className={styles.pipeline}>
        {phases.map((phase, i) => (
          <Fragment key={phase.step}>
            <div
              className={styles.phase}
              key={phase.step}
              style={{ opacity: 0 }}
            >
              <span className={styles.stepNumber}>{phase.step}</span>
              <h3 className={styles.phaseLabel}>{phase.label}</h3>
              <p className={styles.phaseDesc}>{phase.desc}</p>
            </div>

            {/* Connector between phases (not after the last one) */}
            {i < phases.length - 1 && (
              <div className={styles.connector} key={`c-${i}`}>
                <div className={styles.connectorLine} />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* ── Bottom tagline ── */}
      <div className={styles.taglineBottom} style={{ opacity: 0 }}>
        <p>idea → prototype → startup</p>
      </div>
    </section>
  );
}
