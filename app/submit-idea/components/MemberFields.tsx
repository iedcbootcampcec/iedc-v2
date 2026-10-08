"use client";

import type { IdeaMember } from "@/app/types/idea-submission";
import { RadixSelect } from "./RadixSelect";
import { BranchSelect } from "./BranchSelect";
import { TextField } from "./TextField";
import styles from "../submit-idea.module.css";

export const memberFields: {
  name: keyof IdeaMember;
  label: string;
  placeholder: string;
}[] = [
  { name: "name", label: "Name", placeholder: "Full name" },
  { name: "gender", label: "Gender", placeholder: "Select gender" },
  { name: "phone", label: "Phone number", placeholder: "Phone number" },
  { name: "email", label: "Email", placeholder: "you@example.com" },
  { name: "class", label: "Class", placeholder: "e.g. S3 A" },
  {
    name: "branch",
    label: "Branch",
    placeholder: "Type or select your branch",
  },
];

export interface MemberFieldsProps {
  prefix?: string;
  errors: Record<string, string>;
  clearError: (name: string) => void;
  disabled?: boolean;
}

export function MemberFields({
  prefix = "",
  errors,
  clearError,
  disabled,
}: MemberFieldsProps) {
  return memberFields.map(({ name, label, placeholder }) => {
    const field = `${prefix}${name}`;
    const id = `idea-${field}`;
    const error = errors[field];
    return (
      <div
        key={name}
        className={`${styles.field} ${!["phone", "email"].includes(name) ? styles.fullWidth : ""}`}
      >
        <label htmlFor={id}>
          {label} <span aria-hidden="true">*</span>
        </label>
        {name === "branch" ? (
          <BranchSelect
            name={field}
            id={id}
            error={error}
            onValueChange={() => clearError(field)}
            disabled={disabled}
          />
        ) : name === "gender" ? (
          <RadixSelect
            id={id}
            name={field}
            placeholder={placeholder}
            options={["Male", "Female", "Other"]}
            error={error}
            onValueChange={() => clearError(field)}
            disabled={disabled}
            required
          />
        ) : (
          <TextField
            id={id}
            name={field}
            required
            placeholder={placeholder}
            type={
              name === "email" ? "email" : name === "phone" ? "tel" : "text"
            }
            autoComplete={
              prefix
                ? "off"
                : name === "name"
                  ? "name"
                  : name === "email"
                    ? "email"
                    : name === "phone"
                      ? "tel"
                      : "off"
            }
            maxLength={name === "email" ? 254 : name === "phone" ? 25 : 100}
            error={error}
            aria-describedby={error ? `${field}-error` : undefined}
            onInput={(event) => {
              event.currentTarget.setCustomValidity("");
              clearError(field);
            }}
            disabled={disabled}
          />
        )}
        {error && (
          <p id={`${field}-error`} className={styles.fieldError}>
            {error}
          </p>
        )}
      </div>
    );
  });
}
