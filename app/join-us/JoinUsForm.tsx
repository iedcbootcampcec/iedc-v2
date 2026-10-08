"use client";

import { useRef, useState, type SubmitEvent } from "react";
import Link from "next/link";
import { FiArrowUpRight, FiEdit2 } from "react-icons/fi";
import { validateRegistration } from "../lib/registration";
import styles from "./join-us.module.css";

export interface JoinUsDetails {
  name: string;
  phone: string;
  email: string;
  class: string;
  branch: string;
}

type SubmissionDetails = JoinUsDetails & {
  gender?: string;
  ideaTitle?: string;
  idea?: string;
};
type FormField = { name: keyof SubmissionDetails; label: string };

const studentFields: FormField[] = [
  { name: "name", label: "Name" },
  { name: "phone", label: "Phone number" },
  { name: "email", label: "Email" },
  { name: "class", label: "Class" },
  { name: "branch", label: "Branch" },
];

const ideaFields: FormField[] = [
  { name: "ideaTitle", label: "Idea title" },
  { name: "idea", label: "Your idea" },
];

const registrationFields: FormField[] = [
  { name: "name", label: "Name" },
  { name: "gender", label: "Gender" },
  ...studentFields.filter(({ name }) => !["name", "class"].includes(name)),
];

const branches = [
  "Computer Science",
  "Computer Science(AI & ML)",
  "Electronics Engineering",
  "Electrical Engineering",
];

