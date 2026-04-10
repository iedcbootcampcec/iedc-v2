"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./Team.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiTwitter, FiLinkedin, FiGithub } from "react-icons/fi";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const teamMembers = [
  {
    name: "Alex Morgan",
    designation: "Chairperson",
    image: "/team/test.png",
  },
  {
    name: "Jordan Lee",
    designation: "Vice Chairperson",
    image: "/team/test.png",
  },
  {
    name: "Sam Rivera",
    designation: "Tech Lead",
    image: "/team/test.png",
  },
  {
    name: "Casey Kim",
    designation: "Design Lead",
    image: "/team/test.png",
  },
  {
    name: "Taylor Chen",
    designation: "Event Coordinator",
    image: "/team/test.png",
  },
  {
    name: "Riley Patel",
    designation: "Marketing Lead",
    image: "/team/test.png",
  },
  {
    name: "Morgan Blake",
    designation: "Content Lead",
    image: "/team/test.png",
  },
  {
    name: "Avery Quinn",
    designation: "Operations Lead",
    image: "/team/test.png",
  },
];

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Reveal Animations
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

      gsap.fromTo(
        `.${styles.card}`,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.trackWrapper}`,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // 2. Ping-pong auto scroll animation
      const track = trackRef.current;
      const wrapper = track?.parentElement;
      let pingPongTween: gsap.core.Tween | null = null;

      if (track && wrapper) {
        const initPingPong = () => {
          if (pingPongTween) pingPongTween.kill();
          gsap.set(track, { x: 0 }); // reset position
          
          const distance = track.scrollWidth - wrapper.clientWidth;

          if (distance > 0) {
            // Speed factor: approx 50px per second, meaning duration = distance / 50
            const duration = Math.max(distance / 50, 5); 

            pingPongTween = gsap.to(track, {
              x: -distance,
              duration,
              ease: "sine.inOut",   // smooth ease at the ends
              repeat: -1,           // infinite loop
              yoyo: true,           // alternate direction
            });

            // Pause on hover
            wrapper.addEventListener("mouseenter", () => pingPongTween?.pause());
            wrapper.addEventListener("mouseleave", () => pingPongTween?.play());
          }
        };

        // Delay slighty to ensure layout calculation is correct
        setTimeout(initPingPong, 100);

        window.addEventListener("resize", initPingPong);

        return () => {
          if (pingPongTween) pingPongTween.kill();
          window.removeEventListener("resize", initPingPong);
        };
      }
    },
    { scope: sectionRef }
  );

  return (
    <section className={styles.team} id="team" ref={sectionRef}>
      <div className={styles.bgOverlay} />

      {/* Corner crosses */}
      <span className={`${styles.cornerCross} ${styles.topLeft}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.topRight}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.bottomLeft}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.bottomRight}`}>+</span>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headingBlock} style={{ opacity: 0 }}>
          <h2 className={styles.heading}>
            <span className={styles.the}>THE</span>
            <span className={styles.crew}>CREW</span>
          </h2>
        </div>

        <div className={styles.tagline} style={{ opacity: 0 }}>
          <p>
            builders / dreamers /
            <br />
            chaos managers.
          </p>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className={styles.divider} />

      {/* ── Ping-Pong Carousel Track ── */}
      <div className={styles.trackWrapper}>
        <div ref={trackRef} className={styles.track}>
          {teamMembers.map((member, i) => (
            <div className={styles.card} key={`${member.name}-${i}`} style={{ opacity: 0 }}>
              <div className={styles.photo}>
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="260px"
                  className={styles.photoImg}
                />
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{member.name}</h3>
                <p className={styles.designation}>{member.designation}</p>
                <div className={styles.socials}>
                  <a href="#" className={styles.socialIcon} aria-label="LinkedIn"><FiLinkedin /></a>
                  <a href="#" className={styles.socialIcon} aria-label="Twitter"><FiTwitter /></a>
                  <a href="#" className={styles.socialIcon} aria-label="GitHub"><FiGithub /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
