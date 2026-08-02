"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventRegistrationForm from "../components/EventRegistrationForm";
import styles from "./startup-dna.module.css";

export default function StartupDnaPage() {
  return (
    <>
      <Navbar isMenuShown={false} />
      <main className={styles.startupDnaPage}>
        <EventRegistrationForm
          title="STARTUP DNA"
          subtitle="Fuse core startup concepts, spark creative synergies, and engineer the next groundbreaking venture."
          leaderLabel="Team Leader Details"
          apiBaseUrl={process.env.NEXT_PUBLIC_IDEATHON_API_URL!}
          maxTeammates={3}
          minTeammates={0}
          showGender={true}
          showTicket={true}
          gameName="Startup DNA"
          totalPaidAmount={20}
          isEarlyBird={false}
          requiresPayment={true}
          paymentConfig={{
            upiId: "parvathirajan14@okicici",
            qrCodeSrc: "/qr/parvathi_qr.webp",
            feeLabel: "₹20/Team",
          }}
          guidelines={
            <>
              <li>
                Event Type: <strong>Individual or Team</strong> (up to 4
                members).
              </li>
              <li>
                Venue: <strong>Room 518</strong>.
              </li>
              <li>
                Time: <strong>10:00 AM onwards</strong> (Walk-in participation).
              </li>
              <li>
                Registration Fee: <strong>₹20 per team</strong>.
              </li>
              <li>
                <strong>
                  No registration fee for IDEATHON &apos;26 registered teams
                </strong>
                . (Use the same team name that was used during Ideathon
                registration.)
              </li>
              <li>
                Use of <strong>AI tools is strictly prohibited</strong>.
              </li>
              <li>
                Participants will be given{" "}
                <strong>
                  10 minutes to combine the assigned startup concepts and create
                  a unique startup idea
                </strong>
                .
              </li>
              <li>
                The{" "}
                <strong>
                  decision of the judges will be final and binding
                </strong>
                .
              </li>
              <li>
                Any form of <strong>plagiarism or unfair practices</strong> will
                result in <strong>immediate disqualification</strong>.
              </li>
            </>
          }
          guidelinesCheckboxLabel="event guidelines"
          registerEndpoint="/events/startup-dna"
          uploadEndpoint="/upload"
          successTitle="REGISTRATION SUCCESSFUL!"
          successDescription="Your registration for Startup DNA has been recorded. Please join the official WhatsApp group for updates, announcements, and event details."
          whatsappGroupUrl="https://chat.whatsapp.com/BbZ8RKxPHcu8vPpmrIY33b?mode=gi_t"
          resetButtonLabel="Register Another Team"
        />
      </main>
      <Footer />
    </>
  );
}
