"use client";

import { useRef, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiPlus, FiX } from "react-icons/fi";
import {
  MAX_IDEA_TEAM_SIZE,
  submitIdea,
  validateIdeaSubmissionInput,
} from "../services/ideaSubmissionService";
import type {
  SubmitIdeaRequest,
  SubmittedIdeaData,
} from "../types/idea-submission";
import { TextArea } from "@radix-ui/themes";
import {
  MemberFields,
  memberFields,
  TextField,
} from "./components";
import styles from "./submit-idea.module.css";

export default function IdeaSubmissionForm() {
  const [teammates, setTeammates] = useState<number[]>([]);
  const nextTeammateId = useRef(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState<SubmittedIdeaData | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const clearError = (field: string) =>
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  const focusError = () =>
    requestAnimationFrame(() => errorRef.current?.focus());
  const addTeammate = () => {
    if (teammates.length >= MAX_IDEA_TEAM_SIZE - 1 || submittingRef.current)
      return;
    const id = nextTeammateId.current++;
    setTeammates((current) =>
      current.length < MAX_IDEA_TEAM_SIZE - 1 ? [...current, id] : current,
    );
    clearError("teammates");
    requestAnimationFrame(() => {
      (
        formRef.current?.elements.namedItem(
          `teammates.${teammates.length}.name`,
        ) as HTMLInputElement
      )?.focus();
    });
  };
  const removeTeammate = (id: number) => {
    if (submittingRef.current) return;
    setTeammates((current) => current.filter((memberId) => memberId !== id));
    // Index-based API errors must be cleared when member positions change.
    setFieldErrors((current) =>
      Object.fromEntries(
        Object.entries(current).filter(
          ([field]) => !field.startsWith("teammates"),
        ),
      ),
    );
    requestAnimationFrame(() =>
      document.getElementById("add-teammate")?.focus(),
    );
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setFormError("");
    setFieldErrors({});
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (field: string) => String(data.get(field) ?? "").trim();
    const readMember = (prefix = "") =>
      Object.fromEntries(
        memberFields.map(({ name }) => [name, read(`${prefix}${name}`)]),
      );
    const leader = readMember() as {
      name: string;
      gender: string;
      phone: string;
      email: string;
      class: string;
      branch: string;
    };
    const idea = read("idea");
    const teamname = read("teamname");
    const rawTeammates = teammates.length
      ? teammates.map((_, index) => readMember(`teammates.${index}.`))
      : [];
    const cleanedTeammates = rawTeammates.map((mate) => ({
      name: mate.name,
      ...(mate.gender ? { gender: mate.gender } : {}),
      ...(mate.email ? { email: mate.email } : {}),
      ...(mate.phone ? { phone: mate.phone } : {}),
      ...(mate.class ? { class: mate.class } : {}),
      ...(mate.branch ? { branch: mate.branch } : {}),
    }));

    const payload: SubmitIdeaRequest = {
      name: leader.name,
      gender: leader.gender,
      phone: leader.phone,
      email: leader.email,
      class: leader.class,
      ...(leader.branch ? { branch: leader.branch } : {}),
      idea,
      ...(teamname ? { teamname } : {}),
      ...(cleanedTeammates.length > 0 ? { teammates: cleanedTeammates } : {}),
    };

    const validation = validateIdeaSubmissionInput(payload);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormError("Please check the highlighted fields.");
      const firstField = Object.keys(validation.errors)[0];
      const targetEl =
        document.getElementById(`idea-${firstField}`) ||
        (form.elements.namedItem(firstField) as HTMLElement | null);
      requestAnimationFrame(() =>
        targetEl ? targetEl.focus() : errorRef.current?.focus(),
      );
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await submitIdea(payload);
      if (result.success) {
        setSubmitted(result.data);
        setSuccessMessage(result.message);
        requestAnimationFrame(() => successRef.current?.focus());
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          const firstField = Object.keys(result.fieldErrors)[0];
          const targetEl =
            document.getElementById(`idea-${firstField}`) ||
            (form.elements.namedItem(firstField) as HTMLElement | null);
          if (targetEl) {
            targetEl.focus();
          }
        }
        setFormError(result.message);
        focusError();
      }
    } catch {
      setFormError(
        "We couldn't confirm your idea submission. Please check your connection and try again.",
      );
      focusError();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="form-heading">
      <div className={styles.cardHeader}>
        <h1 id="form-heading" className={styles.cardTitle}>
          SUBMIT YOUR IDEA
        </h1>
      </div>
      <form
        ref={formRef}
        className={styles.form}
        onSubmit={handleSubmit}
        hidden={submitted !== null}
        aria-busy={isSubmitting}
      >
        <p className={styles.requiredNote}>
          Fields marked * are required. You can submit solo or with a team.
        </p>
        <fieldset
          className={styles.fields}
          disabled={isSubmitting}
          aria-label="Team leader details"
        >
          <legend className={styles.groupTitle}>
            Your details / Team leader
          </legend>
          <MemberFields
            errors={fieldErrors}
            clearError={clearError}
            disabled={isSubmitting}
          />
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="idea-description">
              Your idea <span aria-hidden="true">*</span>
            </label>
            <TextArea
              id="idea-description"
              name="idea"
              rows={6}
              size="3"
              resize="vertical"
              radius="none"
              className={styles.radixTextArea}
              required
              minLength={10}
              maxLength={5000}
              placeholder="Tell us about your idea…"
              color={fieldErrors.idea ? "red" : undefined}
              aria-invalid={fieldErrors.idea ? true : undefined}
              aria-describedby={`idea-help${fieldErrors.idea ? " idea-error" : ""}`}
              onInput={() => clearError("idea")}
              disabled={isSubmitting}
            />
            <p id="idea-help" className={styles.fieldHint}>
              Describe the problem, your solution, and who it helps. At least 10
              characters.
            </p>
            {fieldErrors.idea && (
              <p id="idea-error" className={styles.fieldError}>
                {fieldErrors.idea}
              </p>
            )}
          </div>
        </fieldset>
        <fieldset
          className={`${styles.fields} ${styles.teamSection}`}
          disabled={isSubmitting}
          aria-label="Optional team details"
        >
          <legend className={styles.groupTitle}>
            Team <span className={styles.optional}>Optional</span>
          </legend>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="idea-teamname">
              Team name <span className={styles.optional}>(optional)</span>
            </label>
            <TextField
              id="idea-teamname"
              name="teamname"
              placeholder="Your team name"
              type="text"
              error={fieldErrors.teamname}
              aria-describedby={
                fieldErrors.teamname ? "teamname-error" : undefined
              }
              onInput={() => clearError("teamname")}
              disabled={isSubmitting}
            />
            {fieldErrors.teamname && (
              <p id="teamname-error" className={styles.fieldError}>
                {fieldErrors.teamname}
              </p>
            )}
          </div>
          <p className={`${styles.fieldHint} ${styles.fullWidth}`}>
            Up to {MAX_IDEA_TEAM_SIZE} members, including you. Add teammates
            only if you are submitting as a team.
          </p>
          {teammates.map((id, index) => (
            <fieldset
              key={id}
              className={`${styles.fields} ${styles.fullWidth} ${styles.teammate}`}
              aria-label={`Teammate ${index + 1}`}
            >
              <legend className={styles.memberLegend}>
                <span>Teammate {index + 1}</span>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeTeammate(id)}
                  disabled={isSubmitting}
                  aria-label={`Remove teammate ${index + 1}`}
                >
                  Remove <FiX aria-hidden="true" />
                </button>
              </legend>
              <MemberFields
                prefix={`teammates.${index}.`}
                errors={fieldErrors}
                clearError={clearError}
                disabled={isSubmitting}
              />
            </fieldset>
          ))}
          <div className={styles.fullWidth}>
            <p className={styles.memberCount} role="status">
              {teammates.length + 1} / {MAX_IDEA_TEAM_SIZE} members, including
              you
            </p>
            <button
              id="add-teammate"
              type="button"
              className={styles.addButton}
              onClick={addTeammate}
              disabled={
                isSubmitting || teammates.length >= MAX_IDEA_TEAM_SIZE - 1
              }
            >
              <FiPlus aria-hidden="true" />{" "}
              {teammates.length >= MAX_IDEA_TEAM_SIZE - 1
                ? "Team limit reached"
                : "Add teammate"}
            </button>
            {fieldErrors.teammates && (
              <p className={styles.fieldError} id="teammates-error">
                {fieldErrors.teammates}
              </p>
            )}
          </div>
        </fieldset>
        {formError && (
          <div
            ref={errorRef}
            className={styles.formError}
            role="alert"
            tabIndex={-1}
          >
            {formError}
          </div>
        )}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting…" : "Submit idea"}{" "}
          <FiArrowUpRight aria-hidden="true" />
        </button>
      </form>
      {submitted && (
        <div
          ref={successRef}
          className={styles.review}
          tabIndex={-1}
          aria-labelledby="submission-heading"
        >
          <h3 id="submission-heading">Idea submitted successfully</h3>
          <p>{successMessage}</p>
          <dl className={styles.reviewList}>
            <div>
              <dt>Name</dt>
              <dd>{submitted.name}</dd>
            </div>
            <div>
              <dt>Your idea</dt>
              <dd>{submitted.idea}</dd>
            </div>
            {(submitted.team_name || submitted.teamname) && (
              <div>
                <dt>Team name</dt>
                <dd>{submitted.team_name || submitted.teamname}</dd>
              </div>
            )}
            <div>
              <dt>Team members</dt>
              <dd>
                {[
                  submitted.name,
                  ...(submitted.teammates ?? []).map(({ name }) => name),
                ].join(", ")}
              </dd>
            </div>
          </dl>
          <Link href="/#student-ideas" className={styles.submitButton}>
            Back to bootcamp <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
