import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "@/models/Question";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const filter: Record<string, any> = {};
    const classLevel = url.searchParams.get('classLevel');
    const subject = url.searchParams.get('subject');
    const type = url.searchParams.get('type');
    const chapter = url.searchParams.get('chapter');
    const search = url.searchParams.get('search');

    if (classLevel) filter.classLevel = classLevel;
    if (subject) filter.subject = subject;
    if (type) filter.questionType = type;
    if (chapter) filter.chapter = chapter;
    if (search) filter.questionText = { $regex: search, $options: 'i' };

    const questions = await Question.find(filter)
      .sort({ chapter: 1, difficulty: 1 })
      .limit(200)
      .lean();

    return NextResponse.json({ data: questions, total: questions.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Establish Secure Matrix Connection
    await connectToDatabase();

    // 2. Parse Incoming Payload
    const body = await req.json();

    // 3. Bulletproof Validation: Ensure critical fields exist and are not empty spaces
    if (!body.questionText?.trim() || !body.subject || !body.standard) {
      return NextResponse.json(
        { error: "SYSTEM HALT: Invalid Payload. Critical data missing." },
        { status: 400 }
      );
    }

    // 4. Inject Data into MongoDB
    const newQuestion = await Question.create(body);

    // 5. Return Success Transmission
    return NextResponse.json(
      { message: "DATA INJECTED SUCCESSFULLY: Question anchored in the Vault.", data: newQuestion },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("DATA INJECTION FAILURE:", error);
    return NextResponse.json(
      { error: "Matrix Failure: Unable to anchor data.", details: error.message },
      { status: 500 }
    );
  }
}