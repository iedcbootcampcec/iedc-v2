"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import styles from "./Achievements.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
  {
    title: "Best IEDC in Kerala",
    desc: "Recognized as the best Innovation and Entrepreneurship Development Centre in Kerala by the Kerala Startup Mission.",
    image_url:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop",
  },
];

const getStackOffset = (index: number) => {
  if (index === 0) return { rotate: 0, x: 0, y: 0, scale: 1 };

  const isOdd = index % 2 !== 0;
  return {
    rotate: isOdd ? -(2 + index * 0.5) : 2 + index * 0.5,
    x: isOdd ? -(4 + index * 2) : 3 + index,
    y: index * 6 + 2,
    scale: Math.max(0.8, 1 - index * 0.03),
  };
};

export default function Achievements() {
  const sectionRef = useRef<HTMLElement>(null);
  const navref = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useRef(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasIntroPlayed = useRef(false);

  const getVisibleIndices = useCallback(() => {
    const indices: number[] = [];
    for (let i = 0; i < Math.min(4, achievements.length); i++) {
      indices.push((currentIndex + i) % achievements.length);
    }
    return indices;
  }, [currentIndex]);

  const visibleIndices = getVisibleIndices();

  const navigate = useCallback(
    (direction: "next" | "prev") => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      const isNext = direction === "next";

      if (isNext) {
        // ===== NEXT: Throw top card away, then update state =====
        const topCard = cardRefs.current[0];
        if (!topCard) {
          isAnimating.current = false;
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            setCurrentIndex((prev) => (prev + 1) % achievements.length);
            isAnimating.current = false;
          },
        });

        tl.to(topCard, {
          y: -40,
          rotation: 6,
          scale: 1.03,
          boxShadow: "8px 18px 50px rgba(0,0,0,0.3)",
          duration: 0.25,
          ease: "power2.out",
        }).to(topCard, {
          y: -100,
          opacity: 0,
          rotation: 12,
          scale: 0.9,
          duration: 0.3,
          ease: "power3.in",
        });

        for (let i = 1; i < Math.min(4, achievements.length); i++) {
          const card = cardRefs.current[i];
          if (!card) continue;
          const target = getStackOffset(i - 1);
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
      } else {
        // ===== PREV: Update state immediately, then animate dropping in =====
        setCurrentIndex(
          (prev) => (prev - 1 + achievements.length) % achievements.length,
        );

        // Use a brief timeout to let React render the previous card at index 0
        setTimeout(() => {
          const newTopCard = cardRefs.current[0];
          if (!newTopCard) return;

          // Animate new top card dropping IN
          gsap.fromTo(
            newTopCard,
            { y: -80, opacity: 0, rotation: -10, scale: 1.05 },
            {
              y: 0,
              opacity: 1,
              rotation: 0,
              scale: 1,
              duration: 0.4,
              ease: "back.out(1.2)",
              onComplete: () => {
                isAnimating.current = false;
              },
            },
          );

          // Animate the rest of the stack sliding DOWN
          for (let i = 1; i < Math.min(4, achievements.length); i++) {
            const card = cardRefs.current[i];
            if (!card) continue;
            const prevTarget = getStackOffset(i - 1);
            const newTarget = getStackOffset(i);
            gsap.fromTo(
              card,
              {
                rotation: prevTarget.rotate,
                x: prevTarget.x,
                y: prevTarget.y,
                scale: prevTarget.scale,
              },
              {
                rotation: newTarget.rotate,
                x: newTarget.x,
                y: newTarget.y,
                scale: newTarget.scale,
                duration: 0.4,
                ease: "power2.out",
              },
            );
          }
        }, 0);
      }
    },
    [achievements.length],
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
    tl.to(navbar, {
      "--nav-color-rgb": "var(--achivements-color-rgb)",
    });

    return () => {
      tl.kill();
    };
  }, []);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      navigate("next");
    }, 3000);
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasIntroPlayed.current) return;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const offset = getStackOffset(i);

      if (isAnimating.current) {
        gsap.set(card, { zIndex: 10 - i });
      } else {
        gsap.set(card, {
          rotation: offset.rotate,
          x: offset.x,
          y: offset.y,
          scale: offset.scale,
          opacity: 1,
          zIndex: 10 - i,
          clearProps: "boxShadow",
        });
      }
    });
  }, [currentIndex]);

  useGSAP(
    () => {
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        onComplete: () => {
          hasIntroPlayed.current = true;
          startAutoPlay();
        },
        onLeaveBack: () => {
          hasIntroPlayed.current = false;
          if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        },
      });

      masterTl.fromTo(
        `.${styles.heading}`,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
        },
      );

      const count = Math.min(cardRefs.current.length, 4);
      for (let i = 0; i < count; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        gsap.set(card, {
          opacity: 0,
          x: 600,
          y: -80,
          rotation: 25 + i * 8,
          scale: 0.85,
        });
      }
      masterTl.set(`.${styles.stackWrapper}`, { opacity: 1 }, "-=0.2");

      for (let i = count - 1; i >= 0; i--) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const target = getStackOffset(i);

        masterTl.to(
          card,
          {
            x: target.x,
            y: target.y,
            rotation: target.rotate,
            scale: target.scale,
            opacity: 1,
            duration: 0.55,
            ease: "back.out(1.4)",
          },
          i === count - 1 ? "-=0.1" : "-=0.2",
        );
      }

      /* ─ Phase 4: View All button fades up ─ */
      masterTl.fromTo(
        `.${styles.viewAllBtn}`,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.15",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section className={styles.container} id="achievements" ref={sectionRef}>
      {/* ── Background watermarks ── */}
      <div className={styles.watermarkWrap} aria-hidden="true">
        <span className={`${styles.watermark} ${styles.watermark1}`}>
          IMPACT
        </span>
        <span className={`${styles.watermark} ${styles.watermark2}`}>
          IMPACT
        </span>
        <span className={`${styles.watermark} ${styles.watermark3}`}>
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
          const offset = getStackOffset(stackPos);
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
                  onClick={() => {
                    navigate("prev");
                    startAutoPlay();
                  }}
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
