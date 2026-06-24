import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { activateSemester } from "@/lib/semesters";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { semesterId } = await request.json();
    if (!semesterId) {
      return NextResponse.json({ error: "Missing semesterId" }, { status: 400 });
    }

    const updatedSemesters = await activateSemester((session as any).accessToken, semesterId);
    return NextResponse.json({ semesters: updatedSemesters });
  } catch (error: any) {
    console.error("Error activating semester:", error);
    return NextResponse.json({ error: "Failed to activate semester" }, { status: 500 });
  }
}
