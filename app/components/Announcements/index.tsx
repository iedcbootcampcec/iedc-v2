"use client";

import { useRef } from "react";
import Link from "next/link";
import styles from "./Announcements.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";

import { events } from "@data/events";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function Announcements() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        gsap.set([`.${styles.reveal}`], { clearProps: "all", opacity: 1 });
        return;
      }

      gsap.fromTo(
        `.${styles.reveal}`,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
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
            {events.slice(0, 5).map((event) => {
              const href = ("link" in event && typeof event.link === "string") ? event.link : "/#events";
              return (
                <Link
                  href={href}
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
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
