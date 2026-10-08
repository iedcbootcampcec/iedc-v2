"use client";

import { useRef, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiPlus, FiX } from "react-icons/fi";
import { BranchInput } from "../join-us/JoinUsForm";
import { MAX_IDEA_TEAM_SIZE, validateIdeaSubmission, type IdeaMember, type IdeaSubmissionPayload } from "../lib/idea-submission";
import styles from "../join-us/join-us.module.css";
import ideaStyles from "./submit-idea.module.css";

const memberFields: { name: keyof IdeaMember; label: string; placeholder: string }[] = [
  { name: "name", label: "Name", placeholder: "Full name" },
  { name: "gender", label: "Gender", placeholder: "Select gender" },
  { name: "phone", label: "Phone number", placeholder: "Phone number" },
  { name: "email", label: "Email", placeholder: "you@example.com" },
  { name: "class", label: "Class", placeholder: "e.g. S3 A" },
  { name: "branch", label: "Branch", placeholder: "Type or select your branch" },
];

function MemberFields({ prefix = "", errors, clearError }: {
  prefix?: string;
  errors: Record<string, string>;
  clearError: (name: string) => void;
}) {
  return memberFields.map(({ name, label, placeholder }) => {
    const field = `${prefix}${name}`;
    const id = `idea-${field}`;
    const error = errors[field];
    return (
      <div key={name} className={`${styles.field} ${!["phone", "email"].includes(name) ? styles.fullWidth : ""}`}>
        <label htmlFor={id}>{label} <span aria-hidden="true">*</span></label>
        {name === "branch" ? (
          <BranchInput name={field} id={id} error={error} onValueChange={() => clearError(field)} />
        ) : name === "gender" ? (
          <select id={id} name={field} defaultValue="" required
            aria-invalid={error ? true : undefined} aria-describedby={error ? `${field}-error` : undefined}
            onChange={(event) => { event.currentTarget.setCustomValidity(""); clearError(field); }}>
            <option value="" disabled>{placeholder}</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        ) : (
          <input id={id} name={field} required placeholder={placeholder}
            type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
            autoComplete={prefix ? "off" : name === "name" ? "name" : name === "email" ? "email" : name === "phone" ? "tel" : "off"}
            maxLength={name === "email" ? 254 : name === "phone" ? 25 : 100}
            aria-invalid={error ? true : undefined} aria-describedby={error ? `${field}-error` : undefined}
            onInput={(event) => { event.currentTarget.setCustomValidity(""); clearError(field); }} />
        )}
        {error && <p id={`${field}-error`} className={styles.fieldError}>{error}</p>}
      </div>
    );
  });
}

