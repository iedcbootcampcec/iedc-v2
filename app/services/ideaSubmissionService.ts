import { API_ENDPOINTS } from "../constants/api";
import type {
  SubmitIdeaRequest,
  SubmitIdeaApiResponse,
  SubmitIdeaResult,
} from "../types/idea-submission";

export const MAX_IDEA_TEAM_SIZE = 6;

export function validateIdeaSubmissionInput(input: SubmitIdeaRequest): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const name = input.name.trim();
  if (!name) {
    errors.name = "Please enter your name.";
  } else if (name.length < 2 || name.length > 100) {
    errors.name = "Name must be between 2 and 100 characters.";
  }

  const gender = input.gender.trim();
  if (!gender) {
    errors.gender = "Please select your gender.";
  } else if (gender.length > 50) {
    errors.gender = "Gender must be at most 50 characters.";
  }

  const phone = input.phone.trim();
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else {
    const digits = phone.replace(/\D/g, "");
    const normalizedDigits =
      digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits.length === 11 && digits.startsWith("0")
          ? digits.slice(1)
          : digits;

    if (!/^[6-9]\d{9}$/.test(normalizedDigits)) {
      errors.phone =
        "Please provide a valid 10-digit Indian mobile number starting with 6–9.";
    }
  }

  const email = input.email.trim();
  if (!email) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const className = input.class.trim();
  if (!className) {
    errors.class = "Please enter your class.";
  } else if (className.length > 50) {
    errors.class = "Class must be at most 50 characters.";
  }

  if (input.branch && input.branch.trim().length > 100) {
    errors.branch = "Branch must be at most 100 characters.";
  }

  const idea = input.idea.trim();
  if (!idea) {
    errors.idea = "Please describe your idea.";
  } else if (idea.length < 10) {
    errors.idea = "Idea description must be at least 10 characters.";
  } else if (idea.length > 10000) {
    errors.idea = "Idea description must be at most 10,000 characters.";
  }

  if (input.teammates && input.teammates.length > 0) {
    if (input.teammates.length + 1 > MAX_IDEA_TEAM_SIZE) {
      errors.teammates = `A team can have at most ${MAX_IDEA_TEAM_SIZE} members.`;
    }

    input.teammates.forEach((mate, index) => {
      const prefix = `teammates.${index}.`;
      const mateName = (mate.name || "").trim();
      if (!mateName) {
        errors[`${prefix}name`] = "Teammate name is required.";
      }

      if (mate.gender && mate.gender.trim().length > 50) {
        errors[`${prefix}gender`] = "Gender must be at most 50 characters.";
      }

      if (mate.phone && mate.phone.trim()) {
        const digits = mate.phone.trim().replace(/\D/g, "");
        const normalizedDigits =
          digits.length === 12 && digits.startsWith("91")
            ? digits.slice(2)
            : digits.length === 11 && digits.startsWith("0")
              ? digits.slice(1)
              : digits;
        if (!/^[6-9]\d{9}$/.test(normalizedDigits)) {
          errors[`${prefix}phone`] =
            "Please provide a valid 10-digit Indian mobile number starting with 6–9.";
        }
      }

      if (mate.email && mate.email.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mate.email.trim())) {
          errors[`${prefix}email`] = "Please enter a valid email address.";
        }
      }

      if (mate.branch && mate.branch.trim().length > 100) {
        errors[`${prefix}branch`] = "Branch must be at most 100 characters.";
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function submitIdea(
  data: SubmitIdeaRequest,
  options?: { signal?: AbortSignal }
): Promise<SubmitIdeaResult> {
  try {
    const response = await fetch(API_ENDPOINTS.SUBMIT_IDEA, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: options?.signal ?? AbortSignal.timeout(25000),
    });

    const body = (await response.json().catch(() => null)) as SubmitIdeaApiResponse | null;

    if (response.status === 201 && body?.success) {
      return {
        success: true,
        message: body.message || "Idea submitted successfully",
        data: body.data,
      };
    }

    const fieldErrors: Record<string, string> = {};
    const message =
      (body && typeof body.message === "string" && body.message) ||
      "We couldn't submit your idea. Please try again.";

    if (body && !body.success && Array.isArray(body.details)) {
      for (const detail of body.details) {
        if (detail && typeof detail.field === "string" && typeof detail.message === "string") {
          fieldErrors[detail.field] = detail.message;
        }
      }
    }

    return {
      success: false,
      message,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === "AbortError";
    return {
      success: false,
      message: isAbort
        ? "Request timed out. Please try again."
        : "We couldn't confirm your idea submission. Please check your connection and try again.",
    };
  }
}
