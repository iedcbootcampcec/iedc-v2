"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "../Team.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FiLinkedin } from "react-icons/fi";

const members = [
  { name: "Alex Morgan", designation: "Faculty Advisor", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Jordan Lee", designation: "Co-Advisor", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Taylor Smith", designation: "Technical Lead", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Casey Jones", designation: "Operations", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400" },
];

export default function Faculty() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Header Reveal
      gsap.fromTo(
        `.${styles.headingBlock}`,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: `.${styles.headingBlock}`, start: "top 85%", toggleActions: "play none none reverse" } },
      );

      gsap.fromTo(
        `.${styles.tagline}`,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "power2.out", scrollTrigger: { trigger: `.${styles.headingBlock}`, start: "top 85%", toggleActions: "play none none reverse" } },
      );

      gsap.fromTo(
        `.${styles.divider}`,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power2.inOut", scrollTrigger: { trigger: `.${styles.divider}`, start: "top 90%", toggleActions: "play none none reverse" } },
      );

      // Cards Reveal
      gsap.fromTo(
        `.${styles.cardFaculty}`,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Ping-pong Alternating (Start from Right/end, move to 0)
      const track = trackRef.current;
      const wrapper = track?.parentElement;
      let pingPongTween: gsap.core.Tween | null = null;

      if (track && wrapper) {
        const initPingPong = () => {
          if (pingPongTween) pingPongTween.kill();
          
          const distance = track.scrollWidth - wrapper.clientWidth;

          if (distance > 0) {
            gsap.set(track, { x: -distance }); 

            const duration = Math.max(distance / 50, 5); 
            pingPongTween = gsap.to(track, {
              x: 0,
              duration,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true, 
            });

            wrapper.addEventListener("mouseenter", () => pingPongTween?.pause());
            wrapper.addEventListener("mouseleave", () => pingPongTween?.play());
          } else {
            gsap.set(track, { x: 0 });
          }
        };

        setTimeout(initPingPong, 100);
        window.addEventListener("resize", initPingPong);

        return () => {
          if (pingPongTween) pingPongTween.kill();
          window.removeEventListener("resize", initPingPong);
        };
      }
    },
    { scope: sectionRef },
  );

  return (
    <section className={styles.team} ref={sectionRef}>
      <div className={styles.bgOverlay} />

      <span className={`${styles.cornerCross} ${styles.topLeft}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.topRight}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.bottomLeft}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.bottomRight}`}>+</span>

      <div className={styles.header}>
        <div className={styles.headingBlock} style={{ opacity: 0 }}>
          <h2 className={styles.heading}>
            <span className={styles.the}>THE</span>
            <span className={styles.crew}>CREW</span>
          </h2>
        </div>

        <div className={styles.tagline} style={{ opacity: 0 }}>
          <p>builders / dreamers /<br />chaos managers.</p>
        </div>
      </div>

      <div className={styles.divider} />

      <h3 className={styles.subHeading} style={{ marginBottom: '1.5rem' }}>Faculty</h3>
      <div className={styles.trackWrapper}>
        <div ref={trackRef} className={styles.track}>
          {members.map((member, i) => (
            <div className={`${styles.card} ${styles.cardFaculty}`} key={`${member.name}-${i}`} style={{ opacity: 0 }}>
              <div className={styles.photo}>
                <Image src={member.image} alt={member.name} fill sizes="260px" className={styles.photoImg} />
              </div>
              <div className={styles.info}>
                <h4 className={styles.name}>{member.name}</h4>
                <p className={styles.designation}>{member.designation}</p>
                <div className={styles.socials}>
                  <a href="#" className={styles.socialIcon} aria-label="LinkedIn"><FiLinkedin /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
