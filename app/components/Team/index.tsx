"use client";

import { useRef, useEffect } from "react";
import styles from "./Team.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Faculty from "./Faculty";
import Execom from "./Execom";
import SubExecom from "./SubExecom";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Header Reveal
      gsap.fromTo(
        `.${styles.headingBlock}`,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.headingBlock}`,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        `.${styles.tagline}`,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: `.${styles.headingBlock}`,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        `.${styles.divider}`,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: `.${styles.divider}`,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  useEffect(() => {
    //change color of navbar on enter and leaving
    const navbar = document.getElementById("navbar-ref");
    if (!navbar) return;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 0%",
        toggleActions: "play none none reverse",
      },
    });
    // to match the nav color to the section color
    // achivements section has color #FCC503
    tl.to(navbar, {
      "--nav-color-rgb": "var(--team-color-rgb)",
      "--nav-text-color": "var(--color-white)",
      "--nav-logo-color": "var(--color-white)",
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className={styles.teamMain} id="team" ref={sectionRef}>
      <Faculty />
      <Execom />
      <SubExecom />
    </section>
  );
}
