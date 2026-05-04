export const getAllowedPaperTypes = (examData) => {
  const { curriculum, subject } = examData;

  // ── Lower Primary (Grades 1–3) ──────────────────────────────────────────
  if (curriculum === "Lower Primary") {
    return [
      {
        key: "Single",
        title: "Single Assessment",
        description: "CBC activity-based formative assessment",
      },
    ];
  }

  // ── Upper Primary (Grades 4–6) ──────────────────────────────────────────
  if (curriculum === "Upper Primary") {
    return [
      {
        key: "Single",
        title: "Single Paper",
        description: "CBC competency-based integrated assessment",
      },
    ];
  }

  // ── JSS (Grades 7–9) ────────────────────────────────────────────────────
  if (curriculum === "JSS") {
    return [
      {
        key: "Single",
        title: "Single Paper",
        description: "CBC competency-based integrated assessment",
      },
    ];
  }

  // ── Senior School (Grades 10–12) ────────────────────────────────────────
  if (curriculum === "Senior School") {

    // ── Core subjects ──
    if (subject === "English") {
      return [
        { key: "Single", title: "Single Paper", description: "English Language (Core – all pathways)" },
      ];
    }
    if (subject === "Kiswahili") {
      return [
        { key: "Single", title: "Single Paper", description: "Kiswahili / Kenya Sign Language (Core – all pathways)" },
      ];
    }
    if (subject === "Community Service Learning") {
      return [
        { key: "Single", title: "Single Paper", description: "Community Service Learning (Core – all pathways)" },
      ];
    }
    if (subject === "Physical Education") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Sports Science, Health and Fitness" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical Performance Assessment" },
      ];
    }

    // ── STEM – Pure Sciences ──
    if (subject === "Mathematics") {
      return [
        { key: "Single", title: "Single Paper", description: "Mathematics / Advanced Mathematics (Core or STEM elective)" },
      ];
    }
    if (["Physics", "Chemistry", "Biology"].includes(subject)) {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Multiple Choice & Short Answer" },
        { key: "Paper 2", title: "Paper 2",      description: "Structured & Essay Questions" },
        { key: "Paper 3", title: "Paper 3",      description: "Practical Assessment" },
      ];
    }

    // ── STEM – Applied Sciences ──
    if (subject === "Agriculture") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Agricultural Theory and Principles" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical & Project Work" },
      ];
    }
    if (subject === "Computer Science") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Systems, Software, Digital Literacy" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical – Programming & Applications" },
      ];
    }
    if (subject === "Foods and Nutrition") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Nutrition, Food Science and Safety" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical Food Preparation Assessment" },
      ];
    }
    if (subject === "Home Management") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Home Organisation, Consumer and Financial Education" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical Assessment" },
      ];
    }

    // ── STEM – Technical & Engineering ──
    const technicalTheoryPractical = [
      "Drawing and Design",
      "Aviation Technology",
      "Building and Construction",
      "Electrical Technology",
      "Metal Technology",
      "Power Mechanics",
      "Wood Technology",
      "Media Technology",
      "Marine and Fisheries Technology",
      "Clothing Technology",
      "Electronics Technology",
      "Manufacturing Technology",
      "Mechatronics",
      "Geosciences Technology",
    ];
    if (technicalTheoryPractical.includes(subject)) {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Principles and Concepts" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical / Project Assessment" },
      ];
    }

    // ── Social Sciences ──
    if (subject === "History and Citizenship") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "History of Africa and the World" },
        { key: "Paper 2", title: "Paper 2",      description: "History of Kenya and Citizenship" },
      ];
    }
    if (subject === "Geography") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Physical Geography and Map Work" },
        { key: "Paper 2", title: "Paper 2",      description: "Human and Economic Geography" },
      ];
    }
    if (subject === "Business Studies") {
      return [
        { key: "Single", title: "Single Paper", description: "Business concepts, commerce and entrepreneurship" },
      ];
    }
    if ([
      "Christian Religious Education",
      "Islamic Religious Education",
      "Hindu Religious Education",
    ].includes(subject)) {
      return [
        { key: "Single", title: "Single Paper", description: "Essay questions (Religious Education)" },
      ];
    }
    if (subject === "Literature in English") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Prose and Poetry" },
        { key: "Paper 2", title: "Paper 2",      description: "Drama and Oral Literature" },
      ];
    }
    if (subject === "Fasihi ya Kiswahili") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Fasihi Simulizi na Ushairi" },
        { key: "Paper 2", title: "Paper 2",      description: "Hadithi Fupi, Riwaya na Tamthilia" },
      ];
    }
    if (["French", "German", "Arabic", "Mandarin"].includes(subject)) {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Grammar, Comprehension and Translation" },
        { key: "Paper 2", title: "Paper 2",      description: "Oral Communication and Composition" },
      ];
    }
    if (["Indigenous Languages", "Kenyan Sign Language"].includes(subject)) {
      return [
        { key: "Single", title: "Single Paper", description: "Language skills and communication assessment" },
      ];
    }

    // ── Arts & Sports Science – Arts Track ──
    if (["Visual Arts", "Fine Art", "Applied Art", "Crafts"].includes(subject)) {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Art History, Principles and Elements" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical Studio Work / Portfolio" },
      ];
    }
    if (["Performing Arts", "Music", "Dance"].includes(subject)) {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Analysis, History and Composition" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical Performance / Production" },
      ];
    }
    if (subject === "Theatre and Film") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Scriptwriting, Film History and Analysis" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical Production / Performance Assessment" },
      ];
    }

    // ── Arts & Sports Science – Sports Track ──
    const sportsSubjects = [
      "Ball Games",
      "Athletics",
      "Indoor Games",
      "Gymnastics",
      "Water Sports",
      "Outdoor Pursuits",
      "Advanced Physical Education",
    ];
    if (sportsSubjects.includes(subject)) {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory – Sports Science, Rules and Tactics" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical Performance Assessment" },
      ];
    }

    // ── Default ──
    return [
      { key: "Single", title: "Single Paper", description: "General assessment covering all topics" },
    ];
  }

  // ── Secondary / 8-4-4 (Forms 1–4) ───────────────────────────────────────
  if (curriculum === "Secondary") {

    if (subject === "English") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Functional Writing, Cloze Test, Oral Skills" },
        { key: "Paper 2", title: "Paper 2",      description: "Comprehension, Set Books, Grammar" },
        { key: "Paper 3", title: "Paper 3",      description: "Creative and Expository Composition" },
      ];
    }
    if (subject === "Kiswahili") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Utungaji, Ufahamu, Sarufi na Lugha" },
        { key: "Paper 2", title: "Paper 2",      description: "Fasihi Simulizi na Andishi" },
      ];
    }
    if (["Physics", "Chemistry", "Biology"].includes(subject)) {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Short Structured Questions (80 marks)" },
        { key: "Paper 2", title: "Paper 2",      description: "Structured and Essay Questions (80 marks)" },
        { key: "Paper 3", title: "Paper 3",      description: "Practical Assessment (80 marks)" },
      ];
    }
    if (subject === "Mathematics") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Pure Mathematics (No calculators, 100 marks)" },
        { key: "Paper 2", title: "Paper 2",      description: "Applied Mathematics (Calculators allowed, 100 marks)" },
      ];
    }
    if (subject === "Agriculture") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "General Principles and Practices" },
      ];
    }
    if (subject === "Home Science") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory and Principles" },
        { key: "Paper 2", title: "Paper 2",      description: "Applied Home Science" },
        { key: "Paper 3", title: "Paper 3",      description: "Practical Assessment" },
      ];
    }
    if (subject === "Computer Studies") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory - Systems, Software, Applications" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical - Programming & Applications" },
      ];
    }
    if (subject === "Geography") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Physical Geography and Map Work" },
        { key: "Paper 2", title: "Paper 2",      description: "Human and Economic Geography" },
      ];
    }
    if (subject === "History") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "History of Africa and the World" },
        { key: "Paper 2", title: "Paper 2",      description: "History of Kenya" },
      ];
    }
    if (["Christian Religious Education", "Islamic Religious Education"].includes(subject)) {
      return [
        { key: "Single", title: "Single Paper", description: "Essay questions (Answer 5 out of 6, 100 marks)" },
      ];
    }
    if (subject === "Business Studies") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Single",  title: "Single Paper", description: "Short Answer + Essay Questions (100 marks)" },
      ];
    }
    if (["French", "German"].includes(subject)) {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Grammar, Comprehension, Translation, Composition" },
        { key: "Paper 2", title: "Paper 2",      description: "Oral Communication" },
      ];
    }
    if (subject === "Music") {
      return [
        { key: "Mixed",   title: "Mixed Paper", description: "" },
        { key: "Paper 1", title: "Paper 1",      description: "Theory, Analysis, Composition, Essay" },
        { key: "Paper 2", title: "Paper 2",      description: "Practical Performance" },
      ];
    }

    // ── Default ──
    return [
      { key: "Single", title: "Single Paper", description: "General examination covering all topics" },
    ];
  }

  return [];
};