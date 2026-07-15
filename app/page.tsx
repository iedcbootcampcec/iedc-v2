"use client";

import { useEffect } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Mascot from "./components/Mascot";
import { FiScissors } from "react-icons/fi";
import Announcements from "./components/Announcements";
import MarqueeBelt from "./components/MarqueeBelt";
import Achievements from "./components/Achievements";
import Team from "./components/Team";
import Footer from "./components/Footer";

export default function Home() {
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.slice(1);
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 400);
    }
  }, []);

  return (
    <main>
      <Navbar />
      <Hero />

      {/* ── Cut-here separator ── */}
      <div className="cutHereSeparator">
        <span className="cutHereScissors">
          <FiScissors />
        </span>
      </div>

      <About />
      <Mascot />
      <MarqueeBelt />
      <Announcements />
      <Achievements />

      <Team />
      <Footer />
    </main>
  );
}
