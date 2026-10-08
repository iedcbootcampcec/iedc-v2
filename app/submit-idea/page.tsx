import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import IdeaSubmissionForm from "./IdeaSubmissionForm";
import formStyles from "../join-us/join-us.module.css";
import styles from "./submit-idea.module.css";

export const metadata: Metadata = {
  title: "Submit Your Idea | IEDC BOOTCAMP CEC",
  description:
    "Share your idea with IEDC Bootcamp CEC. Tell us about yourself, the problem you want to solve, and your solution.",
};

export default function SubmitIdeaPage() {
  return (
    <main className={formStyles.page}>
      <div className={formStyles.inner}>
        <Link href="/" className={styles.backLink}>
          <FiArrowLeft aria-hidden="true" /> Back to homepage
        </Link>
        <IdeaSubmissionForm />
      </div>
    </main>
  );
}
