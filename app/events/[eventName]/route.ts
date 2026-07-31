import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ eventName: string }> }
) {
  const { eventName } = await context.params;

  try {
    const body = await request.json().catch(() => ({}));

    const teamId = body.teamId;
    const ticket = body.ticket;
    const game = body.game;
    const teamName = body.teamName;

    return NextResponse.json(
      {
        message: "Event submission successful",
        teamId: Number(teamId),
        ticket: String(ticket),
        eventName: eventName,
        teamName: teamName,
        game: game,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process event registration" },
      { status: 400 }
    );
  }
}
