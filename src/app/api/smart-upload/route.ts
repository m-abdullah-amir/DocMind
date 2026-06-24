import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureCategoryFolder, checkDuplicate, uploadFileToDrive } from "@/lib/drive-folders";
import { classifyDocument, extractTextFromPDF } from "@/lib/ai-classifier";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Smart Upload: Automatically classifies the document using AI
 * and places it in the correct category folder.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = (session as any).accessToken;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const semesterName = formData.get("semesterName") as string;
    const subjectName = formData.get("subjectName") as string;

    if (!file || !semesterName || !subjectName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text for AI classification
    let textContent = "";
    if (file.type === "application/pdf") {
      textContent = await extractTextFromPDF(buffer);
    } else if (file.type.includes("text") || file.name.endsWith(".txt")) {
      textContent = buffer.toString("utf-8");
    }
    // For DOCX and other binary formats, we send the filename as a hint
    if (!textContent.trim()) {
      textContent = `Document filename: ${file.name}`;
    }

    // AI Classification
    const category = await classifyDocument(textContent);

    // Ensure folder exists and upload
    const folderId = await ensureCategoryFolder(accessToken, semesterName, subjectName, category);

    // Duplicate check
    const isDuplicate = await checkDuplicate(accessToken, folderId, file.name);
    if (isDuplicate) {
      return NextResponse.json({
        error: `A file with this name already exists in "${category}".`,
        category,
      }, { status: 409 });
    }

    const result = await uploadFileToDrive(accessToken, folderId, file.name, file.type, buffer);

    return NextResponse.json({
      success: true,
      file: result,
      category,
      message: `AI classified "${file.name}" as "${category}".`,
    });
  } catch (error: any) {
    console.error("Smart upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