function BranchInput({
  error,
  onValueChange,
}: {
  error?: string;
  onValueChange: () => void;
}) {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = branches.filter((branch) =>
    branch.toLowerCase().includes(value.trim().toLowerCase()),
  );
  const showSuggestions = isOpen && suggestions.length > 0;

  const chooseBranch = (branch: string) => {
    setValue(branch);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.setCustomValidity("");
    onValueChange();
  };

  return (
    <div className={styles.branchControl}>
      <input
        ref={inputRef}
        id="join-branch"
        name="branch"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "branch-error" : undefined}
        aria-controls={showSuggestions ? "join-branch-options" : undefined}
        aria-activedescendant={
          showSuggestions && activeIndex >= 0
            ? `branch-option-${activeIndex}`
            : undefined
        }
        autoComplete="off"
        placeholder="Type or select your branch"
        value={value}
        maxLength={100}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          setIsOpen(false);
          setActiveIndex(-1);
        }}
        onChange={(event) => {
          setValue(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
          event.currentTarget.setCustomValidity("");
          onValueChange();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setIsOpen(false);
            setActiveIndex(-1);
          } else if (
            ["ArrowDown", "ArrowUp"].includes(event.key) &&
            suggestions.length > 0
          ) {
            event.preventDefault();
            setIsOpen(true);
            const direction = event.key === "ArrowDown" ? 1 : -1;
            setActiveIndex((index) =>
              index < 0
                ? direction === 1
                  ? 0
                  : suggestions.length - 1
                : (index + direction + suggestions.length) % suggestions.length,
            );
          } else if (
            event.key === "Enter" &&
            showSuggestions &&
            activeIndex >= 0
          ) {
            event.preventDefault();
            chooseBranch(suggestions[activeIndex]);
          }
        }}
        required
      />
      {showSuggestions && (
        <ul
          id="join-branch-options"
          role="listbox"
          aria-label="Branch suggestions"
          className={styles.suggestions}
        >
          {suggestions.map((branch, index) => (
            <li key={branch} role="presentation">
              <button
                id={`branch-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                tabIndex={-1}
                className={
                  index === activeIndex ? styles.activeSuggestion : undefined
                }
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => chooseBranch(branch)}
              >
                {branch}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function JoinUsForm({
  mode = "join",
}: {
  mode?: "join" | "idea";
}) {
  const isIdeaForm = mode === "idea";
  const fields = isIdeaForm
    ? [...studentFields, ...ideaFields]
    : registrationFields;
  const [details, setDetails] = useState<SubmissionDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const submittingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const clearFieldError = (name: string) => {
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setFormError("");
    setFieldErrors({});
    const form = event.currentTarget;
    const data = new FormData(form);
    const readField = (name: keyof SubmissionDetails) =>
      String(data.get(name) ?? "").trim();
    const values: SubmissionDetails = {
      name: readField("name"),
      phone: readField("phone"),
      email: readField("email"),
      class: readField("class"),
      branch: readField("branch"),
      ...(!isIdeaForm ? { gender: readField("gender") } : {}),
      ...(isIdeaForm
        ? { ideaTitle: readField("ideaTitle"), idea: readField("idea") }
        : {}),
    };

    for (const { name, label } of fields) {
      const input = form.elements.namedItem(name) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;
      input.setCustomValidity(
        values[name] ? "" : `Please enter your ${label.toLowerCase()}.`,
      );
      if (!input.reportValidity()) return;
    }

    if (isIdeaForm) {
      const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;
      const digits = values.phone.replace(/\D/g, "");
      phoneInput.setCustomValidity(
        /^[+0-9 ()-]+$/.test(values.phone) &&
          digits.length >= 10 &&
          digits.length <= 15
          ? ""
          : "Please enter a phone number with 10 to 15 digits, including the country code if needed.",
      );
      if (!phoneInput.reportValidity()) return;
      setDetails(values);
      requestAnimationFrame(() => reviewRef.current?.focus());
      return;
    }

    const { payload, errors } = validateRegistration(values);
    for (const { field, message } of errors) {
      const input = form.elements.namedItem(field) as
        | HTMLInputElement
        | HTMLSelectElement;
      input.setCustomValidity(message);
      if (!input.reportValidity()) return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });
      const result: unknown = await response.json().catch(() => null);
      const body =
        result && typeof result === "object" && !Array.isArray(result)
          ? (result as Record<string, unknown>)
          : {};
      if (response.status === 201 && body.success === true) {
        setSuccessMessage(
          typeof body.message === "string"
            ? body.message
            : "User registered successfully.",
        );
        setDetails({ ...values, ...payload });
        requestAnimationFrame(() => reviewRef.current?.focus());
      } else {
        const nextErrors: Record<string, string> = {};
        if (Array.isArray(body.details)) {
          for (const detail of body.details) {
            if (
              detail &&
              typeof detail === "object" &&
              typeof detail.field === "string" &&
              typeof detail.message === "string" &&
              fields.some(({ name }) => name === detail.field)
            ) {
              nextErrors[detail.field] = detail.message;
            }
          }
        }
        setFieldErrors(nextErrors);
        setFormError(
          typeof body.message === "string"
            ? body.message
            : "We couldn't complete your registration. Please try again.",
        );
        requestAnimationFrame(() => errorRef.current?.focus());
      }
    } catch {
      setFormError(
        "We couldn't confirm your registration. Please check your connection and try again.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setDetails(null);
    requestAnimationFrame(() => {
      (
        formRef.current?.elements.namedItem("name") as HTMLInputElement
      )?.focus();
    });
  };

  return (
    <section className={styles.card} aria-labelledby="form-heading">
      <div className={styles.cardHeader}>
        <h1 id="form-heading" className={styles.cardTitle}>
          {isIdeaForm ? "SUBMIT YOUR IDEA" : "JOIN THE BOOTCAMP"}
        </h1>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={styles.form}
        hidden={details !== null}
        aria-busy={isSubmitting}
      >
        <p className={styles.requiredNote}>All fields are required.</p>
        <fieldset
          className={styles.fields}
          disabled={isSubmitting}
          aria-label="Student details"
        >
          {fields.map(({ name, label }) => (
            <div
              key={name}
              className={`${styles.field} ${!["phone", "email"].includes(name) ? styles.fullWidth : ""}`}
            >
              <label htmlFor={`join-${name}`}>
                {label} <span aria-hidden="true">*</span>
              </label>
              {name === "branch" ? (
                <BranchInput
                  error={fieldErrors.branch}
                  onValueChange={() => clearFieldError("branch")}
                />
              ) : name === "gender" ? (
                <select
                  id="join-gender"
                  name="gender"
                  defaultValue=""
                  required
                  aria-invalid={fieldErrors.gender ? true : undefined}
                  aria-describedby={
                    fieldErrors.gender ? "gender-error" : undefined
                  }
                  onChange={(event) => {
                    event.currentTarget.setCustomValidity("");
                    clearFieldError("gender");
                  }}
                >
                  <option value="" disabled>
                    Select your gender
                  </option>
                  {["Male", "Female"].map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </select>
              ) : name === "idea" ? (
                <>
                  <textarea
                    id="join-idea"
                    name="idea"
                    rows={6}
                    placeholder="Tell us about your idea…"
                    aria-describedby="idea-help"
                    maxLength={5000}
                    onInput={(event) =>
                      event.currentTarget.setCustomValidity("")
                    }
                    required
                  />
                  <p id="idea-help" className={styles.fieldHint}>
                    Describe the problem, your solution, and who it helps.
                  </p>
                </>
              ) : (
                <input
                  id={`join-${name}`}
                  name={name}
                  aria-invalid={fieldErrors[name] ? true : undefined}
                  aria-describedby={
                    fieldErrors[name] ? `${name}-error` : undefined
                  }
                  type={
                    name === "email"
                      ? "email"
                      : name === "phone"
                        ? "tel"
                        : "text"
                  }
                  autoComplete={
                    name === "name"
                      ? "name"
                      : name === "email"
                        ? "email"
                        : name === "phone"
                          ? "tel"
                          : "off"
                  }
                  placeholder={
                    name === "name"
                      ? "Your full name"
                      : name === "phone"
                        ? "Your phone number"
                        : name === "email"
                          ? "you@example.com"
                          : name === "class"
                            ? "e.g. S3 A"
                            : "Give your idea a short title"
                  }
                  maxLength={
                    name === "email" ? 254 : name === "phone" ? 25 : 100
                  }
                  onInput={(event) => {
                    event.currentTarget.setCustomValidity("");
                    clearFieldError(name);
                  }}
                  required
                />
              )}
              {fieldErrors[name] && (
                <p id={`${name}-error`} className={styles.fieldError}>
                  {fieldErrors[name]}
                </p>
              )}
            </div>
          ))}
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
          {isSubmitting ? "Submitting…" : isIdeaForm ? "Submit idea" : "Submit"}{" "}
          <FiArrowUpRight aria-hidden="true" />
        </button>
      </form>

      {details && (
        <div
          ref={reviewRef}
          className={styles.review}
          tabIndex={-1}
          aria-labelledby="review-heading"
        >
          <h3 id="review-heading">
            {isIdeaForm ? "Your idea" : "Registration successful"}
          </h3>
          <p>
            {isIdeaForm
              ? "Your idea has not been submitted. Idea submissions will be available soon."
              : successMessage}
          </p>
          <dl className={styles.reviewList}>
            {fields.map(({ name, label }) => (
              <div key={name}>
                <dt>{label}</dt>
                <dd>{details[name]}</dd>
              </div>
            ))}
          </dl>
          {isIdeaForm ? (
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleEdit}
            >
              Edit details <FiEdit2 aria-hidden="true" />
            </button>
          ) : (
            <Link href="/" className={styles.submitButton}>
              Back to bootcamp <FiArrowUpRight aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
