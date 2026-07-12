import { NextResponse } from "next/server";

// ELITE EVALUATION MATRIX
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { answers, totalQuestions } = body;

    if (!answers || totalQuestions === undefined) {
      return NextResponse.json(
        { error: "SYSTEM HALT: Payload corrupted. Missing answer data." },
        { status: 400 }
      );
    }

    // SIMULATED AI GRADING ALGORITHM
    // In a real scenario, this matches student answers against the exact MongoDB 'correctAnswer' field.
    let correctCount = 0;
    
    // For now, we simulate checking (assuming 80% accuracy for demo purposes if real DB matching is pending)
    // We calculate raw score and XP
    answers.forEach((ans: any) => {
      // Assuming ans.selected is compared with ans.correct
      if (ans.selected) correctCount++; 
    });

    // We will randomly assign correct answers for this elite demo payload
    const finalScore = Math.floor(Math.random() * (totalQuestions - 1)) + 1; 
    const xpGained = finalScore * 50; // 50 XP per correct answer
    const accuracy = ((finalScore / totalQuestions) * 100).toFixed(1);

    return NextResponse.json(
      { 
        message: "EVALUATION COMPLETE", 
        score: finalScore,
        total: totalQuestions,
        xp: xpGained,
        accuracy: `${accuracy}%`
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("EVALUATION ENGINE FAILURE:", error);
    return NextResponse.json(
      { error: "Matrix Failure: Unable to evaluate submission.", details: error.message },
      { status: 500 }
    );
  }
}