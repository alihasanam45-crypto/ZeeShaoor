import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ success: true, message: "AI Control API Ready" });
  } catch (error) {
    return NextResponse.json({ error: "DB connection failed" }, { status: 500 });
  }
}