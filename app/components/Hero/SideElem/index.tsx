"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SideElem.module.css";

/* =========================================================================
   TUNING VARIABLES
   ========================================================================= */
export const ANIMATION_CONFIG = {
  duration: 8.0, // Loop length in seconds
  repeatDelay: 0.4,
  mustard: "var(--color-accent, #e8a020)",
  ink: "var(--color-primary, #1a1a1a)",
  paper: "#f8f4eb",
};

/* =========================================================================
   GEOMETRY CONSTANTS (ViewBox 300x300, Center: 150, 150)
   Bulb & Gear use 25 identical angle-paired vertices starting at (150, 92)
   clockwise so that the GSAP MorphSVG rotational morph stays clean and un-twisted.
   ========================================================================= */

// Bulb glass envelope (25 points, clockwise, starts at top center 150, 92)
const BULB_PATH =
  "M 150 92 " +
  "L 158.3 92.7 " +
  "L 168.0 95.5 " +
  "L 179.6 102.2 " +
  "L 186.8 109.1 " +
  "L 195.1 123.6 " +
  "L 197.5 133.3 " +
  "L 197.5 146.7 " +
  "L 195.1 156.4 " +
  "L 184.0 170.0 " +
  "L 175.0 178.5 " +
  "L 167.0 187.0 " +
  "L 159.0 194.0 " +
  "L 150.0 196.0 " +
  "L 141.0 194.0 " +
  "L 133.0 187.0 " +
  "L 125.0 178.5 " +
  "L 116.0 170.0 " +
  "L 104.9 156.4 " +
  "L 102.5 146.7 " +
  "L 102.5 133.3 " +
  "L 104.9 123.6 " +
  "L 113.2 109.1 " +
  "L 120.4 102.2 " +
  "L 132.0 95.5 " +
  "L 141.7 92.7 Z";

// Bulb shadow offset (+6, +6)
const BULB_SHADOW_PATH =
  "M 156 98 " +
  "L 164.3 98.7 " +
  "L 174.0 101.5 " +
  "L 185.6 108.2 " +
  "L 192.8 115.1 " +
  "L 201.1 129.6 " +
  "L 203.5 139.3 " +
  "L 203.5 152.7 " +
  "L 201.1 162.4 " +
  "L 190.0 176.0 " +
  "L 181.0 184.5 " +
  "L 173.0 193.0 " +
  "L 165.0 200.0 " +
  "L 156.0 202.0 " +
  "L 147.0 200.0 " +
  "L 139.0 193.0 " +
  "L 131.0 184.5 " +
  "L 122.0 176.0 " +
  "L 110.9 162.4 " +
  "L 108.5 152.7 " +
  "L 108.5 139.3 " +
  "L 110.9 129.6 " +
  "L 119.2 115.1 " +
  "L 126.4 108.2 " +
  "L 138.0 101.5 " +
  "L 147.7 98.7 Z";

// 6-tooth gear outer silhouette (25 points, clockwise, starts at top center 150, 92)
const GEAR_PATH =
  "M 150 92 " +
  "L 160.1 92.9 " +
  "L 165.7 111.1 " +
  "L 175.9 116.9 " +
  "L 194.4 112.7 " +
  "L 204.5 130.2 " +
  "L 191.6 144.2 " +
  "L 191.6 155.8 " +
  "L 204.5 169.8 " +
  "L 194.4 187.3 " +
  "L 175.9 183.1 " +
  "L 165.7 188.9 " +
  "L 160.1 207.1 " +
  "L 150.0 207.1 " +
  "L 139.9 207.1 " +
  "L 134.3 188.9 " +
  "L 124.1 183.1 " +
  "L 105.6 187.3 " +
  "L 95.5 169.8 " +
  "L 108.4 155.8 " +
  "L 108.4 144.2 " +
  "L 95.5 130.2 " +
  "L 105.6 112.7 " +
  "L 124.1 116.9 " +
  "L 134.3 111.1 " +
  "L 139.9 92.9 Z";

