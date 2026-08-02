"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventRegistrationForm from "../components/EventRegistrationForm";
import styles from "./guess-who.module.css";

export default function GuessWhoPage() {
  return (
    <>
      <Navbar isMenuShown={false} />
      <main className={styles.guessWhoPage}>
        <EventRegistrationForm
          title="GUESS WHO"
          subtitle="Put your deduction skills to the ultimate test! Register for Guess Who and decode mystery startups to conquer the challenge."
          leaderLabel="Team Leader Details"
          apiBaseUrl={process.env.NEXT_PUBLIC_IDEATHON_API_URL!}
          maxTeammates={3}
          minTeammates={0}
          showGender={true}
          showTicket={true}
          gameName="Guess Who"
          requiresPayment={false}
          guidelines={
            <>
              <li>
                Event Type: <strong>Individual or Team</strong> (up to 4
                members).
              </li>
              <li>
                Venue: <strong>Room 314</strong>.
              </li>
              <li>
                Time: <strong>10:30 AM – 12:00 PM</strong>.
              </li>
              <li>
                Registration Fee: <strong>Free (No registration fee)</strong>.
              </li>
              <li>
                The event consists of a{" "}
                <strong>Quiz Round followed by an Interactive Session</strong>.
              </li>
              <li>
                Use of <strong>mobile phones or any external assistance</strong>{" "}
                during the quiz is <strong>strictly prohibited</strong>.
              </li>
              <li>
                <strong>Organizers reserve the right</strong> to modify the{" "}
                <strong>event format or rules</strong> if required.
              </li>
            </>
          }
          guidelinesCheckboxLabel="event guidelines"
          registerEndpoint="/events/guess-who"
          uploadEndpoint="/upload"
          successTitle="REGISTRATION SUCCESSFUL!"
          successDescription="Your registration for Guess Who has been successfully recorded. Your ticket will be sent to your email shortly. Please join the official WhatsApp group to receive updates, schedules, and important event announcements."
          whatsappGroupUrl="https://chat.whatsapp.com/BbZ8RKxPHcu8vPpmrIY33b?mode=gi_t"
          resetButtonLabel="Register Another Team"
        />
      </main>
      <Footer />
    </>
  );
}
