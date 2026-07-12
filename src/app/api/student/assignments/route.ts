import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "@/models/Question";
import QuizResult from "@/models/QuizResult";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const studentId = searchParams.get("studentId");

    if (!subject || !studentId) {
      return NextResponse.json(
        { error: "subject aur studentId dono chahiye" },
        { status: 400 }
      );
    }

    const weakTopics = await QuizResult.aggregate([
      { $match: { studentId, subject, isCorrect: false } },
      { $group: { _id: "$chapter", wrongCount: { $sum: 1 } } },
      { $match: { wrongCount: { $gte: 3 } } },
      { $project: { chapter: "$_id" } },
    ]);

    const weakChapters = weakTopics.map((t: any) => t.chapter);

    let questions: any[] = [];

    if (weakChapters.length > 0) {
      questions = await Question.aggregate([
        { $match: { subject, chapter: { $in: weakChapters } } },
        { $sample: { size: 5 } },
      ]);
    }

    if (questions.length < 5) {
      const needed = 5 - questions.length;
      const existingIds = questions.map((q: any) => q._id);
      const extra = await Question.aggregate([
        { $match: { subject, _id: { $nin: existingIds } } },
        { $sample: { size: needed } },
      ]);
      questions = [...questions, ...extra];
    }

    return NextResponse.json({ data: questions }, { status: 200 });

  } catch (error) {
    console.error("Quiz API Error:", error);
    return NextResponse.json(
      { error: "Questions load nahi hue" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { studentId, subject, chapter, questionId, isCorrect, timeTaken } = body;

    if (!studentId || !subject || !questionId) {
      return NextResponse.json(
        { error: "Data incomplete hai" },
        { status: 400 }
      );
    }

    const count = await QuizResult.countDocuments({ studentId, subject });
    if (count >= 10) {
      const oldest = await QuizResult.findOne(
        { studentId, subject },
        {},
        { sort: { createdAt: 1 } }
      );
      if (oldest) await QuizResult.deleteOne({ _id: oldest._id });
    }

    const result = await QuizResult.create({
      studentId,
      subject,
      chapter,
      questionId,
      isCorrect,
      timeTaken,
      createdAt: new Date(),
    });

    return NextResponse.json({ data: result }, { status: 201 });

  } catch (error) {
    console.error("Result save error:", error);
    return NextResponse.json(
      { error: "Result save nahi hua" },
      { status: 500 }
    );
  }
}