import Link from "next/link";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.lights} aria-hidden="true">
        <span className={`${styles.light} ${styles.lightOne}`} />
        <span className={`${styles.light} ${styles.lightTwo}`} />
        <span className={`${styles.light} ${styles.lightThree}`} />
        <span className={styles.ring} />
      </div>

      <section className={styles.content} aria-labelledby="not-found-title">
        <p className={styles.label}>ERROR / 404</p>

        <h1 id="not-found-title" className={styles.code} aria-label="404">
          <span>4</span>
          <span className={styles.zero}>0</span>
          <span>4</span>
        </h1>

        <div className={styles.footer}>
          <p>THIS PAGE IS NOWHERE TO BE FOUND.</p>
          <Link href="/" className={styles.homeLink}>
            RETURN HOME <span aria-hidden="true">?</span>
          </Link>
        </div>
      </section>
    </main>
  );
}