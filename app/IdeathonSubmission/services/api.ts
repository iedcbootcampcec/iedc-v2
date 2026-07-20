export interface Team {
  team_id: number;
  team_name: string;
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
