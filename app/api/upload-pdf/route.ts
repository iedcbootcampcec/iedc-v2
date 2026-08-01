import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const teamName = (formData.get("team_name") as string) || "Team";

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Please select a PDF file." },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Invalid file format. Only PDF files are allowed." },
        { status: 400 }
      );
    }

    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 15MB limit. Please upload a smaller PDF." },
        { status: 400 }
      );
    }

    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return NextResponse.json(
        {
          error:
            "Google Apps Script URL is missing on the server. Please add GOOGLE_APPS_SCRIPT_URL to your .env.local file.",
        },
        { status: 500 }
      );
    }

    const safeTeamName = teamName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeTeamName}_PitchDeck_${Date.now()}.pdf`;

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");
    const targetFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "";

    let scriptRes = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      redirect: "manual",
      body: JSON.stringify({
        fileName: filename,
        fileData: base64Data,
        mimeType: "application/pdf",
        folderId: targetFolderId,
      }),
    });

    if (
      scriptRes.status === 302 ||
      scriptRes.status === 301 ||
      scriptRes.status === 307
    ) {
      const redirectUrl = scriptRes.headers.get("location");
      if (redirectUrl) {
        scriptRes = await fetch(redirectUrl, { method: "GET" });
      }
    }

    const responseText = await scriptRes.text();
    let scriptData: any = {};

    try {
      scriptData = JSON.parse(responseText);
    } catch {
      console.error(
        "[upload-pdf] Google Apps Script raw non-JSON response:",
        responseText
      );
      if (
        responseText.includes("Google Drive") ||
        responseText.includes("accounts.google.com") ||
        responseText.includes("<html")
      ) {
        throw new Error(
          "Google Apps Script permission error. Please verify the Web App deployment has 'Who has access' set to 'Anyone'."
        );
      }
    }

    const webViewLink =
      scriptData.webViewLink || scriptData.url || scriptData.link;
    const fileId = scriptData.fileId || scriptData.id;

    if (scriptData.success && (webViewLink || fileId)) {
      return NextResponse.json({
        success: true,
        fileId: fileId || "",
        webViewLink:
          webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
      });
    }

    if (scriptData.error) {
      throw new Error(`Google Apps Script Error: ${scriptData.error}`);
    }

    throw new Error(
      `Google Apps Script returned unhandled response: ${responseText.slice(0, 150)}`
    );
  } catch (error: any) {
    console.error("[upload-pdf] Error uploading via Apps Script:", error);

    return NextResponse.json(
      {
        error:
          error.message ||
          "An unexpected error occurred while uploading the file to Google Drive.",
      },
      { status: 500 }
    );
  }
}
