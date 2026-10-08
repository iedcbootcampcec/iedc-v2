import { handleRegistration } from "../../lib/registration";

export async function POST(request: Request) {
  return handleRegistration(request, { baseUrl: process.env.BASE_URL });
}
