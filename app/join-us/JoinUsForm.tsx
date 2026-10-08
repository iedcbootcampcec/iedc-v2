"use client";

import { useRef, useState, type SubmitEvent } from "react";
import Link from "next/link";
import * as Select from "@radix-ui/react-select";
import {
  FiArrowUpRight,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
} from "react-icons/fi";
import {
  registerUser,
  validateRegistrationInput,
} from "../services/registrationService";
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

export const branches = [
  "Computer Science",
  "Computer Science(AI & ML)",
  "Electronics Engineering",
  "Electrical Engineering",
  "Other",
] as const;

export interface RadixSelectOption {
  value: string;
  label: string;
}

export function RadixSelect({
  id,
  name,
  value,
  defaultValue,
  placeholder,
  options,
  error,
  disabled,
  onValueChange,
  required,
}: {
  id: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder: string;
  options: readonly (string | RadixSelectOption)[];
  error?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  required?: boolean;
}) {
  const normalizedOptions: RadixSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt,
  );

  return (
    <Select.Root
      name={name}
      value={value || undefined}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      required={required}
    >
      <Select.Trigger
        id={id}
        className={styles.selectTrigger}
        aria-label={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name || id}-error` : undefined}
      >
        <Select.Value placeholder={placeholder} className={styles.selectValue} />
        <Select.Icon className={styles.selectIcon}>
          <FiChevronDown aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={styles.selectContent}
          position="popper"
          sideOffset={4}
        >
          <Select.ScrollUpButton className={styles.selectScrollButton}>
            <FiChevronUp aria-hidden="true" />
          </Select.ScrollUpButton>
          <Select.Viewport className={styles.selectViewport}>
            {normalizedOptions.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className={styles.selectItem}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className={styles.selectItemIndicator}>
                  <FiCheck aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className={styles.selectScrollButton}>
            <FiChevronDown aria-hidden="true" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export interface BranchInputProps {
  error?: string;
  onValueChange?: () => void;
  name?: string;
  id?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function BranchInput({
  error,
  onValueChange,
  name = "branch",
  id = "join-branch",
  value: controlledValue,
  onChange,
  placeholder = "Select your branch",
  disabled,
}: BranchInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const [customBranch, setCustomBranch] = useState("");
  const currentValue =
    controlledValue !== undefined ? controlledValue : internalValue;

  const isPredefined = branches.some((b) => b === currentValue);
  const isOther =
    currentValue === "Other" || (!isPredefined && currentValue !== "");
  const selectValue = isPredefined
    ? currentValue
    : currentValue
      ? "Other"
      : "";

  const handleSelect = (val: string) => {
    let finalVal = val;
    if (val === "Other") {
      finalVal = customBranch.trim() || "Other";
    }
    if (controlledValue === undefined) {
      setInternalValue(finalVal);
    }
    onChange?.(finalVal);
    onValueChange?.();
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomBranch(text);
    const finalVal = text.trim() || "Other";
    if (controlledValue === undefined) {
      setInternalValue(finalVal);
    }
    onChange?.(finalVal);
    onValueChange?.();
  };

  return (
    <div className={styles.branchControl}>
      <RadixSelect
        id={id}
        name={isOther ? undefined : name}
        value={selectValue}
        onValueChange={handleSelect}
        placeholder={placeholder}
        options={branches}
        error={error}
        disabled={disabled}
      />
      {isOther && (
        <input
          id={`${id}-custom`}
          name={name}
          type="text"
          className={styles.customBranchInput}
          placeholder="Please specify your branch"
          value={customBranch}
          maxLength={100}
          onChange={handleCustomChange}
          required
        />
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
  const [gender, setGender] = useState("");
  const [branch, setBranch] = useState("");
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
      branch: branch.trim() || readField("branch"),
      ...(!isIdeaForm ? { gender: gender.trim() || readField("gender") } : {}),
      ...(isIdeaForm
        ? { ideaTitle: readField("ideaTitle"), idea: readField("idea") }
        : {}),
    };

    const nextFieldErrors: Record<string, string> = {};
    for (const { name, label } of fields) {
      if (!values[name]) {
        nextFieldErrors[name] =
          name === "gender" || name === "branch"
            ? `Please select your ${label.toLowerCase()}.`
            : `Please enter your ${label.toLowerCase()}.`;
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      for (const { name } of fields) {
        if (nextFieldErrors[name]) {
          const el = document.getElementById(`join-${name}`);
          el?.focus();
          break;
        }
      }
      return;
    }

    if (isIdeaForm) {
      const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;
      const digits = values.phone.replace(/\D/g, "");
      const isPhoneValid =
        /^[+0-9 ()-]+$/.test(values.phone) &&
        digits.length >= 10 &&
        digits.length <= 15;
      if (!isPhoneValid) {
        setFieldErrors((prev) => ({
          ...prev,
          phone:
            "Please enter a phone number with 10 to 15 digits, including the country code if needed.",
        }));
        phoneInput?.focus();
        return;
      }
      setDetails(values);
      requestAnimationFrame(() => reviewRef.current?.focus());
      return;
    }

    const validation = validateRegistrationInput({
      name: values.name,
      gender: values.gender || "",
      phone: values.phone,
      email: values.email,
      branch: values.branch,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstField = Object.keys(validation.errors)[0];
      const el = document.getElementById(`join-${firstField}`);
      if (el) {
        el.focus();
      } else {
        const input = form.elements.namedItem(firstField) as
          | HTMLInputElement
          | null;
        input?.focus();
      }
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = await registerUser({
        name: values.name.trim(),
        gender: (values.gender || "").trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        ...(values.branch?.trim() ? { branch: values.branch.trim() } : {}),
      });

      if (result.success) {
        setSuccessMessage(result.message);
        setDetails({
          ...values,
          name: result.data.name,
          gender: result.data.gender,
          phone: result.data.phone,
          email: result.data.email,
          branch: result.data.branch ?? values.branch,
        });
        requestAnimationFrame(() => reviewRef.current?.focus());
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          const firstField = Object.keys(result.fieldErrors)[0];
          const el = document.getElementById(`join-${firstField}`);
          el?.focus();
        }
        setFormError(result.message);
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
                  value={branch}
                  onChange={(val) => {
                    setBranch(val);
                    clearFieldError("branch");
                  }}
                  error={fieldErrors.branch}
                  onValueChange={() => clearFieldError("branch")}
                  disabled={isSubmitting}
                />
              ) : name === "gender" ? (
                <RadixSelect
                  id="join-gender"
                  name="gender"
                  value={gender}
                  onValueChange={(val) => {
                    setGender(val);
                    clearFieldError("gender");
                  }}
                  placeholder="Select your gender"
                  options={["Male", "Female", "Other"]}
                  error={fieldErrors.gender}
                  disabled={isSubmitting}
                  required
                />
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
