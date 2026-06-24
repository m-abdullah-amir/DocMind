import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureCategoryFolder, listFilesInFolder } from "@/lib/drive-folders";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const semesterName = searchParams.get("semesterName");
  const subjectName = searchParams.get("subjectName");
  const category = searchParams.get("category");

  if (!semesterName || !subjectName || !category) {
    return NextResponse.json({ error: "Missing required params" }, { status: 400 });
  }

  try {
    const folderId = await ensureCategoryFolder(
      (session as any).accessToken,
      semesterName,
      subjectName,
      category
    );

    const files = await listFilesInFolder((session as any).accessToken, folderId);
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("Error listing files:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}
