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
import {
  Team,
  TeamMembersDetails,
  fetchTeams,
  fetchTeamMembers,
  updateTeamMembers,
  submitIdea,
} from "./services/api";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function SubmissionForm() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<number | string>("");

  const [teamMembersDetails, setTeamMembersDetails] =
    useState<TeamMembersDetails | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [leaderGender, setLeaderGender] = useState("");
  const [memberGenders, setMemberGenders] = useState<Record<string, string>>(
    {}
  );

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

  useEffect(() => {
    if (!selectedTeamId) {
      setTeamMembersDetails(null);
      setLeaderGender("");
      setMemberGenders({});
      return;
    }

    let mounted = true;
    setIsLoadingMembers(true);
    setTeamMembersDetails(null);
    setLeaderGender("");
    setMemberGenders({});

    fetchTeamMembers(selectedTeamId).then((data) => {
      if (mounted) {
        setTeamMembersDetails(data);
        setIsLoadingMembers(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [selectedTeamId]);

  const selectedTeam = teams.find(
    (t) => String(t.team_id) === String(selectedTeamId)
  );

  const handleMemberGenderChange = (userId: string, gender: string) => {
    setMemberGenders((prev) => ({
      ...prev,
      [userId]: gender,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedTeamId) {
      return setFormError("Please select your team.");
    }

    if (!leaderGender) {
      return setFormError(
        `Please select gender for team leader${
          teamMembersDetails?.leader_name
            ? ` (${teamMembersDetails.leader_name})`
            : ""
        }.`
      );
    }

    if (teamMembersDetails?.members) {
      for (const member of teamMembersDetails.members) {
        if (!memberGenders[member.user_id]) {
          return setFormError(
            `Please select gender for team member (${member.name}).`
          );
        }
      }
    }

    if (!submissionText.trim()) {
      return setFormError("Please enter your submission text/link.");
    }

    setSubmitStatus("submitting");

    try {
      const membersPayload =
        teamMembersDetails?.members.map((m) => ({
          user_id: m.user_id,
          gender: memberGenders[m.user_id] || "",
        })) || [];

      await updateTeamMembers(selectedTeamId, {
        leader_gender: leaderGender,
        members: membersPayload,
      });

      await submitIdea(Number(selectedTeamId), submissionText.trim());
      setSubmitStatus("success");
    } catch (err: any) {
      setSubmitStatus("error");
      setFormError(
        err.message || "An unexpected error occurred during submission."
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
              onValueChange={(val) => setSelectedTeamId(val)}
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

        {Boolean(selectedTeamId) && (
          <>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>02</span>
              <h2 className={styles.sectionTitle}>Update Team Genders</h2>
            </div>

            {isLoadingMembers ? (
              <div className={styles.membersLoadingBox}>
                <div
                  className={styles.skeletonText}
                  style={{ width: "60%", height: "1.1rem" }}
                />
                <div
                  className={styles.skeletonText}
                  style={{ width: "100%", height: "2.5rem", marginTop: "0.5rem" }}
                />
              </div>
            ) : (
              <div className={styles.genderSection}>
                {/* Leader Gender Field */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Leader Gender:{" "}
                    <span className={styles.memberNameHighlight}>
                      {teamMembersDetails?.leader_name
                        ? `(${teamMembersDetails.leader_name})`
                        : ""}
                    </span>
                  </label>
                  <Select.Root
                    value={leaderGender}
                    onValueChange={setLeaderGender}
                    disabled={submitStatus === "submitting"}
                  >
                    <Select.Trigger
                      className={styles.selectTrigger}
                      aria-label="Leader Gender"
                    >
                      <Select.Value placeholder="-- Select Gender --" />
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
                        <Select.ScrollUpButton
                          className={styles.selectScrollButton}
                        >
                          <FiChevronUp />
                        </Select.ScrollUpButton>
                        <Select.Viewport className={styles.selectViewport}>
                          {GENDER_OPTIONS.map((opt) => (
                            <Select.Item
                              key={opt}
                              value={opt}
                              className={styles.selectItem}
                            >
                              <Select.ItemText>{opt}</Select.ItemText>
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
                </div>

                {/* Team Members Gender Fields */}
                {teamMembersDetails?.members &&
                  teamMembersDetails.members.map((member) => (
                    <div key={member.user_id} className={styles.field}>
                      <label className={styles.label}>
                        Member Gender:{" "}
                        <span className={styles.memberNameHighlight}>
                          ({member.name})
                        </span>
                      </label>
                      <Select.Root
                        value={memberGenders[member.user_id] || ""}
                        onValueChange={(val) =>
                          handleMemberGenderChange(member.user_id, val)
                        }
                        disabled={submitStatus === "submitting"}
                      >
                        <Select.Trigger
                          className={styles.selectTrigger}
                          aria-label={`Gender for ${member.name}`}
                        >
                          <Select.Value placeholder="-- Select Gender --" />
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
                            <Select.ScrollUpButton
                              className={styles.selectScrollButton}
                            >
                              <FiChevronUp />
                            </Select.ScrollUpButton>
                            <Select.Viewport className={styles.selectViewport}>
                              {GENDER_OPTIONS.map((opt) => (
                                <Select.Item
                                  key={opt}
                                  value={opt}
                                  className={styles.selectItem}
                                >
                                  <Select.ItemText>{opt}</Select.ItemText>
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
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>
            {selectedTeamId ? "03" : "02"}
          </span>
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

