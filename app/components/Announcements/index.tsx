"use client";

import { useRef } from "react";
import Image from "next/image";
import styles from "./Announcements.module.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const events = [
  {
    id: 1,
    name: "Startup Bootcamp",
    image: "/announcements/events/startup-bootcamp.png",
    color: "#e8a020",
  },
  {
    id: 2,
    name: "Ideathon 2026",
    image: "/announcements/events/ideathon.png",
    color: "#c0392b",
  },
  {
    id: 3,
    name: "Product Launch",
    image: "/announcements/events/product-launch.png",
    color: "#2c3e50",
  },
  {
    id: 4,
    name: "Pitch Night",
    image: "/announcements/events/pitch-night.png",
    color: "#8e44ad",
  },
  {
    id: 5,
    name: "Design Sprint",
    image: "/announcements/events/design-sprint.png",
    color: "#16a085",
  },
  {
    id: 6,
    name: "Hack & Build",
    image: "/announcements/events/hack-and-build.png",
    color: "#d35400",
  },
];

/* A few fixed rotations so sticky notes look hand-placed */
const rotations = [-4, 2.5, -1.8, 3.2, -2.5, 1.5];
const tapeRotations = [3, -5, 7, -3, 4, -6];
const tapes = ["/announcements/tape-1.png", "/announcements/tape-2.png"];

export default function Announcements() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      /* ── Section heading ── */
      gsap.fromTo(
        `.${styles.heading}`,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: `.${styles.heading}`,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      );

      /* ── Sticky notes staggered pop-in ── */
      gsap.fromTo(
        `.${styles.stickyNote}`,
        { scale: 0.7, opacity: 0, y: 60 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: `.${styles.board}`,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section className={styles.container} id="events" ref={sectionRef}>
      {/* ── Heading ── */}
      <div className={styles.heading} style={{ opacity: 0 }}>
        <h2>Announcements</h2>
      </div>

      {/* ── Sticky Notes Board ── */}
      <div className={styles.board}>
        {events.map((event, i) => (
          <div
            key={event.id}
            className={styles.stickyNote}
            style={
              {
                "--rotation": `${rotations[i % rotations.length]}deg`,
                opacity: 0,
              } as React.CSSProperties
            }
          >
            {/* Tape strip image */}
            <div
              className={styles.tape}
              style={{
                transform: `translateX(-50%) rotate(${tapeRotations[i % tapeRotations.length]}deg)`,
              }}
            >
              <Image
                src={tapes[i % tapes.length]}
                style={{
                  transform: `rotate(${tapeRotations[i % tapeRotations.length]}deg)`,
                }}
                alt=""
                width={90}
                height={30}
                className={styles.tapeImage}
              />
            </div>

            {/* Event image area */}
            <div
              className={styles.imageWrap}
              style={{ backgroundColor: event.color }}
            >
              <Image
                src={event.image}
                alt={event.name}
                fill
                sizes="(max-width: 600px) 45vw, 220px"
                className={styles.eventImage}
                onError={(e) => {
                  /* Hide broken image, keep the colored bg */
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Event name */}
            <p className={styles.eventName}>{event.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
