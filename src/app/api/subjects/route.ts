import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSubjectsBySemester, createSubject } from "@/lib/subjects";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const semesterId = searchParams.get("semesterId");

  if (!semesterId) {
    return NextResponse.json({ error: "Missing semesterId" }, { status: 400 });
  }

  try {
    const subjects = await getSubjectsBySemester((session as any).accessToken, semesterId);
    return NextResponse.json({ subjects });
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, semesterId } = await request.json();
    if (!name || !semesterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSubject = await createSubject((session as any).accessToken, name, semesterId);
    return NextResponse.json(newSubject);
  } catch (error: any) {
    console.error("Error creating subject:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}
