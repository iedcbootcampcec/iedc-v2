export interface Teammate {
  name: string;
  phone: string;
  gender: string;
  email: string;
  college: string;
}

export interface TicketData {
  message: string;
  teamId: number;
  ticket: string;
  eventName: string;
  teamName: string;
  game: string;
}

export type GameType = "mini_militia" | "efootball";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";
