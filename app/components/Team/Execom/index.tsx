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

const DUPLICATE_COUNT = Math.max(3, Math.ceil(20 / members.length));

export default function Execom() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Reveal
      gsap.fromTo(
        `.${styles.cardExecom}`,
        { y: 80, opacity: 0, rotation: -3, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          rotation: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Seamless Marquee right-to-left
      const track = trackRef.current;
      let scrollTween: gsap.core.Tween | null = null;

      if (track) {
        const initLoop = () => {
          if (scrollTween) scrollTween.kill();
          
          const trackGroups = track.querySelectorAll(`.${styles.trackGroup}`);
          if (trackGroups.length > 0) {
            const firstGroup = trackGroups[0] as HTMLElement;
            const groupWidth = firstGroup.offsetWidth;

            gsap.set(track, { x: -groupWidth });

            scrollTween = gsap.to(track, {
              x: 0,
              ease: "none",
              duration: groupWidth / 60,
              repeat: -1,
            });

            track.addEventListener("mouseenter", () => scrollTween?.pause());
            track.addEventListener("mouseleave", () => scrollTween?.play());
          }
        };

        setTimeout(initLoop, 200);
        window.addEventListener("resize", initLoop);

        return () => {
          if (scrollTween) scrollTween.kill();
          window.removeEventListener("resize", initLoop);
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

      <h3 className={`${styles.subHeading} ${styles.centerTextOnDesktop}`} style={{ marginBottom: '1.5rem' }}>Execom</h3>
      <div className={styles.trackWrapper}>
        <div ref={trackRef} className={styles.track}>
          {[...Array(DUPLICATE_COUNT)].map((_, groupIndex) => (
            <div className={styles.trackGroup} key={groupIndex}>
              {members.map((member, i) => (
                <div className={`${styles.card} ${styles.cardExecom}`} key={`${member.name}-${i}-${groupIndex}`} style={{ opacity: 0 }}>
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
          ))}
        </div>
      </div>
    </section>
  );
}
