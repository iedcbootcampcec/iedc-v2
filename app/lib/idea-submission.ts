import { validateRegistration } from "./registration";

// Includes the team leader. Shared by the form and API validation.
export const MAX_IDEA_TEAM_SIZE = 6;

export interface IdeaMember {
  name: string;
  gender: string;
  phone: string;
  email: string;
  class: string;
  branch: string;
}

export interface IdeaSubmissionPayload extends IdeaMember {
  idea: string;
  teamname: string | null;
  teammates: IdeaMember[] | null;
}

export interface IdeaFieldError {
  field: string;
  message: string;
}

export function validateIdeaSubmission(input: unknown): {
  payload: IdeaSubmissionPayload;
  errors: IdeaFieldError[];
} {
  const source = input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown> : {};
  const errors: IdeaFieldError[] = [];
  const member = (value: unknown, prefix = ""): IdeaMember => {
    const record = value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown> : {};
    const { payload, errors: memberErrors } = validateRegistration(record);
    errors.push(...memberErrors.map((error) => ({ ...error, field: `${prefix}${error.field}` })));
    const className = typeof record.class === "string" ? record.class.trim() : "";
    if (!className) errors.push({ field: `${prefix}class`, message: "Class is required." });
    if (!payload.branch) errors.push({ field: `${prefix}branch`, message: "Branch is required." });
    return { ...payload, class: className, branch: payload.branch ?? "" };
  };
  const leader = member(source);
  const idea = typeof source.idea === "string" ? source.idea.trim() : "";
  if (idea.length < 10) errors.push({ field: "idea", message: "Idea description must be at least 10 characters." });
  let teamname: string | null = null;
  if (source.teamname != null) {
    if (typeof source.teamname !== "string") {
      errors.push({ field: "teamname", message: "Team name must be text or null." });
    } else {
      teamname = source.teamname.trim() || null;
    }
  }
  let teammates: IdeaMember[] | null = null;
  if (source.teammates != null) {
    if (!Array.isArray(source.teammates)) {
      errors.push({ field: "teammates", message: "Teammates must be a list or null." });
    } else if (source.teammates.length > MAX_IDEA_TEAM_SIZE - 1) {
      errors.push({ field: "teammates", message: `A team can have at most ${MAX_IDEA_TEAM_SIZE} members, including the leader.` });
    } else if (source.teammates.length) {
      teammates = source.teammates.map((value, index) => member(value, `teammates.${index}.`));
    }
  }
  // Contacts must be unique within this team; reuse across submissions is allowed.
  const members = [
    { value: leader, prefix: "", label: "the team leader" },
    ...(teammates ?? []).map((value, index) => ({ value, prefix: `teammates.${index}.`, label: `teammate ${index + 1}` })),
  ];
  for (const field of ["phone", "email"] as const) {
    const seen = new Map<string, { path: string; label: string }>();
    const contactLabel = field === "phone" ? "mobile number" : "email address";
    for (const { value, prefix, label } of members) {
      const contact = value[field];
      if (!contact || (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))) continue;
      const path = `${prefix}${field}`;
      const previous = seen.get(contact);
      if (previous) {
        const addError = (errorPath: string, otherMember: string) => {
          if (!errors.some(({ field: existingField }) => existingField === errorPath)) {
            errors.push({ field: errorPath, message: `This ${contactLabel} is also used by ${otherMember}. Each member must have a unique ${contactLabel}.` });
          }
        };
        addError(previous.path, label);
        addError(path, previous.label);
      } else {
        seen.set(contact, { path, label });
      }
    }
  }
  return { payload: { ...leader, idea, teamname, teammates }, errors };
}

export async function handleIdeaSubmission(
  request: Request,
  { baseUrl, fetchImpl = fetch }: { baseUrl?: string; fetchImpl?: typeof fetch },
): Promise<Response> {
  const respond = (body: unknown, status: number) => Response.json(body, {
    status, headers: { "Cache-Control": "no-store" },
  });
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return respond({ success: false, message: "Invalid idea submission request." }, 400);
  }
  const { payload, errors } = validateIdeaSubmission(input);
  if (errors.length) {
    return respond({ success: false, error: "Validation failed", message: "Please check your idea submission details.", details: errors }, 400);
  }
  if (!baseUrl) {
    return respond({ success: false, message: "Idea submissions are temporarily unavailable. Please try again later." }, 503);
  }
  try {
    const response = await fetchImpl(new URL("submit-idea", `${baseUrl.replace(/\/+$/, "")}/`), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    const result: unknown = await response.json().catch(() => null);
    const body = result && typeof result === "object" && !Array.isArray(result)
      ? result as Record<string, unknown> : {};
    if (response.status === 201 && body.success === true) return respond(body, 201);
    if (response.status === 400 || response.status === 409) {
      return respond({
        success: false,
        message: typeof body.message === "string" ? body.message : "Please check your idea submission details.",
        ...(Array.isArray(body.details) && body.details.length ? { details: body.details } : {}),
      }, response.status);
    }
    return respond({ success: false, message: "We couldn't confirm your idea submission. Please try again later." }, 502);
  } catch {
    return respond({ success: false, message: "We couldn't reach the idea submission service. Please try again." }, 503);
  }
}