export default function IdeaSubmissionForm() {
  const [teammates, setTeammates] = useState<number[]>([]);
  const nextTeammateId = useRef(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState<IdeaSubmissionPayload | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const clearError = (field: string) => setFieldErrors((current) => {
    const next = { ...current };
    delete next[field];
    return next;
  });
  const focusError = () => requestAnimationFrame(() => errorRef.current?.focus());
  const addTeammate = () => {
    if (teammates.length >= MAX_IDEA_TEAM_SIZE - 1 || submittingRef.current) return;
    const id = nextTeammateId.current++;
    setTeammates((current) => current.length < MAX_IDEA_TEAM_SIZE - 1 ? [...current, id] : current);
    clearError("teammates");
    requestAnimationFrame(() => {
      (formRef.current?.elements.namedItem(`teammates.${teammates.length}.name`) as HTMLInputElement)?.focus();
    });
  };
  const removeTeammate = (id: number) => {
    if (submittingRef.current) return;
    setTeammates((current) => current.filter((memberId) => memberId !== id));
    // Index-based API errors must be cleared when member positions change.
    setFieldErrors((current) => Object.fromEntries(Object.entries(current).filter(([field]) => !field.startsWith("teammates"))));
    requestAnimationFrame(() => document.getElementById("add-teammate")?.focus());
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setFormError("");
    setFieldErrors({});
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (field: string) => String(data.get(field) ?? "").trim();
    const readMember = (prefix = "") => Object.fromEntries(memberFields.map(({ name }) => [name, read(`${prefix}${name}`)]));
    const { payload, errors } = validateIdeaSubmission({
      ...readMember(), idea: read("idea"), teamname: read("teamname") || null,
      teammates: teammates.length ? teammates.map((_, index) => readMember(`teammates.${index}.`)) : null,
    });
    if (errors.length) {
      setFieldErrors(Object.fromEntries(errors.map(({ field, message }) => [field, message])));
      setFormError("Please check the highlighted fields.");
      const input = form.elements.namedItem(errors[0].field) as HTMLInputElement | HTMLTextAreaElement | null;
      requestAnimationFrame(() => input ? input.focus() : errorRef.current?.focus());
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/submit-idea", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(25000),
      });
      const result: unknown = await response.json().catch(() => null);
      const body = result && typeof result === "object" && !Array.isArray(result)
        ? result as Record<string, unknown> : {};
      if (response.status === 201 && body.success === true) {
        setSubmitted(payload);
        setSuccessMessage(typeof body.message === "string" ? body.message : "Idea submitted successfully.");
        requestAnimationFrame(() => successRef.current?.focus());
      } else {
        const nextErrors: Record<string, string> = {};
        if (Array.isArray(body.details)) {
          for (const detail of body.details) {
            if (detail && typeof detail === "object" && typeof detail.field === "string" && typeof detail.message === "string"
              && (form.elements.namedItem(detail.field) || detail.field === "teammates")) {
              nextErrors[detail.field] = detail.message;
            }
          }
        }
        setFieldErrors(nextErrors);
        setFormError(typeof body.message === "string" ? body.message : "We couldn't confirm your idea submission. Please try again.");
        focusError();
      }
    } catch {
      setFormError("We couldn't confirm your idea submission. Please check your connection and try again.");
      focusError();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="form-heading">
      <div className={styles.cardHeader}><h1 id="form-heading" className={styles.cardTitle}>SUBMIT YOUR IDEA</h1></div>
      <form ref={formRef} className={styles.form} onSubmit={handleSubmit} hidden={submitted !== null} aria-busy={isSubmitting}>
        <p className={styles.requiredNote}>Fields marked * are required. You can submit solo or with a team.</p>
        <fieldset className={styles.fields} disabled={isSubmitting} aria-label="Team leader details">
          <legend className={ideaStyles.groupTitle}>Your details / Team leader</legend>
          <MemberFields errors={fieldErrors} clearError={clearError} />
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="idea-description">Your idea <span aria-hidden="true">*</span></label>
            <textarea id="idea-description" name="idea" rows={6} required minLength={10} maxLength={5000}
              placeholder="Tell us about your idea…" aria-invalid={fieldErrors.idea ? true : undefined}
              aria-describedby={`idea-help${fieldErrors.idea ? " idea-error" : ""}`}
              onInput={() => clearError("idea")} />
            <p id="idea-help" className={styles.fieldHint}>Describe the problem, your solution, and who it helps. At least 10 characters.</p>
            {fieldErrors.idea && <p id="idea-error" className={styles.fieldError}>{fieldErrors.idea}</p>}
          </div>
        </fieldset>
        <fieldset className={`${styles.fields} ${ideaStyles.teamSection}`} disabled={isSubmitting} aria-label="Optional team details">
          <legend className={ideaStyles.groupTitle}>Team <span className={ideaStyles.optional}>Optional</span></legend>
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label htmlFor="idea-teamname">Team name <span className={ideaStyles.optional}>(optional)</span></label>
            <input id="idea-teamname" name="teamname" placeholder="Your team name" type="text"
              aria-invalid={fieldErrors.teamname ? true : undefined} aria-describedby={fieldErrors.teamname ? "teamname-error" : undefined}
              onInput={() => clearError("teamname")} />
            {fieldErrors.teamname && <p id="teamname-error" className={styles.fieldError}>{fieldErrors.teamname}</p>}
          </div>
          <p className={`${styles.fieldHint} ${styles.fullWidth}`}>Up to {MAX_IDEA_TEAM_SIZE} members, including you. Add teammates only if you are submitting as a team.</p>
          {teammates.map((id, index) => (
            <fieldset key={id} className={`${styles.fields} ${styles.fullWidth} ${ideaStyles.teammate}`} aria-label={`Teammate ${index + 1}`}>
              <legend className={ideaStyles.memberLegend}>
                <span>Teammate {index + 1}</span>
                <button type="button" className={ideaStyles.removeButton} onClick={() => removeTeammate(id)} disabled={isSubmitting}
                  aria-label={`Remove teammate ${index + 1}`}>Remove <FiX aria-hidden="true" /></button>
              </legend>
              <MemberFields prefix={`teammates.${index}.`} errors={fieldErrors} clearError={clearError} />
            </fieldset>
          ))}
          <div className={styles.fullWidth}>
            <p className={ideaStyles.memberCount} role="status">{teammates.length + 1} / {MAX_IDEA_TEAM_SIZE} members, including you</p>
            <button id="add-teammate" type="button" className={ideaStyles.addButton} onClick={addTeammate}
              disabled={isSubmitting || teammates.length >= MAX_IDEA_TEAM_SIZE - 1}>
              <FiPlus aria-hidden="true" /> {teammates.length >= MAX_IDEA_TEAM_SIZE - 1 ? "Team limit reached" : "Add teammate"}
            </button>
            {fieldErrors.teammates && <p className={styles.fieldError} id="teammates-error">{fieldErrors.teammates}</p>}
          </div>
        </fieldset>
        {formError && <div ref={errorRef} className={styles.formError} role="alert" tabIndex={-1}>{formError}</div>}
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? "Submitting…" : "Submit idea"} <FiArrowUpRight aria-hidden="true" />
        </button>
      </form>
      {submitted && (
        <div ref={successRef} className={styles.review} tabIndex={-1} aria-labelledby="submission-heading">
          <h3 id="submission-heading">Idea submitted successfully</h3><p>{successMessage}</p>
          <dl className={styles.reviewList}>
            <div><dt>Name</dt><dd>{submitted.name}</dd></div>
            <div><dt>Your idea</dt><dd>{submitted.idea}</dd></div>
            {submitted.teamname && <div><dt>Team name</dt><dd>{submitted.teamname}</dd></div>}
            <div><dt>Team members</dt><dd>{[submitted.name, ...(submitted.teammates ?? []).map(({ name }) => name)].join(", ")}</dd></div>
          </dl>
          <Link href="/#student-ideas" className={styles.submitButton}>Back to bootcamp <FiArrowUpRight aria-hidden="true" /></Link>
        </div>
      )}
    </section>
  );
}
