import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "@/models/Question";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { rows } = body; // CSV rows array frontend se aayegi

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Koi data nahi mila" },
        { status: 400 }
      );
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const row of rows) {
      try {
        const options = row.options
          ? row.options.split("|").map((o: string) => o.trim())
          : [];

        await Question.create({
          classLevel:   row.classLevel?.toString(),
          subject:      row.subject?.trim(),
          chapter:      row.chapter?.trim(),
          questionType: row.questionType?.trim(),
          questionText: row.questionText?.trim(),
          options:      options,
          correctAnswer:row.correctAnswer?.trim(),
          difficulty:   row.difficulty?.trim(),
          boardId:      row.boardId || undefined,
          year:         row.year ? parseInt(row.year) : undefined,
          marks:        row.marks ? parseInt(row.marks) : undefined,
        });

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Row error: ${err.message}`);
      }
    }

    return NextResponse.json({ data: results }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload fail ho gaya" },
      { status: 500 }
    );
  }
}