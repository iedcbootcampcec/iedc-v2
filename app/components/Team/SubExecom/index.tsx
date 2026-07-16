"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "../Team.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FiLinkedin } from "react-icons/fi";
import { subTeam as members } from "@data/data"



const DUPLICATE_COUNT = Math.max(3, Math.ceil(20 / members.length));

export default function SubExecom() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Reveal
      gsap.fromTo(
        `.${styles.cardSubExecom}`,
        { y: 80, opacity: 0, rotation: 3, scale: 0.9 },
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

      // Seamless Marquee
      const track = trackRef.current;
      let scrollTween: gsap.core.Tween | null = null;

      if (track) {
        const initLoop = () => {
          if (scrollTween) scrollTween.kill();

          const trackGroups = track.querySelectorAll(`.${styles.trackGroup}`);
          if (trackGroups.length > 0) {
            const firstGroup = trackGroups[0] as HTMLElement;
            const groupWidth = firstGroup.offsetWidth;

            gsap.set(track, { x: 0 });

            scrollTween = gsap.to(track, {
              x: -groupWidth,
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
    { scope: sectionRef },
  );

  return (
    <div ref={sectionRef}>
      <h3 className={styles.subHeading}>Sub Execom</h3>
      <div className={styles.trackWrapper}>
        <div ref={trackRef} className={styles.track}>
          {[...Array(DUPLICATE_COUNT)].map((_, groupIndex) => (
            <div className={styles.trackGroup} key={groupIndex}>
              {members.map((member, i) => (
                <div
                  className={`${styles.card} ${styles.cardSubExecom}`}
                  key={`${member.name}-${i}-${groupIndex}`}
                  style={{ opacity: 0 }}
                >
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
                    <h4 className={styles.name}>{member.name}</h4>
                    <p className={styles.designation}>{member.designation}</p>
                    <div className={styles.socials}>
                      <a
                        href={member.linkedin || "#"}
                        className={styles.socialIcon}
                        aria-label="LinkedIn"
                      >
                        <FiLinkedin />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
