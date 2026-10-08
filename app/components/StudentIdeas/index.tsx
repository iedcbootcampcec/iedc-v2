import Link from "next/link";
import { FiArrowUpRight, FiEdit3 } from "react-icons/fi";
import styles from "./StudentIdeas.module.css";

export default function StudentIdeas() {
  return (
    <section id="student-ideas" className={styles.section} aria-labelledby="student-ideas-heading">
      <div className={styles.container}>
        <div className={styles.icon} aria-hidden="true"><FiEdit3 /></div>
        <div className={styles.copy}>
          <p className={styles.kicker}>STUDENT IDEAS / IEDC BOOTCAMP CEC</p>
          <h2 id="student-ideas-heading" className={styles.heading}>GOT AN IDEA?</h2>
          <p className={styles.description}>
            A problem you want to solve. A product you want to build. Share your
            idea with us and take the first step.
          </p>
        </div>
        <Link href="/submit-idea" className={styles.button}>
          Submit your idea <FiArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
