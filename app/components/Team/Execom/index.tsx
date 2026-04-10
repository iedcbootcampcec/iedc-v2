"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "../Team.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FiTwitter, FiLinkedin } from "react-icons/fi";

const members = [
  { name: "Devin Roe", designation: "CEO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Morgan Blake", designation: "CTO", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Avery Quinn", designation: "COO", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Riley Patel", designation: "CMO", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Jamie Fox", designation: "CFO", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=400&h=400" },
];

export default function Execom() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Reveal
      gsap.fromTo(
        `.${styles.cardExecom}`,
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
    { scope: sectionRef }
  );

  return (
    <section className={styles.team} ref={sectionRef}>
      <div className={styles.bgOverlay} />

      <span className={`${styles.cornerCross} ${styles.topLeft}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.topRight}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.bottomLeft}`}>+</span>
      <span className={`${styles.cornerCross} ${styles.bottomRight}`}>+</span>

      <h3 className={styles.subHeading} style={{ marginBottom: '1.5rem' }}>Execom</h3>
      <div className={styles.trackWrapper}>
        <div ref={trackRef} className={styles.track}>
          {members.map((member, i) => (
            <div className={`${styles.card} ${styles.cardExecom}`} key={`${member.name}-${i}`} style={{ opacity: 0 }}>
              <div className={styles.photo}>
                <Image src={member.image} alt={member.name} fill sizes="260px" className={styles.photoImg} />
              </div>
              <div className={styles.info}>
                <h4 className={styles.name}>{member.name}</h4>
                <p className={styles.designation}>{member.designation}</p>
                <div className={styles.socials}>
                  <a href="#" className={styles.socialIcon} aria-label="LinkedIn"><FiLinkedin /></a>
                  <a href="#" className={styles.socialIcon} aria-label="Twitter"><FiTwitter /></a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
