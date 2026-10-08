import { API_ENDPOINTS } from "../constants/api";
import type {
  RegisterRequest,
  RegisterApiResponse,
  RegistrationResult,
} from "../types/registration";

export function validateRegistrationInput(input: {
  name: string;
  gender: string;
  phone: string;
  email: string;
  branch?: string;
}): { isValid: boolean; errors: Record<string, string> } {
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

  if (input.branch && input.branch.trim().length > 100) {
    errors.branch = "Branch must be at most 100 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function registerUser(
  data: RegisterRequest,
  options?: { signal?: AbortSignal }
): Promise<RegistrationResult> {
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: options?.signal ?? AbortSignal.timeout(20000),
    });

    const body = (await response.json().catch(() => null)) as RegisterApiResponse | null;

    if (response.status === 201 && body?.success) {
      return {
        success: true,
        message: body.message || "User registered successfully",
        data: body.data,
      };
    }

    const fieldErrors: Record<string, string> = {};
    const message =
      (body && typeof body.message === "string" && body.message) ||
      "We couldn't complete your registration. Please try again.";

    // 400 Bad Request validation details
    if (body && !body.success && Array.isArray(body.details)) {
      for (const detail of body.details) {
        if (detail && typeof detail.field === "string" && typeof detail.message === "string") {
          fieldErrors[detail.field] = detail.message;
        }
      }
    }

    // 409 Conflict handling for email and phone conflicts
    if (response.status === 409 || (body && !body.success && body.error === "ConflictError")) {
      const lowerMsg = message.toLowerCase();
      const hasEmailConflict = lowerMsg.includes("email");
      const hasPhoneConflict = lowerMsg.includes("phone");

      if (hasEmailConflict && hasPhoneConflict) {
        fieldErrors.email = "A user with this email already exists.";
        fieldErrors.phone = "A user with this phone number already exists.";
      } else if (hasEmailConflict) {
        fieldErrors.email = "A user with this email already exists.";
      } else if (hasPhoneConflict) {
        fieldErrors.phone = "A user with this phone number already exists.";
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
        : "We couldn't confirm your registration. Please check your connection and try again.",
    };
  }
}
