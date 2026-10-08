"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import { FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";
import styles from "../submit-idea.module.css";

export interface RadixSelectOption {
  value: string;
  label: string;
}

export interface RadixSelectProps {
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
}: RadixSelectProps) {
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
