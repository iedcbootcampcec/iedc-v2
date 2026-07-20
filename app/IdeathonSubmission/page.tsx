import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./IdeathonSubmission.module.css";
import SubmissionForm from "./SubmissionForm";

export default function IdeathonSubmissionPage() {
  return (
    <>
      <Navbar isMenuShown={false} mainUrl={"/"} />
      <main className={styles.ideathonPage}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h1 className={styles.title}>Ideathon Submission</h1>
              <p className={styles.subtitle}>
                Select your registered team and submit your pitch deck link
                below.
              </p>
            </div>
            
            <SubmissionForm />
            
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
