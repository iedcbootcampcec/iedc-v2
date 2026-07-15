"use client";

import { useRef } from "react";
import styles from "./Footer.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import KsumLogo from "../logos/ksumLogo";
import IedcLogo from "../logos/iedcLogo";
import CollegeLogo from "../logos/collegeLogo";
import { INSTAGRAM, LINKEDIN } from "@data/publicUrls";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Footer() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        `.${styles.ctaSub}`,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      )
        .fromTo(
          `.${styles.ctaMain} .${styles.word}`,
          { y: "110%", opacity: 0, rotate: 5 },
          {
            y: "0%",
            opacity: 1,
            rotate: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power4.out",
          },
          "-=0.6",
        )
        .fromTo(
          `.${styles.divider}`,
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: "power4.inOut" },
          "-=0.4",
        )
        .fromTo(
          `.${styles.gridItem}`,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
          "-=0.6",
        );
    },
    { scope: containerRef },
  );

  return (
    <footer className={styles.footer} ref={containerRef}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeInner}>
          <div className={styles.marqueeTrack}>
            <span>IEDC BOOTCAMP CEC // EST. 2015 // </span>
            <span>IEDC BOOTCAMP CEC // EST. 2015 // </span>
            <span>IEDC BOOTCAMP CEC // EST. 2015 // </span>
            <span>IEDC BOOTCAMP CEC // EST. 2015 // </span>
          </div>
          <div
            className={`${styles.marqueeTrack} ${styles.marqueeTrackReverse}`}
            aria-hidden="true"
          >
            <span>IEDC BOOTCAMP CEC // EST. 2015 // </span>
            <span>IEDC BOOTCAMP CEC // EST. 2015 // </span>
            <span>IEDC BOOTCAMP CEC // EST. 2015 // </span>
            <span>IEDC BOOTCAMP CEC // EST. 2015 // </span>
          </div>
        </div>
      </div>
      {/* Huge Left-Aligned CTA Zone */}
      <div className={styles.ctaZone}>
        <h2 className={styles.ctaSub}>Got an idea?</h2>
        <a href="mailto:iedc_bootcamp@ceconline.edu" className={styles.ctaMain}>
          <span className={styles.wordOverflow}>
            <span className={styles.word}>LET&apos;S</span>
          </span>
          <span className={styles.wordOverflow}>
            <span className={styles.word}>BUILD</span>
          </span>
          <span className={styles.wordOverflow}>
            <span className={styles.word}>IT.</span>
          </span>
          <span className={styles.ctaArrow}>
            <FiArrowUpRight />
          </span>
        </a>
      </div>

      <div className={styles.divider}></div>

      {/* Structured Grid Zone */}
      <div className={styles.gridZone}>
        {/* Col 1: Branding */}
        <div className={`${styles.gridItem} ${styles.branding}`}>
          <h2>
            IEDC BOOTCAMP
            <br />
            CEC
          </h2>
          <p className={styles.tagline}>Experiment. Validate. Ship. Repeat.</p>
          <div className={styles.logosWrap}>
            <IedcLogo size={90} />
            <KsumLogo size={100} />
            <CollegeLogo size={65} />
          </div>
        </div>

        {/* Col 2: System Logs */}
        <div className={`${styles.gridItem} ${styles.sysLogs}`}>
          <p className={styles.code}>system.status = &quot;online&quot;;</p>
          <p className={styles.code}>location = &quot;chengannur&quot;;</p>
        </div>

        {/* Col 3: Socials */}
        <div className={`${styles.gridItem} ${styles.socials}`}>
          <a href={INSTAGRAM} target="_blank" rel="noreferrer">
            <FaInstagram className={styles.socialIcon} />
            Instagram
          </a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer">
            <FaLinkedinIn className={styles.socialIcon} />
            LinkedIn
          </a>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className={styles.bottomBar}>
        <p className={styles.copyText}>
          &copy; {new Date().getFullYear()} IEDC BOOTCAMP CEC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
