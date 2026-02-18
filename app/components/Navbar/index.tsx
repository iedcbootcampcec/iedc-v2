"use client";

import { useState, useEffect, useCallback } from "react";
import IedcLogo from "./iedcLogo";
import styles from "./Navbar.module.css";

const NAV_ITEMS = [
  { label: "home", href: "#hero" },
  { label: "about", href: "#about" },
  { label: "events", href: "#events" },
  { label: "team", href: "#team" },
  { label: "contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <nav
        className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <a
          href="#hero"
          className={`${styles.logo} ${isOpen ? styles.logoOpen : ""}`}
          onClick={closeMenu}
        >
          <IedcLogo size={100} />
        </a>

        {/* ── Desktop links ── */}
        <ul className={styles.navLinks}>
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className={styles.navItem}>
              <a href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* ── Desktop Join CTA ── */}
        <button className={styles.joinCta} type="button">
          Join Us
        </button>

        {/* ── Hamburger (mobile only) ── */}
        <button
          className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ""}`}
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          type="button"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </nav>

      {/* ── Mobile fullscreen overlay ── */}
      <div
        className={`${styles.mobileOverlay} ${isOpen ? styles.open : ""}`}
        aria-hidden={!isOpen}
      >
        <ul className={styles.mobileNavList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.label} className={styles.mobileNavItem}>
              <a
                href={item.href}
                className={styles.mobileNavLink}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* ── Mobile bottom info ── */}
        <div className={styles.mobileFooter}>
          <span className={styles.mobileFooterText}>EST. 2015 — CEC</span>
          <a
            href="#hero"
            className={styles.mobileFooterCta}
            onClick={closeMenu}
          >
            Join the bootcamp →
          </a>
        </div>
      </div>
    </>
  );
}
