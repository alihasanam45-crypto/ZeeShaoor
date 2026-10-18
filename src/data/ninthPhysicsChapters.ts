// src/data/ninthPhysicsChapters.ts

export interface Topic {
  id: string;       // e.g. "1.1"
  name: string;
}

export interface ChapterExercises {
  mcq: number;          // total MCQ count
  short: number;
  constructed: number;
  comprehensive: number;
  numerical: number;    // 0 agar chapter mein numericals nahi hain
}

export interface Chapter {
  id: number;            // 1 to 9
  slug: string;           // url/db friendly key
  name: string;
  topics: Topic[];
  exercises: ChapterExercises;
}

export const ninthPhysicsChapters: Chapter[] = [
  {
    id: 1,
    slug: "physical-quantities-and-measurements",
    name: "Physical Quantities and Measurements",
    topics: [
      { id: "1.1", name: "Physical and Non-Physical Quantities" },
      { id: "1.2", name: "Base and Derived Quantities" },
      { id: "1.3", name: "SI Units" },
      { id: "1.4", name: "Scientific Notation" },
      { id: "1.5", name: "Length Measuring Instruments" },
      { id: "1.6", name: "Mass Measuring Instruments" },
      { id: "1.7", name: "Time Measuring Instruments" },
      { id: "1.8", name: "Volume Measuring Instruments" },
      { id: "1.9", name: "Errors in Measurement" },
      { id: "1.10", name: "Uncertainty" },
      { id: "1.11", name: "Significant Figures" },
      { id: "1.12", name: "Precision and Accuracy" },
      { id: "1.13", name: "Rounding Off" },
    ],
    exercises: { mcq: 11, short: 11, constructed: 10, comprehensive: 5, numerical: 10 },
  },
  {
    id: 2,
    slug: "kinematics",
    name: "Kinematics",
    topics: [
      { id: "2.1", name: "Scalars and Vectors" },
      { id: "2.2", name: "Rest and Motion" },
      { id: "2.3", name: "Types of Motion (Translatory, Rotatory, Vibratory)" },
      { id: "2.4", name: "Distance and Displacement" },
      { id: "2.5", name: "Speed and Velocity" },
      { id: "2.6", name: "Acceleration" },
      { id: "2.7", name: "Graphical Analysis of Motion" },
      { id: "2.8", name: "Gradient of Distance-Time Graph" },
      { id: "2.9", name: "Gradient of Speed-Time Graph" },
      { id: "2.10", name: "Area under Speed-Time Graph" },
      { id: "2.11", name: "Equations of Motion" },
      { id: "2.12", name: "Motion under Gravity" },
      { id: "2.13", name: "Free Fall" },
    ],
    exercises: { mcq: 10, short: 8, constructed: 6, comprehensive: 7, numerical: 10 },
  },
  {
    id: 3,
    slug: "dynamics",
    name: "Dynamics",
    topics: [
      { id: "3.1", name: "Force (Concept)" },
      { id: "3.2", name: "Fundamental Forces of Nature" },
      { id: "3.3", name: "Effects of Force" },
      { id: "3.4", name: "Free-Body Diagrams" },
      { id: "3.5", name: "Newton's First Law of Motion" },
      { id: "3.6", name: "Newton's Second Law of Motion" },
      { id: "3.7", name: "Newton's Third Law of Motion" },
      { id: "3.8", name: "Limitations of Newton's Laws" },
      { id: "3.9", name: "Mass and Weight" },
      { id: "3.10", name: "Friction, Momentum, Impulse and Conservation of Momentum" },
    ],
    exercises: { mcq: 9, short: 10, constructed: 6, comprehensive: 6, numerical: 9 },
  },
  {
    id: 4,
    slug: "turning-effects-of-force",
    name: "Turning Effects of Force",
    topics: [
      { id: "4.1", name: "Like and Unlike Parallel Forces" },
      { id: "4.2", name: "Addition of Forces (Head-to-Tail Rule)" },
      { id: "4.3", name: "Turning Effect of a Force" },
      { id: "4.4", name: "Moment of Force / Torque" },
      { id: "4.5", name: "Couple" },
      { id: "4.6", name: "Resolution of Vectors" },
      { id: "4.7", name: "Determination of Force from Perpendicular Components" },
      { id: "4.8", name: "Principle of Moments" },
      { id: "4.9", name: "Centre of Gravity and Centre of Mass" },
      { id: "4.10", name: "Equilibrium (Static and Dynamic)" },
      { id: "4.11", name: "Conditions and States of Equilibrium" },
      { id: "4.12", name: "Rotational vs Translational Motion" },
      { id: "4.13", name: "Centripetal Force" },
    ],
    exercises: { mcq: 10, short: 10, constructed: 5, comprehensive: 4, numerical: 10 },
  },
  {
    id: 5,
    slug: "work-energy-and-power",
    name: "Work, Energy and Power",
    topics: [
      { id: "5.1", name: "Work" },
      { id: "5.2", name: "Energy (Kinetic and Potential)" },
      { id: "5.3", name: "Conservation of Energy" },
      { id: "5.4", name: "Sources of Energy" },
      { id: "5.5", name: "Renewable and Non-Renewable Sources" },
      { id: "5.6", name: "Advantages/Disadvantages of Energy Production Methods" },
      { id: "5.7", name: "Power" },
      { id: "5.8", name: "Efficiency" },
    ],
    exercises: { mcq: 9, short: 10, constructed: 9, comprehensive: 5, numerical: 13 },
  },
  {
    id: 6,
    slug: "mechanical-properties-of-matter",
    name: "Mechanical Properties of Matter",
    topics: [
      { id: "6.1", name: "Deformation of Solids" },
      { id: "6.2", name: "Hooke's Law" },
      { id: "6.3", name: "Density" },
      { id: "6.4", name: "Pressure" },
      { id: "6.5", name: "Pressure in Liquids" },
      { id: "6.6", name: "Atmospheric Pressure" },
      { id: "6.7", name: "Measurement of Atmospheric Pressure" },
      { id: "6.8", name: "Measurement of Pressure by Manometer" },
      { id: "6.9", name: "Pascal's Law and Applications" },
    ],
    exercises: { mcq: 8, short: 10, constructed: 10, comprehensive: 5, numerical: 12 },
  },
  {
    id: 7,
    slug: "thermal-properties-of-matter",
    name: "Thermal Properties of Matter",
    topics: [
      { id: "7.1", name: "Kinetic Molecular Theory of Matter" },
      { id: "7.2", name: "Temperature and Heat" },
      { id: "7.3", name: "Thermometers" },
      { id: "7.4", name: "Sensitivity, Range and Linearity of Thermometers" },
      { id: "7.5", name: "Structure of a Liquid-in-Glass Thermometer" },
    ],
    exercises: { mcq: 11, short: 15, constructed: 13, comprehensive: 5, numerical: 6 },
  },
  {
    id: 8,
    slug: "magnetism",
    name: "Magnetism",
    topics: [
      { id: "8.1", name: "Magnetic Materials" },
      { id: "8.2", name: "Properties of Magnets" },
      { id: "8.3", name: "Induced Magnetism" },
      { id: "8.4", name: "Temporary and Permanent Magnets" },
      { id: "8.5", name: "Magnetic Fields" },
      { id: "8.6", name: "Uses of Permanent Magnets" },
      { id: "8.7", name: "Electromagnets" },
      { id: "8.8", name: "Domain Theory of Magnetism" },
      { id: "8.9", name: "Magnetisation and Demagnetisation" },
      { id: "8.10", name: "Applications of Magnets in Recording Technology" },
      { id: "8.11", name: "Soft Iron as Magnetic Shield" },
    ],
    exercises: { mcq: 8, short: 7, constructed: 5, comprehensive: 6, numerical: 0 },
  },
  {
    id: 9,
    slug: "nature-of-science",
    name: "Nature of Science",
    topics: [
      { id: "9.1", name: "Scope of Physics" },
      { id: "9.2", name: "Branches of Physics" },
      { id: "9.3", name: "Interdisciplinary Nature of Physics" },
      { id: "9.4", name: "Interdisciplinary Research" },
      { id: "9.5", name: "Scientific Method" },
      { id: "9.6", name: "Scientific Base of Technologies and Engineering" },
    ],
    exercises: { mcq: 11, short: 8, constructed: 10, comprehensive: 5, numerical: 0 },
  },
];