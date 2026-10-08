"use client";

import * as React from "react";
import { useState } from "react";
import { RadixSelect } from "./RadixSelect";
import styles from "../submit-idea.module.css";

export const BRANCHES = [
  "Computer Science",
  "Computer Science(AI & ML)",
  "Electronics Engineering",
  "Electrical Engineering",
  "Other",
] as const;

export interface BranchSelectProps {
  id: string;
  name: string;
  error?: string;
  onValueChange?: () => void;
  disabled?: boolean;
}

export function BranchSelect({
  id,
  name,
  error,
  onValueChange,
  disabled,
}: BranchSelectProps) {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [customBranch, setCustomBranch] = useState("");

  const isPredefined = BRANCHES.some((b) => b === selectedBranch);
  const isOther =
    selectedBranch === "Other" || (!isPredefined && selectedBranch !== "");

  const handleSelect = (val: string) => {
    setSelectedBranch(val);
    onValueChange?.();
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomBranch(e.target.value);
    onValueChange?.();
  };

  return (
    <div className={styles.branchControl}>
      <RadixSelect
        id={id}
        name={isOther ? undefined : name}
        value={selectedBranch}
        onValueChange={handleSelect}
        placeholder="Type or select your branch"
        options={BRANCHES}
        error={error}
        disabled={disabled}
      />
      {isOther && (
        <input
          id={`${id}-custom`}
          name={name}
          type="text"
          className={`${styles.textField} ${styles.customBranchInput}`}
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