// Gear shadow offset (+6, +6)
const GEAR_SHADOW_PATH =
  "M 156 98 " +
  "L 166.1 98.9 " +
  "L 171.7 117.1 " +
  "L 181.9 122.9 " +
  "L 200.4 118.7 " +
  "L 210.5 136.2 " +
  "L 197.6 150.2 " +
  "L 197.6 161.8 " +
  "L 210.5 175.8 " +
  "L 200.4 193.3 " +
  "L 181.9 189.1 " +
  "L 171.7 194.9 " +
  "L 166.1 213.1 " +
  "L 156.0 213.1 " +
  "L 145.9 213.1 " +
  "L 140.3 194.9 " +
  "L 130.1 189.1 " +
  "L 111.6 193.3 " +
  "L 101.5 175.8 " +
  "L 114.4 161.8 " +
  "L 114.4 150.2 " +
  "L 101.5 136.2 " +
  "L 111.6 118.7 " +
  "L 130.1 122.9 " +
  "L 140.3 117.1 " +
  "L 145.9 98.9 Z";

// Small meshing gear (#gear2) centered exactly at (216, 92)
const GEAR2_PATH =
  "M 216 64 " +
  "L 223 65 " +
  "L 229 77 " +
  "L 232 79 " +
  "L 244 85 " +
  "L 244 99 " +
  "L 232 105 " +
  "L 229 107 " +
  "L 223 119 " +
  "L 216 120 " +
  "L 209 119 " +
  "L 203 107 " +
  "L 200 105 " +
  "L 188 99 " +
  "L 188 85 " +
  "L 200 79 " +
  "L 203 77 " +
  "L 209 65 Z";

// Small gear shadow offset (+6, +6), centered at (222, 98)
const GEAR2_SHADOW_PATH =
  "M 222 70 " +
  "L 229 71 " +
  "L 235 83 " +
  "L 238 85 " +
  "L 250 91 " +
  "L 250 105 " +
  "L 238 111 " +
  "L 235 113 " +
  "L 229 125 " +
  "L 222 126 " +
  "L 215 125 " +
  "L 209 113 " +
  "L 206 111 " +
  "L 194 105 " +
  "L 194 91 " +
  "L 206 85 " +
  "L 209 83 " +
  "L 215 71 Z";

