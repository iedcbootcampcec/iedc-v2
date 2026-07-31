import type { Teammate } from "./types";

export const isValidPhone = (num: string): boolean =>
  /^[6-9]\d{9}$/.test(num);

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const sanitizePhone = (val: string): string =>
  val.replace(/\D/g, "").slice(0, 10);

export const emptyTeammate = (): Teammate => ({
  name: "",
  phone: "",
  gender: "",
  email: "",
  college: "",
});
