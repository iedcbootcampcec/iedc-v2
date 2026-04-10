"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "../Team.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FiLinkedin, FiGithub } from "react-icons/fi";

const members = [
  { name: "Jessie Parker", designation: "Frontend Dev", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Robin Banks", designation: "Backend Dev", image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Drew Carey", designation: "UI/UX Designer", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Skyler White", designation: "Event Manager", image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=400&h=400" },
  { name: "Kendall Roy", designation: "Social Media", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=400" },
];

export default function SubExecom() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Reveal
      gsap.fromTo(
        `.${styles.cardSubExecom}`,
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

      // Ping-pong (Start from left 0, move to -distance)
      const track = trackRef.current;
      const wrapper = track?.parentElement;
      let pingPongTween: gsap.core.Tween | null = null;

      if (track && wrapper) {
        const initPingPong = () => {
          if (pingPongTween) pingPongTween.kill();
          gsap.set(track, { x: 0 }); 
          
          const distance = track.scrollWidth - wrapper.clientWidth;

          if (distance > 0) {
            const duration = Math.max(distance / 50, 5); 
            pingPongTween = gsap.to(track, {
              x: -distance,
              duration,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });

            wrapper.addEventListener("mouseenter", () => pingPongTween?.pause());
            wrapper.addEventListener("mouseleave", () => pingPongTween?.play());
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

      <h3 className={styles.subHeading} style={{ marginBottom: '1.5rem' }}>Sub Execom</h3>
      <div className={styles.trackWrapper}>
        <div ref={trackRef} className={styles.track}>
          {members.map((member, i) => (
            <div className={`${styles.card} ${styles.cardSubExecom}`} key={`${member.name}-${i}`} style={{ opacity: 0 }}>
              <div className={styles.photo}>
                <Image src={member.image} alt={member.name} fill sizes="260px" className={styles.photoImg} />
              </div>
              <div className={styles.info}>
                <h4 className={styles.name}>{member.name}</h4>
                <p className={styles.designation}>{member.designation}</p>
                <div className={styles.socials}>
                  <a href="#" className={styles.socialIcon} aria-label="LinkedIn"><FiLinkedin /></a>
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
