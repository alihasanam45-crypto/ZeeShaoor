import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "@/models/Question";

// ELITE FIX: This forces Next.js to NEVER cache this API and always return fresh JSON
export const dynamic = "force-dynamic"; 

export async function GET(req: Request) {
  try {
    // 1. Establish Database Connection
    await connectToDatabase();
    
    // 2. ELITE QUERY: Fetch 5 random questions for the student's daily target
    const assignments = await Question.aggregate([{ $sample: { size: 5 } }]);
    
    // 3. Return Pure JSON
    return NextResponse.json({ data: assignments }, { status: 200 });
  } catch (error: any) {
    console.error("Student API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load assignments" }, { status: 500 });
  }
}