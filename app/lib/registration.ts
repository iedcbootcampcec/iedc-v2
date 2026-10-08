export interface RegistrationPayload {
  name: string;
  gender: string;
  phone: string;
  email: string;
  branch?: string;
}

export interface RegistrationFieldError {
  field: keyof RegistrationPayload;
  message: string;
}

export function getContactConflictDetails(body: Record<string, unknown>): {
  field: string;
  message: string;
}[] {
  const details = Array.isArray(body.details)
    ? body.details.flatMap((detail) =>
        detail &&
        typeof detail === "object" &&
        typeof detail.field === "string" &&
        typeof detail.message === "string"
          ? [{ field: detail.field, message: detail.message }]
          : [],
      )
    : [];
  if (details.length) return details;
  const message = typeof body.message === "string" ? body.message : "";
  if (/\bteammates?\b/i.test(message)) return details;
  if (/\be-?mail\b/i.test(message)) {
    details.push({
      field: "email",
      message: "This email address is already in use.",
    });
  }
  if (/\b(phone|mobile)\b/i.test(message)) {
    details.push({
      field: "phone",
      message: "This mobile number is already in use.",
    });
  }
  return details;
}

export function normalizeIndianPhone(value: string): string | null {
  if (!/^\+?[\d\s()-]+$/.test(value.trim())) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0"))
    digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export function validateRegistration(input: unknown): {
  payload: RegistrationPayload;
  errors: RegistrationFieldError[];
} {
  const source =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const read = (field: string) =>
    typeof source[field] === "string" ? source[field].trim() : "";
  const phone = normalizeIndianPhone(read("phone"));
  const payload: RegistrationPayload = {
    name: read("name"),
    gender: read("gender"),
    phone: phone ?? "",
    email: read("email").toLowerCase(),
    ...(read("branch") ? { branch: read("branch") } : {}),
  };
  const errors: RegistrationFieldError[] = [];
  if (payload.name.length < 2 || payload.name.length > 100) {
    errors.push({
      field: "name",
      message: "Name must contain 2 to 100 characters.",
    });
  }
  if (!payload.gender || payload.gender.length > 50) {
    errors.push({ field: "gender", message: "Please select your gender." });
  }
  if (!phone) {
    errors.push({
      field: "phone",
      message: "Enter a valid 10-digit Indian mobile number starting with 6–9.",
    });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push({ field: "email", message: "Enter a valid email address." });
  }
  if (payload.branch && payload.branch.length > 100) {
    errors.push({
      field: "branch",
      message: "Branch must contain at most 100 characters.",
    });
  }
  return { payload, errors };
}

export async function handleRegistration(
  request: Request,
  {
    baseUrl,
    fetchImpl = fetch,
  }: { baseUrl?: string; fetchImpl?: typeof fetch },
): Promise<Response> {
  const respond = (body: unknown, status: number) =>
    Response.json(body, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return respond(
      { success: false, message: "Invalid registration request." },
      400,
    );
  }
  const { payload, errors } = validateRegistration(input);
  if (errors.length) {
    return respond(
      {
        success: false,
        error: "Validation failed",
        message: "Please check your details.",
        details: errors,
      },
      400,
    );
  }
  if (!baseUrl) {
    return respond(
      {
        success: false,
        message:
          "Registration is temporarily unavailable. Please try again later.",
      },
      503,
    );
  }

  try {
    const url = new URL("register", `${baseUrl.replace(/\/+$/, "")}/`);
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const result: unknown = await response.json().catch(() => null);
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return respond(
        {
          success: false,
          message: "We couldn't confirm your registration. Please try again.",
        },
        502,
      );
    }
    const body = result as Record<string, unknown>;
    if (response.status === 201 && body.success === true) {
      return respond(body, 201);
    }
    if (response.status === 400 || response.status === 409) {
      const details =
        response.status === 409
          ? getContactConflictDetails(body)
          : body.details;
      return respond(
        {
          success: false,
          message:
            typeof body.message === "string"
              ? body.message
              : "Registration failed. Please check your details.",
          ...(Array.isArray(details) && details.length ? { details } : {}),
        },
        response.status,
      );
    }
    return respond(
      {
        success: false,
        message:
          "We couldn't complete your registration. Please try again later.",
      },
      502,
    );
  } catch {
    return respond(
      {
        success: false,
        message:
          "We couldn't reach the registration service. Please try again.",
      },
      503,
    );
  }
}
