import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "@/models/Question";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("classLevel");
    const subject    = searchParams.get("subject");
    const chapter    = searchParams.get("chapter");
    const type       = searchParams.get("type"); // MCQ | Short | Long

    if (!classLevel || !subject) {
      return NextResponse.json(
        { error: "classLevel aur subject chahiye" },
        { status: 400 }
      );
    }

    const filter: any = { classLevel, subject };
    if (chapter) filter.chapter    = chapter;
    if (type)    filter.questionType = type;

    const questions = await Question.find(filter).lean();

    // Chapters ki list bhi bhejo
    const chapters = [...new Set(questions.map((q: any) => q.chapter))];

    return NextResponse.json(
      { data: questions, chapters },
      { status: 200 }
    );

  } catch (error) {
    console.error("Questions fetch error:", error);
    return NextResponse.json(
      { error: "Questions load nahi hue" },
      { status: 500 }
    );
  }
}