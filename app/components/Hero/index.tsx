"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "./Hero.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
//import { image_data } from "./bgImage";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Phase 1: Heading lines clip-path reveal (staggered)
      tl.fromTo(
        `.${styles.headingLine1}`,
        { clipPath: "inset(0 100% 0 0)", opacity: 0 },
        { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.8 },
      )
        .fromTo(
          `.${styles.headingLine2}`,
          { clipPath: "inset(0 0 0 100%)", opacity: 0 },
          { clipPath: "inset(0 -10px 0 0%)", opacity: 1, duration: 0.7 },
          "-=0.3",
        )
        .fromTo(
          `.${styles.headingLine3}`,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.7 },
          "-=0.3",
        )

        // Phase 2: Tagline slides up with fade
        .fromTo(
          `.${styles.tagline}`,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.2",
        )

        // Phase 3: Scrapbook elements "drop in" like being taped
        .fromTo(
          `.${styles.iedcBadge}`,
          { y: -60, x: -40, opacity: 0, rotation: -12, scale: 0.7 },
          {
            y: 0,
            x: 0,
            opacity: 1,
            rotation: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
          },
          "-=0.2",
        )
        .fromTo(
          `.${styles.statue}`,
          { x: 80, opacity: 0, scale: 0.85 },
          { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
          "-=0.4",
        )
        .fromTo(
          `.${styles.arrow}`,
          { scale: 0, opacity: 0, rotation: -90 },
          {
            scale: 1,
            opacity: 1,
            rotation: -15,
            duration: 0.5,
            ease: "back.out(2)",
          },
          "-=0.3",
        )
        .fromTo(
          `.${styles.communityNote}`,
          { y: -50, opacity: 0, rotation: 15, scale: 0.6 },
          {
            y: 0,
            opacity: 1,
            rotation: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.5)",
          },
          "-=0.2",
        )

        // Phase 4: Join button bounces in
        .fromTo(
          `.${styles.heroCta}`,
          { scale: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" },
          "-=0.2",
        )

        // Phase 5: Bottom elements slide in from edges
        .fromTo(
          `.${styles.founderTag}`,
          { x: -60, opacity: 0, rotation: -8 },
          {
            x: 0,
            opacity: 1,
            rotation: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.2",
        )
        .fromTo(
          `.${styles.statusBlock}`,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3",
        );

      // Continuous subtle animations after entrance
      // Scroll hint arrow bouncing
      gsap.to(`.${styles.scrollArrow}`, {
        y: 5,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: tl.duration(),
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      className={styles.hero}
      id="hero"
      ref={containerRef}
      // style={{
      //   "--bg-img-url": `url(${image_data})`,
      // } as React.CSSProperties}
    >
      {/* ── Top-left IEDC badge ── */}
      <div className={`${styles.iedcBadge} op-zero`}>
        <Image
          src="/hero/iedc-est.webp"
          alt="IEDC Bootcamp / CEC - EST. 2016"
          width={260}
          height={80}
          priority
          quality={100}
        />
      </div>

      {/* ── Statue illustration (right side) ── */}
      <div className={`${styles.statue} op-zero`}>
        <Image
          src="/hero/statue.webp"
          alt="Classical bust illustration"
          width={340}
          height={420}
          priority
          quality={100}
        />
      </div>

      {/* ── Community > Corporate note ── */}
      <div className={`${styles.communityNote} op-zero`}>
        <Image
          src="/hero/comunity-corp.webp"
          alt="Community > Corporate"
          width={200}
          height={120}
          quality={100}
        />
      </div>

      {/* ── Arrow ── */}
      <div className={`${styles.arrow} op-zero`}>
        <Image
          src="/hero/arrow.webp"
          alt="Decorative arrow"
          width={180}
          height={60}
          quality={100}
        />
      </div>

      {/* ── Main heading ── */}
      <div className={styles.headingBlock}>
        <h1>
          <span className={`${styles.headingLine1} op-zero`}>STARTUPS</span>
          <br />
          <span className={`${styles.headingLine2} op-zero`}>Start</span>
          <br />
          <span className={`${styles.headingLine3} op-zero`}>HERE.</span>
        </h1>
      </div>

      {/* ── Tagline strip ── */}
      <div className={`${styles.tagline} op-zero`}>
        <Image
          src="/hero/tagline-main.webp"
          alt="A startup-driven innovation forum at CEC. We experiment, validate, ship, repeat."
          width={520}
          height={80}
          quality={100}
        />
      </div>

      {/* ── Join Us button ── */}
      <button className={`${styles.heroCta} op-zero`} type="button">
        <span className={styles.heroCtaText}>Join Us</span>
      </button>

      {/* ── Bottom-left Founder in progress ── */}
      <div className={`${styles.founderTag} op-zero`}>
        <Image
          src="/hero/founder-prog.webp"
          alt="Founder in progress."
          width={220}
          height={60}
          quality={100}
        />
      </div>

      {/* ── Bottom-right status block ── */}
      <div className={`${styles.statusBlock} op-zero`}>
        <p className={styles.statusCode}>bootcamp.status = building;</p>
        <div className={styles.scrollHint}>
          <span className={styles.scrollArrow}>▼</span>
          <span className={styles.scrollText}>
            scroll if you&apos;re serious
          </span>
        </div>
      </div>
    </section>
  );
}
