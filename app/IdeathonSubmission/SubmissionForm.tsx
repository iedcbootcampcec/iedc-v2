"use client";

import { useState, useEffect } from "react";
import styles from "./IdeathonSubmission.module.css";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiCheck,
  FiChevronUp,
} from "react-icons/fi";
import * as Select from "@radix-ui/react-select";
import { Team, fetchTeams, submitIdea } from "./services/api";

export default function SubmissionForm() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [submissionText, setSubmissionText] = useState("");

  const [formError, setFormError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  useEffect(() => {
    let mounted = true;
    setIsLoadingTeams(true);

    fetchTeams().then((data) => {
      if (mounted) {
        setTeams(data);
        setIsLoadingTeams(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedTeam = teams.find((t) => t.team_id === Number(selectedTeamId));

  const handleSubmit = async (e: React.SubmitEvent) => {
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
      await submitIdea(Number(selectedTeamId), submissionText.trim());
      setSubmitStatus("success");
    } catch (err: any) {
      setSubmitStatus("error");
      setFormError(
        err.message || "An unexpected error occurred during submission.",
      );
    }
  };

  if (submitStatus === "success") {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successIconWrapper}>
          <span className={styles.successCheck}>✓</span>
        </div>
        <h2 className={styles.successTitle}>SUBMISSION SUCCESSFUL!</h2>
        <p className={styles.successDescription}>
          Thank you! Your submission for team{" "}
          <strong>{selectedTeam?.team_name}</strong> has been received. Our
          panel will evaluate the ideas and contact your team leader if any
          clarifications are needed.
        </p>
      </div>
    );
  }

  return (
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
            <div
              className={styles.selectTriggerLoading}
              aria-label="Loading teams..."
            >
              <span className={styles.skeletonText} />
              <div className={styles.skeletonIcon} />
            </div>
          ) : (
            <Select.Root
              value={selectedTeamId ? String(selectedTeamId) : ""}
              onValueChange={(val) => setSelectedTeamId(Number(val))}
              disabled={submitStatus === "submitting"}
              required
            >
              <Select.Trigger
                className={styles.selectTrigger}
                aria-label="Team"
              >
                <Select.Value placeholder="-- Choose your team --" />
                <Select.Icon className={styles.selectIcon}>
                  <FiChevronDown />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className={styles.selectContent}
                  position="popper"
                  sideOffset={4}
                >
                  <Select.ScrollUpButton className={styles.selectScrollButton}>
                    <FiChevronUp />
                  </Select.ScrollUpButton>
                  <Select.Viewport className={styles.selectViewport}>
                    {teams.map((t) => (
                      <Select.Item
                        key={t.team_id}
                        value={String(t.team_id)}
                        className={styles.selectItem}
                      >
                        <Select.ItemText>{t.team_name}</Select.ItemText>
                        <Select.ItemIndicator
                          className={styles.selectItemIndicator}
                        >
                          <FiCheck />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                  <Select.ScrollDownButton
                    className={styles.selectScrollButton}
                  >
                    <FiChevronDown />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
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
            disabled={submitStatus === "submitting" || !selectedTeamId}
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
  );
}
