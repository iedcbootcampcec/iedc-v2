"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./IdeathonSubmission.module.css";
import { FiArrowUpRight } from "react-icons/fi";

interface Team {
  team_id: number;
  team_name: string;
}

export default function IdeathonSubmissionPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [submissionText, setSubmissionText] = useState("");
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [formError, setFormError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      setFetchError(false);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_IDEATHON_API_URL!;
        const res = await fetch(`${baseUrl}/teams`);
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();

        if (Array.isArray(data)) {
          setTeams(data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching teams, falling back to mock data:", err);
        setFetchError(true);
        setTeams([
          {
            team_id: 2,
            team_name: "Runtime Terror (Mock)",
          },
          {
            team_id: 1,
            team_name: "Oneiro Astra (Mock)",
          },
        ]);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  const selectedTeam = teams.find((t) => t.team_id === Number(selectedTeamId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedTeamId) {
      return setFormError("Please select your team.");
    }
    if (!submissionText.trim()) {
      return setFormError("Please enter your submission text/link.");
    }

    setSubmitStatus("submitting");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_IDEATHON_API_URL!;
      const payload = {
        team_id: Number(selectedTeamId),
        submission: submissionText.trim(),
      };

      const res = await fetch(`${baseUrl}/teams/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
        setFormError(
          resData.message ||
            resData.error ||
            "Failed to submit project. Please try again.",
        );
      }
    } catch (err: any) {
      setSubmitStatus("error");
      setFormError(
        err.message || "An unexpected error occurred during submission.",
      );
    }
  };

  const handleReset = () => {
    setSelectedTeamId("");
    setSubmissionText("");
    setSubmitStatus("idle");
    setFormError("");
  };

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

            {submitStatus === "success" ? (
              <div className={styles.successScreen}>
                <div className={styles.successIconWrapper}>
                  <span className={styles.successCheck}>✓</span>
                </div>
                <h2 className={styles.successTitle}>SUBMISSION SUCCESSFUL!</h2>
                <p className={styles.successDescription}>
                  Thank you! Your submission for team{" "}
                  <strong>{selectedTeam?.team_name}</strong> has been received.
                  Our panel will evaluate the ideas and contact your team leader
                  if any clarifications are needed.
                </p>
              </div>
            ) : (
              <>
                {submitStatus === "error" && formError && (
                  <div className={`${styles.toast} ${styles.toastError}`}>
                    <span>{formError}</span>
                    <button
                      className={styles.toastClose}
                      onClick={() => {
                        setSubmitStatus("idle");
                        setFormError("");
                      }}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNum}>01</span>
                    <h2 className={styles.sectionTitle}>Select Team</h2>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Team Name</label>
                    {isLoadingTeams ? (
                      <div className={styles.loadingSpinner}>
                        Loading registered teams...
                      </div>
                    ) : (
                      <select
                        className={styles.select}
                        value={selectedTeamId}
                        onChange={(e) =>
                          setSelectedTeamId(
                            e.target.value ? Number(e.target.value) : "",
                          )
                        }
                        required
                        disabled={submitStatus === "submitting"}
                      >
                        <option value="">-- Choose your team --</option>
                        {teams.map((t) => (
                          <option key={t.team_id} value={t.team_id}>
                            {t.team_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionNum}>02</span>
                    <h2 className={styles.sectionTitle}>Submission</h2>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Submission link</label>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/..."
                      className={styles.input}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      required
                      disabled={
                        submitStatus === "submitting" || !selectedTeamId
                      }
                    />
                  </div>

                  {formError && submitStatus !== "error" && (
                    <p className={styles.formErrorText}>{formError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitStatus === "submitting" || !selectedTeamId}
                    className={styles.submitBtn}
                  >
                    {submitStatus === "submitting" ? (
                      "Submitting..."
                    ) : (
                      <>
                        <span>Submit Idea</span>
                        <FiArrowUpRight />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
