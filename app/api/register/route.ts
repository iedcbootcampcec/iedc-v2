import { handleRegistration } from "../../lib/registration";

export async function POST(request: Request) {
  return handleRegistration(request, {
    baseUrl: process.env.NEXT_PUBLIC_WEB_BASE_URL,
  });
}
