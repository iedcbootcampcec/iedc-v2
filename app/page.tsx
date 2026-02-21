import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import About from "./components/About";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* ── Cut-here separator ── */}
      <div className="cutHereSeparator">
        <span className="cutHereScissors">✂</span>
      </div>

      <About />
    </main>
  );
}
