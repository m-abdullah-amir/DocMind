import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureCategoryFolder, checkDuplicate, uploadFileToDrive } from "@/lib/drive-folders";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
    const category = formData.get("category") as string;

    if (!file || !semesterName || !subjectName || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Server-side size check
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 413 });
    }

    // Ensure the folder path exists
    const folderId = await ensureCategoryFolder(accessToken, semesterName, subjectName, category);

    // Check for duplicates
    const isDuplicate = await checkDuplicate(accessToken, folderId, file.name);
    if (isDuplicate) {
      return NextResponse.json({ error: "A file with this name already exists in this category." }, { status: 409 });
    }

    // Upload the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await uploadFileToDrive(accessToken, folderId, file.name, file.type, buffer);

    return NextResponse.json({ success: true, file: result });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
