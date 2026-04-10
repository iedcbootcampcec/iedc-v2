import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import About from "./components/About";
import { FiScissors } from "react-icons/fi";
import Announcements from "./components/Announcements";
import MarqueeBelt from "./components/MarqueeBelt";
import Achievements from "./components/Achievements";
import Faculty from "./components/Team/Faculty";
import Execom from "./components/Team/Execom";
import SubExecom from "./components/Team/SubExecom";
import Team from "./components/Team";

export default function Home() {
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
      <MarqueeBelt />
      <Announcements />
      <Achievements />

      <Team />
    </main>
  );
}
