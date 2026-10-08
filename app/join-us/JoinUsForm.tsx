"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { FiArrowUpRight, FiEdit2 } from "react-icons/fi";
import styles from "./join-us.module.css";

export interface JoinUsDetails {
  name: string;
  phone: string;
  email: string;
  class: string;
  branch: string;
}

const fields: { name: keyof JoinUsDetails; label: string }[] = [
  { name: "name", label: "Name" },
  { name: "phone", label: "Phone number" },
  { name: "email", label: "Email" },
  { name: "class", label: "Class" },
  { name: "branch", label: "Branch" },
];

const branches = [
  "Computer Science",
  "Computer Science(AI & ML)",
  "Electronics Engineering",
  "Electrical Engineering",
];

function BranchInput() {
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
        aria-controls={showSuggestions ? "join-branch-options" : undefined}
        aria-activedescendant={showSuggestions && activeIndex >= 0 ? `branch-option-${activeIndex}` : undefined}
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
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            setIsOpen(false);
            setActiveIndex(-1);
          } else if (["ArrowDown", "ArrowUp"].includes(event.key) && suggestions.length > 0) {
            event.preventDefault();
            setIsOpen(true);
            const direction = event.key === "ArrowDown" ? 1 : -1;
            setActiveIndex((index) => index < 0
              ? direction === 1 ? 0 : suggestions.length - 1
              : (index + direction + suggestions.length) % suggestions.length);
          } else if (event.key === "Enter" && showSuggestions && activeIndex >= 0) {
            event.preventDefault();
            chooseBranch(suggestions[activeIndex]);
          }
        }}
        required
      />
      {showSuggestions && (
        <ul id="join-branch-options" role="listbox" aria-label="Branch suggestions" className={styles.suggestions}>
          {suggestions.map((branch, index) => (
            <li key={branch} role="presentation">
              <button
                id={`branch-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                tabIndex={-1}
                className={index === activeIndex ? styles.activeSuggestion : undefined}
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

export default function JoinUsForm() {
  const [details, setDetails] = useState<JoinUsDetails | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = Object.fromEntries(
      fields.map(({ name }) => [name, String(data.get(name) ?? "").trim()]),
    ) as unknown as JoinUsDetails;

    for (const { name, label } of fields) {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      input.setCustomValidity(
        values[name] ? "" : `Please enter your ${label.toLowerCase()}.`,
      );
      if (!input.reportValidity()) return;
    }

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
          JOIN THE BOOTCAMP
        </h1>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={styles.form}
        hidden={details !== null}
      >
        <p className={styles.requiredNote}>All fields are required.</p>
        <div className={styles.fields}>
          {fields.map(({ name, label }) => (
            <div
              key={name}
              className={`${styles.field} ${["name", "class", "branch"].includes(name) ? styles.fullWidth : ""}`}
            >
              <label htmlFor={`join-${name}`}>
                {label} <span aria-hidden="true">*</span>
              </label>
              {name === "branch" ? <BranchInput /> : (
                <input
                  id={`join-${name}`}
                  name={name}
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
                            : "Type or select your branch"
                  }
                  maxLength={
                    name === "email" ? 254 : name === "phone" ? 25 : 100
                  }
                  onInput={(event) => event.currentTarget.setCustomValidity("")}
                  required
                />
              )}
            </div>
          ))}
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit <FiArrowUpRight aria-hidden="true" />
        </button>
      </form>

      {details && (
        <div
          ref={reviewRef}
          className={styles.review}
          tabIndex={-1}
          aria-labelledby="review-heading"
        >
          <h3 id="review-heading">Your details</h3>
          <p>
            Your details have not been submitted. Registration submissions will
            be available soon.
          </p>
          <dl className={styles.reviewList}>
            {fields.map(({ name, label }) => (
              <div key={name}>
                <dt>{label}</dt>
                <dd>{details[name]}</dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleEdit}
          >
            Edit details <FiEdit2 aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
