export interface TeamMember {
  user_id: string;
  name: string;
}

export interface TeamMembersDetails {
  members: TeamMember[];
  leader_name: string;
  isFallback?: boolean;
}

export interface UpdateMembersPayload {
  leader_gender: string;
  members: {
    user_id: string;
    gender: string;
  }[];
}

const baseUrl = process.env.NEXT_PUBLIC_IDEATHON_API_URL!;

export interface FindTeamResult {
  team_id: string;
  team_name: string;
  has_submission?: boolean;
  submission?: string | null;
}

export async function findTeamByName(
  inputTeamName: string,
): Promise<FindTeamResult> {
  const queryName = inputTeamName.trim();

  try {
    const res = await fetch(`${baseUrl}/teams/find`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ team_name: queryName.trim() }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.team_id && !data.error) {
      const submissionUrl =
        data.submission ||
        data.submission_url ||
        data.pitch_deck ||
        data.pitch_deck_url ||
        data.submission_link ||
        data.idea ||
        null;

      const isSubmitted =
        Boolean(data.has_submission) ||
        Boolean(data.has_submitted) ||
        Boolean(data.is_submitted) ||
        Boolean(data.submitted) ||
        Boolean(data.already_submitted) ||
        Boolean(data.isSubmitted) ||
        Boolean(data.hasSubmitted) ||
        data.status === "submitted" ||
        data.status === "completed" ||
        Boolean(submissionUrl);

      return {
        team_id: String(data.team_id),
        team_name: data.team_name || queryName,
        has_submission: isSubmitted,
        submission: typeof submissionUrl === "string" ? submissionUrl : null,
      };
    }
  } catch (err) {
    console.warn(`[findTeamByName] POST /teams/find error:`, err);
  }

  throw new Error("No team found with that name. Please check and try again.");
}

export async function fetchTeamMembers(
  teamId: number | string,
): Promise<TeamMembersDetails> {
  try {
    const res = await fetch(`${baseUrl}/teams/members/${teamId}`);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `HTTP ${res.status}`,
      );
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(
      `[fetchTeamMembers] Backend endpoint GET /teams/members/${teamId} returned error:`,
      err,
    );
    return {
      leader_name: "Team Leader",
      members: [
        { user_id: `mem_${teamId}_1`, name: "Member 1" },
        { user_id: `mem_${teamId}_2`, name: "Member 2" },
      ],
      isFallback: true,
    };
  }
}

export async function updateTeamMembers(
  teamId: number | string,
  payload: UpdateMembersPayload,
) {
  const res = await fetch(`${baseUrl}/teams/members/update/${teamId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      resData.message || resData.error || "Failed to update team members.",
    );
  }

  return resData;
}

export async function submitIdea(teamId: number | string, submission: string) {
  const parsedId =
    typeof teamId === "number"
      ? teamId
      : !isNaN(Number(teamId)) && teamId !== ""
      ? Number(teamId)
      : teamId;

  const payload = {
    team_id: parsedId,
    submission: submission,
  };

  const res = await fetch(`${baseUrl}/teams/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const resData = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      resData.error || resData.message || "Failed to submit project. Please try again.",
    );
  }

  return resData;
}

export async function uploadPdfToDrive(file: File, teamName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("team_name", teamName);

  const res = await fetch("/api/upload-pdf", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.webViewLink) {
    throw new Error(
      data.error || "Failed to upload file to Google Drive. Please try again."
    );
  }

  return data.webViewLink;
}
