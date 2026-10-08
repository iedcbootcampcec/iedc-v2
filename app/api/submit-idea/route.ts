import { handleIdeaSubmission } from "../../lib/idea-submission";

export async function POST(request: Request) {
  return handleIdeaSubmission(request, { baseUrl: process.env.BASE_URL });
}
