import Link from "next/link";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <section className={styles.content} aria-labelledby="not-found-title">
        <h1 id="not-found-title" className={styles.code} data-text="404">
          404
        </h1>
        <p className={styles.description}>
          THIS PAGE PACKED ITS BAGS AND LEFT. NO NOTE. NO FORWARDING ADDRESS.
          <br />
          WE CHECKED BEHIND THE SERVER. TWICE. IT&apos;S GONE, MAN.
        </p>
        <Link href="/" className={styles.homeLink}>
          GO HOME
        </Link>
      </section>
    </main>
  );
}
