import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSemesters, createSemester } from "@/lib/semesters";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const semesters = await getSemesters((session as any).accessToken);
    return NextResponse.json({ semesters });
  } catch (error: any) {
    console.error("Error fetching semesters:", error);
    return NextResponse.json({ error: "Failed to fetch semesters" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, startDate, endDate } = await request.json();
    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSemester = await createSemester((session as any).accessToken, name, startDate, endDate);
    return NextResponse.json(newSemester);
  } catch (error: any) {
    console.error("Error creating semester:", error);
    return NextResponse.json({ error: "Failed to create semester" }, { status: 500 });
  }
}
