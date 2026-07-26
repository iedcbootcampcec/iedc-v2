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

export async function fetchTeams(): Promise<Team[]> {
  try {
    const res = await fetch(`${baseUrl}/teams`);

    if (!res.ok) throw new Error("Failed to fetch teams");

    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("Error fetching teams:", err);
    return [];
  }
}

export async function fetchTeamMembers(
  teamId: number | string
): Promise<TeamMembersDetails> {
  try {
    const res = await fetch(`${baseUrl}/teams/members/${teamId}`);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error || errorData.message || `HTTP ${res.status}`
      );
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(
      `[fetchTeamMembers] Backend endpoint GET /teams/members/${teamId} returned error:`,
      err
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
  payload: UpdateMembersPayload
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
      resData.message || resData.error || "Failed to update team members."
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

