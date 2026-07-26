"use client";

import { useState } from "react";
import styles from "./IdeathonSubmission.module.css";
import {
  FiArrowUpRight,
  FiChevronDown,
  FiCheck,
  FiChevronUp,
} from "react-icons/fi";
import * as Select from "@radix-ui/react-select";
import {
  FindTeamResult,
  TeamMembersDetails,
  findTeamByName,
  fetchTeamMembers,
  updateTeamMembers,
  submitIdea,
} from "./services/api";

const GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function SubmissionForm() {
  const [inputTeamName, setInputTeamName] = useState("");
  const [verifiedTeam, setVerifiedTeam] = useState<FindTeamResult | null>(null);
  const [isVerifyingTeam, setIsVerifyingTeam] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [teamMembersDetails, setTeamMembersDetails] =
    useState<TeamMembersDetails | null>(null);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [leaderGender, setLeaderGender] = useState("");
  const [memberGenders, setMemberGenders] = useState<Record<string, string>>(
    {},
  );

  const [submissionText, setSubmissionText] = useState("");

  const [formError, setFormError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const handleVerifyTeam = async (): Promise<FindTeamResult | null> => {
    const targetName = inputTeamName.trim();
    if (!targetName) {
      setVerifyError("Please enter your team name.");
      return null;
    }

    setVerifyError("");
    setIsVerifyingTeam(true);
    setTeamMembersDetails(null);
    setLeaderGender("");
    setMemberGenders({});

    try {
      const team = await findTeamByName(targetName);
      setVerifiedTeam(team);
      setIsVerifyingTeam(false);

      // Fetch member details for verified team
      setIsLoadingMembers(true);
      const membersData = await fetchTeamMembers(team.team_id);
      setTeamMembersDetails(membersData);
      setIsLoadingMembers(false);

      return team;
    } catch (err: any) {
      setVerifiedTeam(null);
      setVerifyError(err.message || "Team not found.");
      setIsVerifyingTeam(false);
      return null;
    }
  };

  const handleMemberGenderChange = (userId: string, gender: string) => {
    setMemberGenders((prev) => ({
      ...prev,
      [userId]: gender,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setFormError("");

    let currentTeam = verifiedTeam;

    if (!currentTeam) {
      currentTeam = await handleVerifyTeam();
      if (!currentTeam) {
        return setFormError("Please enter and verify a registered team name.");
      }
    }

    if (!leaderGender) {
      return setFormError(
        `Please select gender for team leader${
          teamMembersDetails?.leader_name
            ? ` (${teamMembersDetails.leader_name})`
            : ""
        }.`,
      );
    }

    if (teamMembersDetails?.members) {
      for (const member of teamMembersDetails.members) {
        if (!memberGenders[member.user_id]) {
          return setFormError(
            `Please select gender for team member (${member.name}).`,
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

      await updateTeamMembers(currentTeam.team_id, {
        leader_gender: leaderGender,
        members: membersPayload,
      });

      await submitIdea(Number(currentTeam.team_id) || 0, submissionText.trim());
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
          <strong>{verifiedTeam?.team_name}</strong> has been received. Our
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
          <h2 className={styles.sectionTitle}>Find Registered Team</h2>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Team Name</label>
          <div className={styles.teamSearchBox}>
            <input
              type="text"
              placeholder="Enter your team name"
              className={styles.input}
              value={inputTeamName}
              onChange={(e) => {
                setInputTeamName(e.target.value);
                setVerifyError("");
                if (verifiedTeam) {
                  setVerifiedTeam(null);
                  setTeamMembersDetails(null);
                  setLeaderGender("");
                  setMemberGenders({});
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleVerifyTeam();
                }
              }}
              disabled={submitStatus === "submitting" || isVerifyingTeam}
            />
            <button
              type="button"
              className={`${styles.verifyBtn} ${
                verifiedTeam ? styles.verifiedBtn : ""
              }`}
              onClick={handleVerifyTeam}
              disabled={
                !inputTeamName.trim() ||
                isVerifyingTeam ||
                Boolean(verifiedTeam)
              }
            >
              {isVerifyingTeam ? (
                "Verifying..."
              ) : verifiedTeam ? (
                <>
                  <span>Verified</span>
                  <FiCheck />
                </>
              ) : (
                "Verify Team"
              )}
            </button>
          </div>
          {verifyError && <p className={styles.formErrorText}>{verifyError}</p>}
          {verifiedTeam && (
            <div className={styles.verifiedBadge}>
              <span className={styles.verifiedIcon}>✓</span>
              <span>
                Team verified: <strong>{verifiedTeam.team_name}</strong>
              </span>
            </div>
          )}
        </div>

        {Boolean(verifiedTeam) && (
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
                  style={{
                    width: "100%",
                    height: "2.5rem",
                    marginTop: "0.5rem",
                  }}
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
            {verifiedTeam ? "03" : "02"}
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
            disabled={submitStatus === "submitting" || !verifiedTeam}
          />
        </div>

        {formError && submitStatus !== "error" && (
          <p className={styles.formErrorText}>{formError}</p>
        )}

        <button
          type="submit"
          disabled={submitStatus === "submitting" || !verifiedTeam}
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
