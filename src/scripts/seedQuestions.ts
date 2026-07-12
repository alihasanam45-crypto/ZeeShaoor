import { connectToDatabase } from "../lib/mongodb";
import Question from "../models/Question";

const questions = [
  // Chapter 1 - Physical Quantities
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 1 - Physical Quantities and Measurement",
    questionType: "MCQ", difficulty: "Easy",
    questionText: "SI unit of length kya hai?",
    options: ["Meter", "Kilogram", "Second", "Ampere"],
    correctAnswer: "Meter",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 1 - Physical Quantities and Measurement",
    questionType: "MCQ", difficulty: "Easy",
    questionText: "Kitni base quantities hoti hain SI system mein?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 1 - Physical Quantities and Measurement",
    questionType: "MCQ", difficulty: "Medium",
    questionText: "Vernier caliper se minimum kitna measure kar sakte hain?",
    options: ["0.1 mm", "0.01 mm", "1 mm", "0.001 mm"],
    correctAnswer: "0.1 mm",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 1 - Physical Quantities and Measurement",
    questionType: "Short", difficulty: "Easy",
    questionText: "Physical quantity kise kehte hain? Misal dijiye.",
    options: [],
    correctAnswer: "Woh quantity jo measure ki ja sake physical quantity kehlati hai. Misal: length, mass, time.",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 1 - Physical Quantities and Measurement",
    questionType: "Short", difficulty: "Medium",
    questionText: "Significant figures ki definition likhein.",
    options: [],
    correctAnswer: "Measurement mein jo figures reliable hoti hain unhe significant figures kehte hain.",
  },

  // Chapter 2 - Kinematics
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 2 - Kinematics",
    questionType: "MCQ", difficulty: "Easy",
    questionText: "Speed ka formula kya hai?",
    options: ["distance/time", "time/distance", "distance x time", "distance + time"],
    correctAnswer: "distance/time",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 2 - Kinematics",
    questionType: "MCQ", difficulty: "Medium",
    questionText: "Acceleration ka SI unit kya hai?",
    options: ["m/s", "m/s²", "m²/s", "km/h"],
    correctAnswer: "m/s²",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 2 - Kinematics",
    questionType: "MCQ", difficulty: "Hard",
    questionText: "Ek car 10 m/s se 30 m/s tak 4 seconds mein pohonchi. Acceleration kya hai?",
    options: ["2 m/s²", "5 m/s²", "10 m/s²", "20 m/s²"],
    correctAnswer: "5 m/s²",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 2 - Kinematics",
    questionType: "Short", difficulty: "Easy",
    questionText: "Velocity aur speed mein farq likhein.",
    options: [],
    correctAnswer: "Speed scalar quantity hai (sirf magnitude), jabke velocity vector quantity hai (magnitude + direction).",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 2 - Kinematics",
    questionType: "Long", difficulty: "Hard",
    questionText: "Motion ke teen equations likhein aur explain karein.",
    options: [],
    correctAnswer: "1) v = u + at  2) s = ut + ½at²  3) v² = u² + 2as. In equations mein u=initial velocity, v=final velocity, a=acceleration, t=time, s=distance.",
  },

  // Chapter 3 - Dynamics
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 3 - Dynamics",
    questionType: "MCQ", difficulty: "Easy",
    questionText: "Newton ka pehla qanoon kya kehta hai?",
    options: [
      "Har action ka reaction hota hai",
      "Jism apni halat mein rehta hai jab tak force na lage",
      "F = ma",
      "Energy conserve hoti hai"
    ],
    correctAnswer: "Jism apni halat mein rehta hai jab tak force na lage",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 3 - Dynamics",
    questionType: "MCQ", difficulty: "Medium",
    questionText: "5 kg mass pe 20 N force lage toh acceleration kya hoga?",
    options: ["2 m/s²", "4 m/s²", "10 m/s²", "100 m/s²"],
    correctAnswer: "4 m/s²",
  },
  {
    classLevel: "9", subject: "Physics",
    chapter: "Chapter 3 - Dynamics",
    questionType: "Short", difficulty: "Medium",
    questionText: "Inertia kya hai? Newton ke pehle qanoon se iska kya taaluq hai?",
    options: [],
    correctAnswer: "Inertia jism ki woh khasiyat hai jo halat mein tabdeeli ka muqabala kare. Newton ka pehla qanoon Inertia ka qanoon bhi kehlata hai.",
  },
];

async function seed() {
  await connectToDatabase();
  await Question.deleteMany({ classLevel: "9", subject: "Physics" });
  await Question.insertMany(questions);
  console.log(`✅ ${questions.length} questions add ho gaye!`);
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
