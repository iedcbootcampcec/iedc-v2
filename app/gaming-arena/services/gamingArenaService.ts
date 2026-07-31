import type { TicketData } from "../types";

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_IDEATHON_API_URL!;

  if (!url) {
    throw new Error(
      "Service is currently unavailable. Please try again later.",
    );
  }

  return url;
};

const extractErrorMessage = (
  resData: Record<string, any>,
  status: number,
): string =>
  resData.message ||
  resData.error ||
  (Array.isArray(resData.errors) ? resData.errors.join(", ") : null) ||
  `Registration failed (HTTP ${status}). Please try again.`;

export const uploadPaymentScreenshot = async (file: File): Promise<string> => {
  const baseUrl = getBaseUrl();

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${baseUrl}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(
      `Payment screenshot upload failed (HTTP ${res.status}). Please try again.`,
    );
  }

  const data = await res.json();
  const key: string = data.objectKey || data.key;

  if (!key) {
    throw new Error(
      "Payment screenshot upload succeeded but no key was returned. Please contact support.",
    );
  }

  return key;
};

export const registerTeam = async (
  payload: Record<string, unknown>,
): Promise<TicketData> => {
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}/events/gaming-arena`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const resData = await res.json().catch(() => ({}));

  if (res.status === 200 || res.status === 201) {
    if (!resData?.ticket) {
      throw new Error(
        "Registration response was incomplete. Please contact support.",
      );
    }
    return resData as TicketData;
  }

  const errMsg = extractErrorMessage(resData, res.status);
  throw new Error(errMsg);
};
