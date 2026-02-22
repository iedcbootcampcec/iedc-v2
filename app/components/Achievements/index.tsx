"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import styles from "./Achievements.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/* ── Test achievement data ── */
const achievements = [
  {
    title: "Won State Innovation Award",
    desc: "SSF startups mentored by our team received the coveted State Innovation Award, enhancing our credibility across the ecosystem.",
    image_url:
      "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b6?w=600&h=400&fit=crop",
  },
  {
    title: "National Hackathon Champions",
    desc: "Our student team secured first place at the National Hackathon, building an AI-powered sustainability tracker in just 36 hours.",
    image_url:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop",
  },
  {
    title: "Launched Student Incubator",
    desc: "Established a fully functional in-campus incubator providing workspace, mentorship, and seed funding to early-stage student startups.",
    image_url:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
  },
  {
    title: "EdTech Product Acquired",
    desc: "A student-built EdTech platform incubated under our program was acquired by a leading national education company.",
    image_url:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop",
  },
  {
    title: "Best IEDC in Kerala",
    desc: "Recognized as the best Innovation and Entrepreneurship Development Centre in Kerala by the Kerala Startup Mission.",
    image_url:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
  },
];

/* Offsets for stacked papers behind the top card */
const stackOffsets = [
  { rotate: 0, x: 0, y: 0, scale: 1 },
  { rotate: -2.5, x: -6, y: 8, scale: 0.97 },
  { rotate: 3, x: 5, y: 14, scale: 0.94 },
  { rotate: -4, x: -8, y: 20, scale: 0.91 },
];

export default function Achievements() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Which indices are visible in the stack (up to 4 cards) */
  const getVisibleIndices = useCallback(() => {
    const indices: number[] = [];
    for (let i = 0; i < Math.min(4, achievements.length); i++) {
      indices.push((currentIndex + i) % achievements.length);
    }
    return indices;
  }, [currentIndex]);

  const visibleIndices = getVisibleIndices();

  /* ── Navigate with GSAP stack animation ── */
  const navigate = useCallback((direction: "next" | "prev") => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const topCard = cardRefs.current[0];
    if (!topCard) {
      isAnimating.current = false;
      return;
    }

    const isNext = direction === "next";

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex((prev) => {
          if (isNext) return (prev + 1) % achievements.length;
          return (prev - 1 + achievements.length) % achievements.length;
        });
        isAnimating.current = false;
      },
    });

    // Phase 1: Top card lifts up and peels away
    tl.to(topCard, {
      y: -40,
      rotation: isNext ? 6 : -6,
      scale: 1.03,
      boxShadow: "8px 18px 50px rgba(0,0,0,0.3)",
      duration: 0.25,
      ease: "power2.out",
    }).to(topCard, {
      y: -100,
      opacity: 0,
      rotation: isNext ? 12 : -12,
      scale: 0.9,
      duration: 0.3,
      ease: "power3.in",
    });

    // Phase 2: Cards behind shift up into position
    for (let i = 1; i < Math.min(4, achievements.length); i++) {
      const card = cardRefs.current[i];
      if (!card) continue;
      const target = stackOffsets[i - 1];
      tl.to(
        card,
        {
          rotation: target.rotate,
          x: target.x,
          y: target.y,
          scale: target.scale,
          duration: 0.35,
          ease: "power2.out",
        },
        "-=0.25",
      );
    }
  }, []);

  /* ── Auto-play every 3s ── */
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      navigate("next");
    }, 3000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [navigate]);

  /* ── After state update, snap cards to their stack positions ── */
  useEffect(() => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const offset = stackOffsets[i] || stackOffsets[stackOffsets.length - 1];
      gsap.set(card, {
        rotation: offset.rotate,
        x: offset.x,
        y: offset.y,
        scale: offset.scale,
        opacity: 1,
        zIndex: 10 - i,
        clearProps: "boxShadow",
      });
    });
  }, [currentIndex]);

  /* ── Scroll-triggered entrance ── */
  useGSAP(
    () => {
      gsap.fromTo(
        `.${styles.heading}`,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.heading}`,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        },
      );

      gsap.fromTo(
        `.${styles.stackWrapper}`,
        { y: 80, opacity: 0, scale: 0.92 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.stackWrapper}`,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section className={styles.container} id="achievements" ref={sectionRef}>
      {/* ── Background watermarks ── */}
      <div className={styles.watermarkWrap} aria-hidden="true">
        <span
          className={styles.watermark}
          style={{ fontSize: "clamp(6rem, 20vw, 18rem)", opacity: 0.08 }}
        >
          IMPACT
        </span>
        <span
          className={styles.watermark}
          style={{ fontSize: "clamp(4.5rem, 15vw, 13rem)", opacity: 0.05 }}
        >
          IMPACT
        </span>
        <span
          className={styles.watermark}
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)", opacity: 0.03 }}
        >
          IMPACT
        </span>
      </div>

      {/* ── Heading ── */}
      <div className={styles.heading} style={{ opacity: 0 }}>
        <h2>Achievements</h2>
        <span className={styles.headingSub}>/ documented impact</span>
      </div>

      {/* ── Paper stack ── */}
      <div className={styles.stackWrapper} style={{ opacity: 0 }}>
        {visibleIndices.map((achIndex, stackPos) => {
          const ach = achievements[achIndex];
          const offset = stackOffsets[stackPos];
          return (
            <div
              className={styles.card}
              key={`card-${achIndex}`}
              ref={(el) => {
                cardRefs.current[stackPos] = el;
              }}
              style={{
                zIndex: 10 - stackPos,
                transform: `rotate(${offset.rotate}deg) translate(${offset.x}px, ${offset.y}px) scale(${offset.scale})`,
              }}
            >
              {/* Image */}
              <div className={styles.cardImageWrap}>
                <Image
                  src={ach.image_url}
                  alt={ach.title}
                  fill
                  sizes="(max-width: 600px) 90vw, 440px"
                  className={styles.cardImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* Title */}
              <h3 className={styles.cardTitle}>{ach.title}</h3>

              {/* Description */}
              <p className={styles.cardDesc}>{ach.desc}</p>

              {/* Navigation */}
              <div className={styles.navRow}>
                <span className={styles.counter}>
                  {achIndex + 1} / {achievements.length}
                </span>
                <button
                  className={styles.prevBtn}
                  onClick={() => navigate("prev")}
                  aria-label="Previous achievement"
                >
                  <FiArrowLeft />
                  Prev
                </button>
                <button
                  className={styles.nextBtn}
                  onClick={() => navigate("next")}
                  aria-label="Next achievement"
                >
                  Next
                  <FiArrowRight />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── View All button ── */}
      <a href="/achievements" className={styles.viewAllBtn}>
        View All Achievements
        <FiArrowRight />
      </a>
    </section>
  );
}
