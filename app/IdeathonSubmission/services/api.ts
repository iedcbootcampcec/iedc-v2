export interface Team {
  team_id: number;
  team_name: string;
}

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
      return {
        team_id: String(data.team_id),
        team_name: data.team_name || queryName,
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
    // Return fallback sample team structure so gender options remain functional
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

export async function submitIdea(teamId: number, submission: string) {
  const payload = {
    team_id: teamId,
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
      resData.error || "Failed to submit project. Please try again.",
    );
  }

  return resData;
}
