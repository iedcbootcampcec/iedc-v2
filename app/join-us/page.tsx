import type { Metadata } from "next";
import JoinUsForm from "./JoinUsForm";
import styles from "./join-us.module.css";

export const metadata: Metadata = {
  title: "Join Us | IEDC BOOTCAMP CEC",
  description:
    "Take your next step with IEDC Bootcamp CEC. Meet fellow makers, explore your ideas, and build together.",
};

export default function JoinUsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <JoinUsForm />
      </div>
    </main>
  );
}