export default function SideElem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGsapReady, setIsGsapReady] = useState(false);

  useEffect(() => {
    // 1. Accessibility Check: prefers-reduced-motion
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      // Leave static final frame rendered; do not build timeline
      return;
    }

    let isCancelled = false;
    let ctx: any = null;
    let observer: IntersectionObserver | null = null;
    let masterTimeline: any = null;

    // 2. Dynamic lazy-load of GSAP & MorphSVGPlugin after first paint
    const initAnimation = async () => {
      try {
        const [{ gsap }, morphModule] = await Promise.all([
          import("gsap"),
          import("gsap/MorphSVGPlugin"),
        ]);

        if (isCancelled || !containerRef.current) return;

        const MorphSVGPlugin =
          morphModule.MorphSVGPlugin || morphModule.default;
        gsap.registerPlugin(MorphSVGPlugin);

        setIsGsapReady(true);

        ctx = gsap.context(() => {
          const glassEl = containerRef.current?.querySelector("#glass") as SVGPathElement;
          const glassShadowEl = containerRef.current?.querySelector("#glass-shadow") as SVGPathElement;
          const filamentEl = containerRef.current?.querySelector("#filament") as SVGPathElement;
          const baseEl = containerRef.current?.querySelector("#base") as SVGGElement;
          const raysEl = containerRef.current?.querySelector("#rays") as SVGGElement;
          const glowEl = containerRef.current?.querySelector("#glow") as SVGGElement;
          const flashRingEl = containerRef.current?.querySelector("#flash-ring") as SVGPathElement;
          const gearHoleEl = containerRef.current?.querySelector("#gear-hole") as SVGPathElement;
          const gear2El = containerRef.current?.querySelector("#gear2") as SVGPathElement;
          const gear2ShadowEl = containerRef.current?.querySelector("#gear2-shadow") as SVGPathElement;
          const gear2HoleEl = containerRef.current?.querySelector("#gear2-hole") as SVGCircleElement;
          const burstGroupEl = containerRef.current?.querySelector("#burst-group") as SVGGElement;
          const rocketGroupEl = containerRef.current?.querySelector("#rocket") as SVGGElement;
          const flameEl = containerRef.current?.querySelector("#flame") as SVGPathElement;
          const shippedStickerEl = containerRef.current?.querySelector("#shipped-sticker") as SVGGElement;

          if (!glassEl || !glassShadowEl) return;

          // Compute path stroke lengths for organic draw-in
          const glassLen = glassEl.getTotalLength() || 400;
          const filLen = filamentEl?.getTotalLength() || 120;
          const basePaths = baseEl?.querySelectorAll("path") || [];

          // Configure path elements for SVG stroke-dash draw
          gsap.set(glassEl, {
            strokeDasharray: glassLen,
            strokeDashoffset: glassLen,
            fillOpacity: 0,
            rotation: 0,
            svgOrigin: "150 150",
          });
          gsap.set(glassShadowEl, {
            opacity: 0,
            rotation: 0,
            svgOrigin: "156 156",
          });
          if (filamentEl) {
            gsap.set(filamentEl, {
              strokeDasharray: filLen,
              strokeDashoffset: filLen,
              opacity: 1,
            });
          }
          basePaths.forEach((p) => {
            const pLen = (p as SVGPathElement).getTotalLength() || 50;
            gsap.set(p, { strokeDasharray: pLen, strokeDashoffset: pLen });
          });
          if (raysEl) gsap.set(raysEl.children, { scale: 0, opacity: 0, svgOrigin: "150 142" });
          if (glowEl) gsap.set(glowEl, { scale: 0.85, opacity: 0, svgOrigin: "150 142" });
          if (flashRingEl) gsap.set(flashRingEl, { scale: 0.1, opacity: 0, svgOrigin: "150 150" });
          if (gearHoleEl) gsap.set(gearHoleEl, { scale: 0, opacity: 0, svgOrigin: "150 150" });
          if (gear2El) gsap.set(gear2El, { scale: 0, opacity: 0, svgOrigin: "216 92" });
          if (gear2ShadowEl) gsap.set(gear2ShadowEl, { scale: 0, opacity: 0, svgOrigin: "222 98" });
          if (gear2HoleEl) gsap.set(gear2HoleEl, { scale: 0, opacity: 0, svgOrigin: "216 92" });
          if (burstGroupEl) gsap.set(burstGroupEl, { scale: 0.2, opacity: 0, svgOrigin: "150 150" });
          if (rocketGroupEl) gsap.set(rocketGroupEl, { scale: 0, opacity: 0, x: 0, y: 0, rotation: 0, svgOrigin: "150 150" });
          if (flameEl) gsap.set(flameEl, { opacity: 0, scaleY: 1, svgOrigin: "150 192" });
          if (shippedStickerEl) gsap.set(shippedStickerEl, { scale: 0, opacity: 0, rotation: 0, svgOrigin: "147 147" });

          // -----------------------------------------------------------------
          // TIMELINE: ~8s Total Loop
          // -----------------------------------------------------------------
          const tl = gsap.timeline({
            repeat: -1,
            repeatDelay: ANIMATION_CONFIG.repeatDelay,
            defaults: { ease: "power2.out" },
          });

          masterTimeline = tl;

          /* --- STAGE 1: BULB (0s to 2.6s) --- */
          // Draw glass outline with stroke-dashoffset
          tl.to(glassEl, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, 0);
          tl.to(glassShadowEl, { opacity: 1, duration: 0.7, ease: "power2.out" }, 0.4);

          // Draw base and filament
          if (filamentEl) {
            tl.to(filamentEl, { strokeDashoffset: 0, duration: 0.65, ease: "power2.out" }, 0.75);
          }
          if (basePaths.length > 0) {
            tl.to(basePaths, { strokeDashoffset: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }, 0.85);
          }

          // Fill mustard
          tl.to(glassEl, { fillOpacity: 1, duration: 0.55, ease: "power1.out" }, 1.3);

          // Glow pulses 0.9 -> 1.15 -> 1
          if (glowEl) {
            tl.to(glowEl, { opacity: 0.85, scale: 1.15, svgOrigin: "150 142", duration: 0.55, ease: "power2.out" }, 1.35);
            tl.to(glowEl, { scale: 1.0, svgOrigin: "150 142", duration: 0.45, ease: "power1.inOut" }, 1.9);
          }

          // Ray dashes pop in with 0.05s stagger
          if (raysEl) {
            tl.to(
              raysEl.children,
              { scale: 1, opacity: 1, svgOrigin: "150 142", duration: 0.35, stagger: 0.05, ease: "back.out(2)" },
              1.45,
            );
          }

          /* --- STAGE 2: MORPH (2.6s to 3.6s) --- */
          // Fade out bulb-only parts (0.3s)
          tl.to([filamentEl, baseEl, raysEl, glowEl], { opacity: 0, duration: 0.3, ease: "power2.in" }, 2.6);

          // True MorphSVG: #glass -> #gear and #glass-shadow -> #gear-shadow
          tl.to(
            glassEl,
            {
              morphSVG: { shape: "#gear", type: "rotational", shapeIndex: "auto" },
              duration: 0.9,
              ease: "power2.inOut",
            },
            2.6,
          );
          tl.to(
            glassShadowEl,
            {
              morphSVG: { shape: "#gear-shadow", type: "rotational", shapeIndex: "auto" },
              duration: 0.9,
              ease: "power2.inOut",
            },
            2.6,
          );

          // Scale pulse during morph (1 -> 1.12 -> 1) centered at (150, 150) and (156, 156)
          tl.to(glassEl, { scale: 1.12, svgOrigin: "150 150", duration: 0.45, ease: "power1.out" }, 2.6);
          tl.to(glassShadowEl, { scale: 1.12, svgOrigin: "156 156", duration: 0.45, ease: "power1.out" }, 2.6);
          tl.to(glassEl, { scale: 1.0, svgOrigin: "150 150", duration: 0.45, ease: "power1.in" }, 3.05);
          tl.to(glassShadowEl, { scale: 1.0, svgOrigin: "156 156", duration: 0.45, ease: "power1.in" }, 3.05);

          // Mustard flash ring expanding from center
          if (flashRingEl) {
            tl.fromTo(
              flashRingEl,
              { scale: 0.15, svgOrigin: "150 150", opacity: 0.95, strokeWidth: 8 },
              { scale: 1.6, svgOrigin: "150 150", opacity: 0, strokeWidth: 1, duration: 0.65, ease: "power2.out" },
              2.75,
            );
          }

          // Center axle hole appears at (150, 150)
          if (gearHoleEl) {
            tl.to(gearHoleEl, { scale: 1, svgOrigin: "150 150", opacity: 1, duration: 0.4, ease: "back.out(1.7)" }, 3.1);
          }

          /* --- STAGE 3: GEARS (3.6s to 5.4s) --- */
          // Main morphed gear rotates continuously (360deg, ease "none") exactly around its center (150, 150)
          tl.to(glassEl, { rotation: "+=360", svgOrigin: "150 150", duration: 1.8, ease: "none" }, 3.6);
          // Hard shadow rotates on its own center (156, 156) so it never drifts from +6, +6!
          tl.to(glassShadowEl, { rotation: "+=360", svgOrigin: "156 156", duration: 1.8, ease: "none" }, 3.6);
          if (gearHoleEl) {
            tl.to(gearHoleEl, { rotation: "+=360", svgOrigin: "150 150", duration: 1.8, ease: "none" }, 3.6);
          }

          // Meshing gear #gear2 scales in at upper right and rotates counter-clockwise around (216, 92)
          if (gear2El) {
            tl.to([gear2El, gear2HoleEl], { scale: 1, opacity: 1, svgOrigin: "216 92", duration: 0.4, ease: "back.out(1.8)" }, 3.6);
            tl.to(gear2ShadowEl, { scale: 1, opacity: 1, svgOrigin: "222 98", duration: 0.4, ease: "back.out(1.8)" }, 3.6);

            tl.to([gear2El, gear2HoleEl], { rotation: "-=540", svgOrigin: "216 92", duration: 1.8, ease: "none" }, 3.6);
            tl.to(gear2ShadowEl, { rotation: "-=540", svgOrigin: "222 98", duration: 1.8, ease: "none" }, 3.6);
          }

          /* --- STAGE 4: TO ROCKET (5.2s to 6.0s) --- */
          // Gears shrink and fade with energetic comic dash burst
          tl.to(
            glassEl,
            { scale: 0, opacity: 0, svgOrigin: "150 150", duration: 0.35, ease: "back.in(1.6)" },
            5.2,
          );
          tl.to(
            glassShadowEl,
            { scale: 0, opacity: 0, svgOrigin: "156 156", duration: 0.35, ease: "back.in(1.6)" },
            5.2,
          );
          if (gearHoleEl) {
            tl.to(gearHoleEl, { scale: 0, opacity: 0, svgOrigin: "150 150", duration: 0.35, ease: "back.in(1.6)" }, 5.2);
          }
          if (gear2El) {
            tl.to([gear2El, gear2HoleEl], { scale: 0, opacity: 0, svgOrigin: "216 92", duration: 0.35, ease: "back.in(1.6)" }, 5.2);
            tl.to(gear2ShadowEl, { scale: 0, opacity: 0, svgOrigin: "222 98", duration: 0.35, ease: "back.in(1.6)" }, 5.2);
          }

          if (burstGroupEl) {
            tl.fromTo(
              burstGroupEl,
              { scale: 0.2, svgOrigin: "150 150", opacity: 1 },
              { scale: 1.45, svgOrigin: "150 150", opacity: 0, duration: 0.32, ease: "power2.out" },
              5.35,
            );
          }

          // Rocket pops in from scale 0.3 with back.out(1.7) overshoot
          tl.fromTo(
            rocketGroupEl,
            { scale: 0.3, opacity: 0, x: 0, y: 0, rotation: 0, svgOrigin: "150 150" },
            { scale: 1.0, opacity: 1, svgOrigin: "150 150", duration: 0.45, ease: "back.out(1.7)" },
            5.45,
          );

          /* --- STAGE 5: LAUNCH (5.9s to 7.6s) --- */
          // Rocket pre-launch shake and thruster ignition (5.9s - 6.15s)
          if (flameEl) {
            tl.to(flameEl, { opacity: 1, duration: 0.08 }, 5.9);
            tl.to(flameEl, { scaleY: 1.4, svgOrigin: "150 192", duration: 0.05, repeat: 4, yoyo: true }, 5.92);
          }
          tl.to(rocketGroupEl, { x: 2, duration: 0.05, repeat: 4, yoyo: true, ease: "none" }, 5.92);

          // ROCKET BLASTS OFF FIRST! Accelerates up and right, completely exiting the frame (6.15s - 6.65s)
          tl.to(
            rocketGroupEl,
            { x: 180, y: -180, rotation: 18, duration: 0.5, ease: "power2.in" },
            6.15,
          );

          // ONLY ONCE ROCKET HAS CLEARED OUT, "SHIPPED" sticker stamps down hard into the center! (6.7s - 7.15s)
          if (shippedStickerEl) {
            tl.fromTo(
              shippedStickerEl,
              { scale: 2.3, opacity: 0, rotation: 14, svgOrigin: "147 147" },
              { scale: 1.0, opacity: 1, rotation: -6, svgOrigin: "147 147", duration: 0.42, ease: "back.out(2.0)" },
              6.7,
            );
          }

          /* --- STAGE 6: RESET (7.6s to 8.0s) --- */
          // Clean fade out after holding the "SHIPPED" stamp
          tl.to(
            [rocketGroupEl, shippedStickerEl, flameEl],
            { opacity: 0, duration: 0.35, ease: "power1.inOut" },
            7.6,
          );

          // Frame reset at end of timeline so loop restarts with NO visible jump
          tl.add(() => {
            gsap.set(glassEl, {
              morphSVG: "#bulb-shape",
              rotation: 0,
              scale: 1,
              x: 0,
              y: 0,
              svgOrigin: "150 150",
              strokeDashoffset: glassLen,
              fillOpacity: 0,
            });
            gsap.set(glassShadowEl, {
              morphSVG: "#bulb-shadow-shape",
              rotation: 0,
              scale: 1,
              x: 0,
              y: 0,
              svgOrigin: "156 156",
              opacity: 0,
            });
            if (filamentEl) gsap.set(filamentEl, { strokeDashoffset: filLen, opacity: 1 });
            basePaths.forEach((p) => {
              const pLen = (p as SVGPathElement).getTotalLength() || 50;
              gsap.set(p, { strokeDashoffset: pLen, opacity: 1 });
            });
            if (raysEl) gsap.set(raysEl.children, { scale: 0, opacity: 0 });
            if (glowEl) gsap.set(glowEl, { scale: 0.85, opacity: 0 });
            if (gearHoleEl) gsap.set(gearHoleEl, { scale: 0, opacity: 0, rotation: 0, svgOrigin: "150 150" });
            if (gear2El) gsap.set(gear2El, { scale: 0, opacity: 0, rotation: 0, svgOrigin: "216 92" });
            if (gear2ShadowEl) gsap.set(gear2ShadowEl, { scale: 0, opacity: 0, rotation: 0, svgOrigin: "222 98" });
            if (gear2HoleEl) gsap.set(gear2HoleEl, { scale: 0, opacity: 0, rotation: 0, svgOrigin: "216 92" });
            if (burstGroupEl) gsap.set(burstGroupEl, { scale: 0.2, opacity: 0 });
            if (rocketGroupEl) gsap.set(rocketGroupEl, { scale: 0, opacity: 0, x: 0, y: 0, rotation: 0, svgOrigin: "150 150" });
            if (flameEl) gsap.set(flameEl, { opacity: 0, scaleY: 1 });
            if (shippedStickerEl) gsap.set(shippedStickerEl, { scale: 0, opacity: 0, rotation: 0, svgOrigin: "147 147" });
          }, 7.98);
        }, containerRef);

        // 3. Pause when off-screen via IntersectionObserver
        if (containerRef.current) {
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!masterTimeline) return;
                if (entry.isIntersecting) {
                  masterTimeline.play();
                } else {
                  masterTimeline.pause();
                }
              });
            },
            { threshold: 0.1 },
          );
          observer.observe(containerRef.current);
        }
      } catch (err) {
        console.error("Failed to load hero animation:", err);
      }
    };

    initAnimation();

    return () => {
      isCancelled = true;
      if (observer) observer.disconnect();
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      data-gsap-ready={isGsapReady ? "true" : "false"}
    >
      <svg
        viewBox="0 0 300 300"
        className={styles.svg}
        aria-hidden="true"
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Target morph shapes in <defs> */}
          <path id="bulb-shape" d={BULB_PATH} />
          <path id="bulb-shadow-shape" d={BULB_SHADOW_PATH} />
          <path id="gear" d={GEAR_PATH} />
          <path id="gear-shadow" d={GEAR_SHADOW_PATH} />
        </defs>

        {/* -------------------------------------------------------------
            STATIC FINAL FRAME:
            Rendered immediately before GSAP loads, and kept forever if
            prefers-reduced-motion is active.
            Features: Rocket mounted on a small gear base with "SHIPPED" sticker.
            ------------------------------------------------------------- */}
        <g id="static-frame" className={styles.staticFrame}>
          {/* Small gear base */}
          <g id="static-gear-base" transform="translate(150 195) scale(0.62) translate(-150 -150)">
            <path
              d={GEAR_SHADOW_PATH}
              fill="var(--color-primary, #1a1a1a)"
            />
            <path
              d={GEAR_PATH}
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx="150"
              cy="150"
              r="14"
              fill="#f8f4eb"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5"
            />
          </g>

          {/* Rocket standing proud */}
          <g id="static-rocket" transform="translate(0 -10)">
            {/* Hard shadow */}
            <g transform="translate(6 6)">
              <path
                d="M 134 165 C 112 176 108 200 114 204 C 124 204 135 190 135 182 Z"
                fill="var(--color-primary, #1a1a1a)"
              />
              <path
                d="M 166 165 C 188 176 192 200 186 204 C 176 204 165 190 165 182 Z"
                fill="var(--color-primary, #1a1a1a)"
              />
              <path
                d="M 150 90 C 144 115 132 142 132 180 L 140 182 L 137 192 L 163 192 L 160 182 L 168 180 C 168 142 156 115 150 90 Z"
                fill="var(--color-primary, #1a1a1a)"
              />
            </g>

            {/* Left fin */}
            <path
              d="M 134 165 C 112 176 108 200 114 204 C 124 204 135 190 135 182 Z"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Right fin */}
            <path
              d="M 166 165 C 188 176 192 200 186 204 C 176 204 165 190 165 182 Z"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Fuselage body */}
            <path
              d="M 150 90 C 144 115 132 142 132 180 L 140 182 L 137 192 L 163 192 L 160 182 L 168 180 C 168 142 156 115 150 90 Z"
              fill="#ffffff"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Nose cone tip */}
            <path
              d="M 150 90 C 146 106 142 116 139 122 L 161 122 C 158 116 154 106 150 90 Z"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Porthole */}
            <circle
              cx="150"
              cy="146"
              r="12"
              fill="#ffffff"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5"
            />
            <path
              d="M 146 142 L 150 138"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* "SHIPPED" sticker */}
          <g id="static-sticker" transform="rotate(-6 150 148)">
            <rect
              x="92"
              y="130"
              width="122"
              height="42"
              rx="4"
              fill="var(--color-primary, #1a1a1a)"
            />
            <rect
              x="86"
              y="124"
              width="122"
              height="42"
              rx="4"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="4.5"
            />
            <text
              x="147"
              y="153"
              textAnchor="middle"
              fontFamily='var(--font-brunson), "Brunson", sans-serif'
              fontSize="23"
              fontWeight="900"
              letterSpacing="3"
              fill="var(--color-primary, #1a1a1a)"
            >
              SHIPPED
            </text>
          </g>
        </g>

        {/* -------------------------------------------------------------
            DYNAMIC ANIMATED FRAME:
            Controlled by the GSAP timeline.
            ------------------------------------------------------------- */}
        <g id="dynamic-frame" className={styles.dynamicFrame}>
          {/* Layered concentric glow circles for the bulb */}
          <g id="glow">
            <circle
              cx="150"
              cy="142"
              r="76"
              fill="var(--color-accent, #e8a020)"
              opacity="0.18"
            />
            <circle
              cx="150"
              cy="142"
              r="62"
              fill="var(--color-accent, #e8a020)"
              opacity="0.3"
            />
          </g>

          {/* Flash ring during morph */}
          <circle
            id="flash-ring"
            cx="150"
            cy="150"
            r="50"
            fill="none"
            stroke="var(--color-accent, #e8a020)"
            strokeWidth="8"
          />

          {/* Burst dashes for gear-to-rocket pop */}
          <g id="burst-group" stroke="var(--color-primary, #1a1a1a)" strokeWidth="5.5" strokeLinecap="round">
            <path d="M 150 102 L 150 82" />
            <path d="M 188 114 L 202 100" />
            <path d="M 194 162 L 210 174" />
            <path d="M 150 196 L 150 216" />
            <path d="M 106 162 L 90 174" />
            <path d="M 112 114 L 98 100" />
          </g>



          {/* Bulb ray dashes */}
          <g id="rays" stroke="var(--color-primary, #1a1a1a)" strokeWidth="5.5" strokeLinecap="round">
            <path d="M 150 68 L 150 50" />
            <path d="M 188 78 L 202 64" />
            <path d="M 220 138 L 238 138" />
            <path d="M 204 182 L 218 196" />
            <path d="M 96 182 L 82 196" />
            <path d="M 80 138 L 62 138" />
            <path d="M 112 78 L 98 64" />
          </g>

          {/* Main solid dark shadow (morphs in sync from bulb shadow to gear shadow) */}
          <path
            id="glass-shadow"
            d={BULB_SHADOW_PATH}
            fill="var(--color-primary, #1a1a1a)"
          />

          {/* Main shape: Bulb glass outline that morphs into gear */}
          <path
            id="glass"
            d={BULB_PATH}
            fill="var(--color-accent, #e8a020)"
            stroke="var(--color-primary, #1a1a1a)"
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Gear center axle hole */}
          <circle
            id="gear-hole"
            cx="150"
            cy="150"
            r="14"
            fill="#f8f4eb"
            stroke="var(--color-primary, #1a1a1a)"
            strokeWidth="5.5"
          />

          {/* Bulb base screw threads (fade out on morph) */}
          <g id="base" stroke="var(--color-primary, #1a1a1a)" strokeWidth="6" strokeLinecap="round" fill="none">
            <path d="M 134 196 C 142 200 158 200 166 196" />
            <path d="M 137 204 C 143 208 157 208 163 204" />
            <path d="M 141 212 C 145 216 155 216 159 212" />
          </g>

          {/* Bulb tungsten filament (fades out on morph) */}
          <path
            id="filament"
            d="M 143 186 L 145 158 C 145 146 149 146 150 152 C 151 146 155 146 155 158 L 157 186"
            fill="none"
            stroke="var(--color-primary, #1a1a1a)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Small meshing gear (#gear2) and shadow, both with precise centers */}
          <path
            id="gear2-shadow"
            d={GEAR2_SHADOW_PATH}
            fill="var(--color-primary, #1a1a1a)"
          />
          <path
            id="gear2"
            d={GEAR2_PATH}
            fill="var(--color-accent, #e8a020)"
            stroke="var(--color-primary, #1a1a1a)"
            strokeWidth="5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle
            id="gear2-hole"
            cx="216"
            cy="92"
            r="7.5"
            fill="#f8f4eb"
            stroke="var(--color-primary, #1a1a1a)"
            strokeWidth="4"
          />

          {/* Rocket Group */}
          <g id="rocket">
            {/* Rocket hard shadow */}
            <g id="rocket-shadow" transform="translate(6 6)">
              <path
                d="M 134 165 C 112 176 108 200 114 204 C 124 204 135 190 135 182 Z"
                fill="var(--color-primary, #1a1a1a)"
              />
              <path
                d="M 166 165 C 188 176 192 200 186 204 C 176 204 165 190 165 182 Z"
                fill="var(--color-primary, #1a1a1a)"
              />
              <path
                d="M 150 90 C 144 115 132 142 132 180 L 140 182 L 137 192 L 163 192 L 160 182 L 168 180 C 168 142 156 115 150 90 Z"
                fill="var(--color-primary, #1a1a1a)"
              />
            </g>

            {/* Thruster Flame */}
            <path
              id="flame"
              d="M 141 192 L 135 212 L 144 206 L 150 224 L 156 206 L 165 212 L 159 192 Z"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="4.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Left fin */}
            <path
              d="M 134 165 C 112 176 108 200 114 204 C 124 204 135 190 135 182 Z"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Right fin */}
            <path
              d="M 166 165 C 188 176 192 200 186 204 C 176 204 165 190 165 182 Z"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Main fuselage hull */}
            <path
              d="M 150 90 C 144 115 132 142 132 180 L 140 182 L 137 192 L 163 192 L 160 182 L 168 180 C 168 142 156 115 150 90 Z"
              fill="#ffffff"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Nose cone tip */}
            <path
              d="M 150 90 C 146 106 142 116 139 122 L 161 122 C 158 116 154 106 150 90 Z"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5"
              strokeLinejoin="round"
            />

            {/* Porthole */}
            <circle
              cx="150"
              cy="146"
              r="12"
              fill="#ffffff"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="5"
            />
            <path
              d="M 146 142 L 150 138"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>

          {/* "SHIPPED" Sticker */}
          <g id="shipped-sticker" transform="rotate(-6 150 150)">
            <rect
              x="92"
              y="132"
              width="122"
              height="42"
              rx="4"
              fill="var(--color-primary, #1a1a1a)"
            />
            <rect
              x="86"
              y="126"
              width="122"
              height="42"
              rx="4"
              fill="var(--color-accent, #e8a020)"
              stroke="var(--color-primary, #1a1a1a)"
              strokeWidth="4.5"
            />
            <text
              x="147"
              y="155"
              textAnchor="middle"
              fontFamily='var(--font-brunson), "Brunson", sans-serif'
              fontSize="23"
              fontWeight="900"
              letterSpacing="3"
              fill="var(--color-primary, #1a1a1a)"
            >
              SHIPPED
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
