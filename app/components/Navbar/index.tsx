"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import IedcLogo from "../logos/iedcLogo";
import styles from "./Navbar.module.css";

const NAV_ITEMS = [
  { label: "home", id: "hero" },
  { label: "about", id: "about" },
  { label: "events", id: "events" },
  { label: "achievements", id: "achievements" },
  { label: "team", id: "team" },
];

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    let offset = 0;
    if (window.innerWidth > 768 && ["team", "achievements"].includes(id))
      offset = -20;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }
};

interface NavbarProps {
  isMenuShown?: boolean;
  mainUrl?: string;
}

export default function Navbar({ isMenuShown = true }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const elem = navRef.current;
      if (!elem || !isMenuShown) return;
      const intensity = Math.min(1, window.scrollY / 200);
      elem.style.setProperty("--nav-bg-intensity", intensity.toString());
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuShown]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const navElement = navRef.current;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      navElement?.classList.add(styles.navbarMobileMenuOpen);
    } else {
      document.body.style.overflow = "";
      navElement?.classList.remove(styles.navbarMobileMenuOpen);
    }
    return () => {
      document.body.style.overflow = "";
      navElement?.classList.remove(styles.navbarMobileMenuOpen);
    };
  }, [isOpen]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const hash = e.currentTarget.hash;
    const id = hash.slice(1);

    if (pathname !== "/") {
      closeMenu();
      return;
    }

    e.preventDefault();
    scrollToSection(id);
    closeMenu();
  };

  return (
    <>
      <nav
        className={styles.navbar}
        role="navigation"
        aria-label="Main navigation"
        ref={navRef}
        id="navbar-ref"
      >
        {/* ── Logo ── */}
        <Link
          href="/#hero"
          className={`${styles.logo} ${isOpen ? styles.logoOpen : ""}`}
          onClick={handleNavClick}
        >
          <IedcLogo size={"5rem"} />
        </Link>

        {/* ── Desktop links ── */}
        {isMenuShown && (
          <>
            <ul className={styles.navLinks}>
              {NAV_ITEMS.map((item) => (
                <li key={item.label} className={styles.navItem}>
                  <a
                    href={`/#${item.id}`}
                    onClick={handleNavClick}
                    className={styles.navLink}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* ── Desktop Join CTA ── */}
            <Link href="/join-us" className={styles.joinCta}>
              Join Us
            </Link>

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
          </>
        )}
      </nav>

      {/* ── Mobile fullscreen overlay ── */}
      {isMenuShown && (
        <div
          className={`${styles.mobileOverlay} ${isOpen ? styles.open : ""}`}
          aria-hidden={!isOpen}
        >
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className={styles.mobileNavItem}>
                <a
                  href={`/#${item.id}`}
                  className={styles.mobileNavLink}
                  onClick={handleNavClick}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* ── Mobile bottom info ── */}
          <div className={styles.mobileFooter}>
            <span className={styles.mobileFooterText}>EST. 2015 — CEC</span>
            <Link
              href="/join-us"
              className={styles.mobileFooterCta}
              onClick={closeMenu}
            >
              Join the bootcamp →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
