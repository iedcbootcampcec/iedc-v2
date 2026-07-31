import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ eventName: string }> }
) {
  const { eventName } = await context.params;

  return NextResponse.json(
    {
      eventName: eventName,
      miniMilitiaCount: 0,
      eFootballCount: 0,
      totalParticipants: 0,
    },
    { status: 200 }
  );
}
