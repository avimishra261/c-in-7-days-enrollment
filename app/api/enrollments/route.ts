import { NextResponse } from "next/server";

// Server-side in-memory & cloud sync fallback cache for all connected devices
let memoryEnrollmentStore: Record<string, unknown> = {};

export async function GET() {
  return NextResponse.json({
    success: true,
    enrollments: memoryEnrollmentStore,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "clear") {
      memoryEnrollmentStore = {};
      return NextResponse.json({ success: true, message: "Cleared all server enrollments." });
    }

    if (body.action === "delete" && body.userId) {
      delete memoryEnrollmentStore[body.userId];
      return NextResponse.json({ success: true, enrollments: memoryEnrollmentStore });
    }

    if (body.enrollmentData && body.enrollmentData.userId) {
      memoryEnrollmentStore[body.enrollmentData.userId] = body.enrollmentData;
      return NextResponse.json({ success: true, enrollments: memoryEnrollmentStore });
    }

    if (body.enrollmentsMap) {
      memoryEnrollmentStore = { ...body.enrollmentsMap };
      return NextResponse.json({ success: true, enrollments: memoryEnrollmentStore });
    }

    return NextResponse.json({ success: true, enrollments: memoryEnrollmentStore });
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
