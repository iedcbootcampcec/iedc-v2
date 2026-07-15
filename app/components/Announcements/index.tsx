"use client";

import { useRef } from "react";
import styles from "./Announcements.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const events = [
  {
    id: 1,
    title: "Ideathon",
    category: "Hackathon",
    when: "Aug 01",
    time: "9:30 AM",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "CodeLess 2.0",
    category: "Workshop",
    when: "Jun 15",
    time: "10:00 AM",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Project Expo 2.0",
    category: "Exhibition",
    when: "Mar 24",
    time: "9:30 AM",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Rithu",
    category: "Summit",
    when: "Mar 03",
    time: "10:00 AM",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "Tinkherhack",
    category: "Women Hackathon",
    when: "Feb 27",
    time: "9:30 AM",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Announcements() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set(`.${styles.reveal}`, { clearProps: "all", opacity: 1 });
        return;
      }

      gsap.fromTo(
        `.${styles.reveal}`,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section className={styles.container} id="events" ref={containerRef}>
      <div className={styles.inner}>
        
        <div className={styles.leftCol}>
          <h2 className={`${styles.heading} ${styles.reveal}`} style={{ opacity: 0 }}>
            NEXT<br />
            <span className={styles.headingAccent}>UP</span><br />
            EVENTS
          </h2>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.listContainer}>
            {events.slice(0, 5).map((event) => (
              <a
                href="#events"
                key={event.id}
                className={`${styles.listItem} ${styles.reveal}`}
                style={
                  {
                    opacity: 0,
                    "--hover-bg": `url('${event.image}')`,
                  } as React.CSSProperties
                }
              >
                <div className={styles.listDate}>{event.when}</div>
                <div className={styles.listMid}>
                  <h3 className={styles.listTitle}>{event.title}</h3>
                  <span className={styles.listCategory}>{event.category}</span>
                </div>
                <div className={styles.listIcon}>
                  <FiArrowUpRight />
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
