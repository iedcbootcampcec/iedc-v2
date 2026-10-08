export const API_BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL!;

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/register`,
  SUBMIT_IDEA: `${API_BASE_URL}/submit-idea`,
} as const;
