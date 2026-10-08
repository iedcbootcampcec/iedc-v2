import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "../submit-idea.module.css";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  asChild?: boolean;
  error?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, asChild = false, error, ...props }, ref) => {
    const Comp = asChild ? Slot : "input";
    return (
      <Comp
        ref={ref}
        className={`${styles.textField} ${className || ""}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    );
  },
);
TextField.displayName = "TextField";
