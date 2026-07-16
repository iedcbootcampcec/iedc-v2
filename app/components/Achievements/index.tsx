"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import styles from "./Achievements.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const achievements = [
  {
    title: "A New Journey Begins for Lekshmipriya S & Abhijith J Nair at IEDC NEST",
    desc: "IEDC BOOTCAMP CEC is excited to announce that Lekshmipriya S and Abhijith J Nair are beginning their new journey at IEDC NEST.",
    image_url:
      "https://cdn.jsdelivr.net/gh/iedcbootcampcec/iedc-web-assets@main/achievements/new_journey_nest.webp",
  },
  {
    title: "Ananthu M P - Community Developer for IEDC NEST.",
    desc: "IEDC BOOTCAMP CEC is thrilled to announce that Ananthu M P, CEO, IEDC BOOTCAMP CEC is starting his new position as Community Developer for IEDC NEST",
    image_url:
      "https://cdn.jsdelivr.net/gh/iedcbootcampcec/iedc-web-assets@main/achievements/community_dev_nest.webp",
  },
  {
    title: "Akshay Pradeep - State Student Lead of IEDC NEST",
    desc: "Mr. Akshay Pradeep, Creative and Innovations Lead at IEDC Bootcamp CEC was selected as the State Lead of IEDC NEST (Network of Entrepreneurs & Students' Team).",
    image_url:
      "https://cdn.jsdelivr.net/gh/iedcbootcampcec/iedc-web-assets@main/achievements/Akshay_pradeep.webp",
  },
  {
    title: "Sreelakshmi M - State Creative Lead of IEDC NEST",
    desc: "Ms. Sreelakshmi M, Student Lead of IEDC Bootcamp CEC was selected as the State Creative Lead of IEDC NEST (Network of Entrepreneurs & Students' Team).",
    image_url:
      "https://cdn.jsdelivr.net/gh/iedcbootcampcec/iedc-web-assets@main/achievements/state_creative_lead.webp",
  },
  {
    title: "AKSHAY PRADEEP ADDRESSING IEDC SUMMIT",
    desc: "Mr. Akshay Pradeep, the State Student Lead of IEDC NEST (Network of Entrepreneurs & Students' Team), addressed the IEDC Summit - Asia's largest Summit for aspiring entrepreneurs.",
    image_url:
      "https://cdn.jsdelivr.net/gh/iedcbootcampcec/iedc-web-assets@main/achievements/addressing_iedc_summit.webp",
  },
  {
    title: "SPECIAL MENTION AWARD",
    desc: "Ms. Sreelakshmi M, CEO of IEDC Bootcamp CEC secured a special mention award for the active contribution, commitment, and dedication towards Innovators' Premier League 2021 hosted by Kerala Startup Mission and IEDC Kerala.",
    image_url:
      "https://cdn.jsdelivr.net/gh/iedcbootcampcec/iedc-web-assets@main/achievements/special_mention_award.webp",
  },
  {
    title: "IDEA FEST GRANT WINNERS 2021",
    desc: "The team comprising Basim Aslam P O, Suzanne James, Lekshmi Priya V, and Sanal Sabu participated in Idea Fest Grant 2021 and was honored with a cash prize of 1 lakh from IEDC Kerala and Kerala StartUp Mission at Technopark, Trivandrum.",
    image_url:
      "https://cdn.jsdelivr.net/gh/iedcbootcampcec/iedc-web-assets@main/achievements/idea_fest_grant_winners.webp",
  },
  {
    title: "TOP PERFORMER IN SOUTH REGION",
    desc: "The IEDC Bootcamp CEC team was awarded the top position in the South Region and also recognized as the top performer in the Alappuzha district in the Innovators Premier League (IPL), hosted by Kerala StartUp Mission and IEDC Kerala.",
    image_url:
      "https://cdn.jsdelivr.net/gh/iedcbootcampcec/iedc-web-assets@main/achievements/top_performer.webp",
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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isInteracting = useRef(false);
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drag Physics State
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const startTimestamp = useRef(0);

  const startAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    autoPlayTimer.current = setTimeout(() => {
      const target = cardRefs.current[currentIndex];
      if (!target || isInteracting.current) return;

      // Auto-shuffle motion (swing right)
      gsap.to(target, {
        x: window.innerWidth > 600 ? 400 : 250,
        y: 30,
        rotation: 25,
        scale: 0.9,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(target, { zIndex: 0 });
          setCurrentIndex((prev) => (prev + 1) % achievements.length);
        },
      });
    }, 3500);
  }, [currentIndex]);

  // Handle snap to position whenever currentIndex updates
  useEffect(() => {
    if (isInteracting.current) return;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      let stackPos =
        (i - currentIndex + achievements.length) % achievements.length;
      const offset = getStackOffset(stackPos);

      gsap.to(card, {
        rotation: offset.rotate,
        x: offset.x,
        y: offset.y,
        scale: offset.scale,
        opacity: 1, // Keep always visible so shuffle is seen seamlessly
        duration: 0.5,
        ease: "back.out(1.2)",
        zIndex: 10 - stackPos,
        pointerEvents: stackPos === 0 ? "auto" : "none",
        overwrite: "auto",
      });

      card.className = `${styles.card} ${stackPos === 0 ? styles.cardGrab : ""}`;
    });

    // trigger autoplay
    startAutoPlay();

    return () => {
      if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    };
  }, [currentIndex, startAutoPlay]);

  // Pointer event handlers for physics-based throwing
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    cardIndex: number,
  ) => {
    let stackPos =
      (cardIndex - currentIndex + achievements.length) % achievements.length;
    if (stackPos !== 0) return; // Only allow dragging the top card

    isInteracting.current = true;
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    // Initial touch coordinates
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentX.current = 0;
    currentY.current = 0;
    startTimestamp.current = Date.now();

    target.classList.add(styles.cardDragging);
    gsap.killTweensOf(target); // Stop snapping tweens
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>,
    cardIndex: number,
  ) => {
    let stackPos =
      (cardIndex - currentIndex + achievements.length) % achievements.length;
    if (!isInteracting.current || stackPos !== 0) return;

    const target = e.currentTarget;
    currentX.current = e.clientX - startX.current;
    currentY.current = e.clientY - startY.current;

    // Apply rotation based on how far we've dragged X
    const rotation = currentX.current * 0.04;

    gsap.set(target, {
      x: currentX.current,
      y: currentY.current,
      rotation: rotation,
    });
  };

  const handlePointerUp = (
    e: React.PointerEvent<HTMLDivElement>,
    cardIndex: number,
  ) => {
    let stackPos =
      (cardIndex - currentIndex + achievements.length) % achievements.length;
    if (!isInteracting.current || stackPos !== 0) return;

    isInteracting.current = false;
    const target = e.currentTarget;
    target.releasePointerCapture(e.pointerId);
    target.classList.remove(styles.cardDragging);

    const timeDiff = Date.now() - startTimestamp.current;

    // Determine velocity
    const velocityX = currentX.current / timeDiff;

    // Throw thresholds
    const throwThreshold = 120; // 120px drag
    const velocityThreshold = 0.8; // px per ms

    // Is it a quick click? Small drag and short time
    const isClick =
      timeDiff < 300 &&
      Math.abs(currentX.current) < 10 &&
      Math.abs(currentY.current) < 10;

    const isThrown =
      Math.abs(currentX.current) > throwThreshold ||
      Math.abs(velocityX) > velocityThreshold;

    if (isThrown || isClick) {
      const direction = isClick || currentX.current > 0 ? 1 : -1;

      // Swing card out to the side (deck shuffle motion)
      gsap.to(target, {
        x: window.innerWidth > 600 ? 400 * direction : 250 * direction,
        y: currentY.current + 30,
        rotation: direction * 25,
        scale: 0.9,
        duration: 0.25,
        ease: "power2.out",
        onComplete: () => {
          gsap.set(target, { zIndex: 0 });
          setCurrentIndex((prev) => (prev + 1) % achievements.length);
        },
      });
    } else {
      // Snap it back with a spring
      gsap.to(target, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.55,
        ease: "elastic.out(1, 0.6)",
        onComplete: startAutoPlay, // Resume autoplay if they aborted drag
      });
    }
  };

  useGSAP(
    () => {
      // Navbar color transition
      const navbar = document.getElementById("navbar-ref");
      if (navbar) {
        const navTl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 0%",
            toggleActions: "play none none reverse",
          },
        });
        navTl.to(navbar, {
          "--nav-color-rgb": "var(--achivements-color-rgb)",
        });
      }

      // Initial Scroll Animations
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        gsap.set(
          [
            `.${styles.heading}`,
            `.${styles.stackWrapper}`,
            `.${styles.viewAllBtn}`,
          ],
          { clearProps: "all", opacity: 1 },
        );
        return;
      }

      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      masterTl.fromTo(
        `.${styles.heading}`,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
      );

      masterTl.set(`.${styles.stackWrapper}`, { opacity: 1 }, "-=0.3");

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const target = getStackOffset(i);

        // Initial state
        gsap.set(card, {
          x: 400,
          y: -100,
          rotation: 30 + i * 15,
          scale: 0.8,
          opacity: 0,
        });

        // Drop in
        masterTl.to(
          card,
          {
            x: target.x,
            y: target.y,
            rotation: target.rotate,
            scale: target.scale,
            opacity: 1,
            duration: 0.55,
            ease: "back.out(1.2)",
          },
          "-=0.25",
        );
      });

      masterTl.fromTo(
        `.${styles.viewAllBtn}`,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.1",
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
      </div>

      {/* ── Physical Throwable Stack ── */}
      <div className={styles.stackWrapper} style={{ opacity: 0 }}>
        {achievements.map((ach, achIndex) => {
          let stackPos =
            (achIndex - currentIndex + achievements.length) %
            achievements.length;
          return (
            <div
              className={`${styles.card} ${stackPos === 0 ? styles.cardGrab : ""}`}
              key={`card-${achIndex}`}
              ref={(el) => {
                cardRefs.current[achIndex] = el;
              }}
              onPointerDown={(e) => handlePointerDown(e, achIndex)}
              onPointerMove={(e) => handlePointerMove(e, achIndex)}
              onPointerUp={(e) => handlePointerUp(e, achIndex)}
              onPointerCancel={(e) => handlePointerUp(e, achIndex)}
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
                  draggable={false}
                />
              </div>

              {/* Title */}
              <h3 className={styles.cardTitle}>{ach.title}</h3>

              {/* Description */}
              <p className={styles.cardDesc}>{ach.desc}</p>

              {/* Interaction Details */}
              <div className={styles.navRow}>
                <span className={styles.counter}>
                  {achIndex + 1} / {achievements.length}
                </span>
                <span className={styles.swipeInstruction}>
                  {stackPos === 0 ? "Click or swipe to flip" : "Waiting..."}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── View All button ── */}
      <a
        href="/achievements"
        className={styles.viewAllBtn}
        style={{ opacity: 0 }}
      >
        View All Achievements
        <FiArrowUpRight
          size={20}
          style={{ rotate: "var(--deg)", transition: "rotate 0.2s ease" }}
        />
      </a>
    </section>
  );
}
