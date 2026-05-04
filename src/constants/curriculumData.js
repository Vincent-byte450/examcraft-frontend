// ─────────────────────────────────────────────────────────────
// CURRICULUM SUBJECTS
// Sources: KICD CBC Curriculum Designs (2024/2025)
// ─────────────────────────────────────────────────────────────

export const curriculumSubjects = {

  // ── Lower Primary (Grades 1–3) ─────────────────────────────
  // 7 learning areas (capped by PWPER 2024 reforms)
  "Lower Primary": [
    "English",
    "Kiswahili",
    "Mathematics",
    "Environmental Activities",
    "Religious Education Activities",
    "Creative Activities",
    "Indigenous Language Activities",
  ],

  // ── Upper Primary (Grades 4–6) ─────────────────────────────
  // 8 learning areas (PWPER 2024 reforms)
  "Upper Primary": [
    "English",
    "Kiswahili",
    "Mathematics",
    "Science and Technology",
    "Social Studies",
    "Religious Education",
    "Creative Arts",
    "Agriculture and Nutrition",
  ],

  // ── Junior Secondary School (Grades 7–9) ──────────────────
  // 9 learning areas (PWPER 2024 reforms)
  JSS: [
    "English",
    "Kiswahili",
    "Mathematics",
    "Integrated Science",
    "Social Studies",
    "Religious Education",
    "Pre-Technical Studies",
    "Creative Arts and Sports",
    "Agriculture and Nutrition",
  ],

  // ── Senior School (Grades 10–12) ──────────────────────────
  // Core (mandatory for ALL pathways) + pathway electives
  "Senior School": [
    // ── Core / Mandatory (all pathways) ──
    "English",
    "Kiswahili",
    "Community Service Learning",
    "Physical Education",

    // ── STEM – Pure Sciences ──
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",

    // ── STEM – Applied Sciences ──
    "Agriculture",
    "Computer Science",
    "Foods and Nutrition",
    "Home Management",

    // ── STEM – Technical & Engineering ──
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

    // ── Social Sciences ──
    "History and Citizenship",
    "Geography",
    "Business Studies",
    "Christian Religious Education",
    "Islamic Religious Education",
    "Hindu Religious Education",
    "Literature in English",
    "Fasihi ya Kiswahili",
    "French",
    "German",
    "Arabic",
    "Mandarin",
    "Indigenous Languages",
    "Kenyan Sign Language",

    // ── Arts & Sports Science – Arts Track ──
    "Visual Arts",
    "Fine Art",
    "Applied Art",
    "Crafts",
    "Performing Arts",
    "Theatre and Film",
    "Music",
    "Dance",

    // ── Arts & Sports Science – Sports Track ──
    "Ball Games",
    "Athletics",
    "Indoor Games",
    "Gymnastics",
    "Water Sports",
    "Outdoor Pursuits",
    "Advanced Physical Education",
  ],

  // ── Secondary / 8-4-4 (Forms 1–4) ────────────────────────
  Secondary: [
    "Mathematics",
    "English",
    "Kiswahili",
    "Biology",
    "Chemistry",
    "Physics",
    "Geography",
    "History",
    "Christian Religious Education",
    "Islamic Religious Education",
    "Business Studies",
    "Agriculture",
    "Home Science",
    "Computer Studies",
    "French",
    "German",
    "Music",
  ],
};


// ─────────────────────────────────────────────────────────────
// SUBJECT TOPICS
// ─────────────────────────────────────────────────────────────

export const subjectTopics = {

  // ── Shared across levels ────────────────────────────────────

  Mathematics: {
    "Lower Primary": ["Number Work", "Measurement", "Geometry", "Money", "Time"],
    "Upper Primary": ["Numbers and Operations", "Fractions and Decimals", "Measurement", "Geometry", "Data Handling", "Algebra Foundations"],
    JSS: ["Numbers", "Algebra", "Geometry", "Statistics", "Probability", "Measurement"],
    "Senior School": ["Algebra", "Calculus", "Trigonometry", "Statistics", "Probability", "Vectors", "Matrices", "Coordinate Geometry"],
    Secondary: ["Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics", "Probability", "Vectors", "Matrices"],
  },

  English: {
    "Lower Primary": ["Phonics", "Reading", "Oral Communication", "Handwriting", "Creative Expression"],
    "Upper Primary": ["Grammar", "Reading Comprehension", "Creative Writing", "Oral Communication", "Vocabulary"],
    JSS: ["Grammar", "Vocabulary", "Reading Comprehension", "Creative Writing", "Poetry", "Oral Literature"],
    "Senior School": ["Language Skills", "Literature", "Poetry", "Composition", "Oral Communication", "Set Books"],
    Secondary: ["Literature", "Poetry", "Grammar", "Composition", "Oral Literature", "Set Books", "Language Skills"],
  },

  Kiswahili: {
    "Lower Primary": ["Kusoma", "Kuandika", "Kusikiliza na Kuzungumza", "Sarufi Msingi"],
    "Upper Primary": ["Sarufi", "Ufahamu", "Utungaji", "Fasihi Simulizi", "Msamiati"],
    JSS: ["Sarufi", "Ufahamu", "Utungaji", "Fasihi Simulizi", "Msamiati"],
    "Senior School": ["Lugha na Sarufi", "Ufahamu", "Utungaji", "Fasihi Simulizi", "Fasihi Andishi"],
    Secondary: ["Utungaji", "Ufahamu", "Sarufi na Lugha", "Fasihi Simulizi", "Fasihi Andishi"],
  },

  // ── Lower & Upper Primary ──────────────────────────────────

  "Environmental Activities": {
    "Lower Primary": ["Living Things", "Non-Living Things", "Weather", "Environment Care", "Hygiene and Nutrition"],
  },

  "Creative Activities": {
    "Lower Primary": ["Drawing and Painting", "Music", "Drama", "Physical Activities", "Craft Work"],
  },

  "Religious Education Activities": {
    "Lower Primary": ["Values and Morals", "Religious Stories", "Prayer and Worship", "Community Life"],
  },

  "Science and Technology": {
    "Upper Primary": ["Living Things", "Environment", "Matter", "Forces and Energy", "Technology and Innovation", "Health and Hygiene"],
  },

  "Social Studies": {
    "Upper Primary": ["Our Community", "Kenya's Geography", "History and Culture", "Government and Citizenship", "Economic Activities"],
    JSS: ["Physical Geography", "Human Geography", "History", "Citizenship", "Map Skills", "Economic Activities"],
  },

  "Religious Education": {
    "Upper Primary": ["Values and Ethics", "Sacred Texts", "Prayer and Worship", "Family and Community", "Social Issues"],
    JSS: ["Values and Ethics", "Sacred Texts", "Prayer and Worship", "Family and Community", "Social Issues"],
  },

  "Creative Arts": {
    "Upper Primary": ["Visual Arts", "Music", "Drama and Theatre", "Dance", "Craft and Design"],
  },

  "Agriculture and Nutrition": {
    "Upper Primary": ["Crop Production", "Animal Husbandry", "Nutrition and Healthy Eating", "Soil and Water", "Farm Tools"],
    JSS: ["Crop Production", "Animal Husbandry", "Nutrition", "Soil Science", "Farm Management", "Agribusiness"],
  },

  // ── JSS ───────────────────────────────────────────────────

  "Integrated Science": {
    JSS: ["Living Things", "Matter and Materials", "Forces and Energy", "Ecology", "Health Science", "Scientific Investigation"],
  },

  "Pre-Technical Studies": {
    JSS: ["Technical Drawing", "Woodwork", "Metalwork", "Electricity Basics", "Building Basics", "Technology and Society"],
  },

  "Creative Arts and Sports": {
    JSS: ["Visual Arts", "Music", "Drama", "Dance", "Sports and Games", "Physical Fitness"],
  },

  // ── Senior School – Core ───────────────────────────────────

  "Community Service Learning": {
    "Senior School": ["Community Needs Analysis", "Project Planning", "Service Delivery", "Reflection and Reporting", "Civic Engagement"],
  },

  "Physical Education": {
    "Senior School": ["Sports Science", "Health and Fitness", "Team Sports", "Athletics", "Physical Wellness"],
  },

  // ── Senior School – STEM Pure Sciences ────────────────────

  Physics: {
    "Senior School": ["Mechanics", "Waves and Optics", "Electricity and Magnetism", "Thermodynamics", "Modern Physics", "Nuclear Physics"],
    Secondary: ["Mechanics", "Waves", "Electricity", "Magnetism", "Thermodynamics", "Modern Physics", "Optics"],
  },

  Chemistry: {
    "Senior School": ["Atomic Structure", "Chemical Bonding", "Acids, Bases and Salts", "Organic Chemistry", "Electrochemistry", "Thermodynamics", "Reaction Kinetics"],
    Secondary: ["Atomic Structure", "Chemical Bonding", "Acids and Bases", "Organic Chemistry", "Electrochemistry", "Thermodynamics", "Kinetics"],
  },

  Biology: {
    "Senior School": ["Cell Biology", "Genetics and Heredity", "Evolution", "Ecology", "Human Physiology", "Plant Biology", "Microbiology", "Classification"],
    Secondary: ["Cell Biology", "Genetics", "Evolution", "Ecology", "Human Physiology", "Plant Biology", "Microbiology", "Classification"],
  },

  // ── Senior School – STEM Applied Sciences ─────────────────

  Agriculture: {
    "Senior School": ["Crop Science", "Animal Production", "Soil Science", "Irrigation and Water Management", "Agribusiness", "Agricultural Technology"],
    Secondary: ["Crop Production", "Animal Husbandry", "Soil Science", "Farm Management", "Agricultural Economics"],
  },

  "Computer Science": {
    "Senior School": ["Programming Fundamentals", "Data Structures and Algorithms", "Database Management", "Networks and Security", "Artificial Intelligence", "Web and App Development"],
  },

  "Foods and Nutrition": {
    "Senior School": ["Nutrients and Diet", "Food Preparation", "Food Safety and Hygiene", "Meal Planning", "Food Science"],
  },

  "Home Management": {
    "Senior School": ["Home Organisation", "Consumer Education", "Financial Management", "Textiles and Clothing", "Child Development"],
  },

  // ── Senior School – STEM Technical ────────────────────────

  "Drawing and Design": {
    "Senior School": ["Geometric Construction", "Engineering Drawing", "Orthographic Projection", "Isometric Drawing", "Design Principles"],
  },

  "Building and Construction": {
    "Senior School": ["Building Materials", "Foundation Work", "Masonry", "Carpentry and Joinery", "Plumbing", "Roofing"],
  },

  "Electrical Technology": {
    "Senior School": ["Electrical Circuits", "Wiring Installations", "Electrical Machines", "Electronics", "Safety and Standards"],
  },

  "Wood Technology": {
    "Senior School": ["Timber and Materials", "Hand Tools", "Machine Work", "Joinery and Cabinet Making", "Wood Finishing", "Project Design"],
  },

  "Metal Technology": {
    "Senior School": ["Metals and Alloys", "Hand Tools", "Welding", "Machining", "Sheet Metal Work", "Engineering Principles"],
  },

  "Power Mechanics": {
    "Senior School": ["Engine Systems", "Fuel Systems", "Transmission", "Electrical Systems", "Diagnostics and Repair"],
  },

  "Media Technology": {
    "Senior School": ["Media Production", "Photography", "Video Production", "Digital Editing", "Publishing", "Media Ethics"],
  },

  // ── Senior School – Social Sciences ───────────────────────

  "History and Citizenship": {
    "Senior School": ["History of Africa", "History of Kenya", "World History", "Governance and Democracy", "Human Rights", "International Relations"],
  },

  Geography: {
    "Senior School": ["Physical Geography", "Human Geography", "Economic Geography", "Environmental Issues", "GIS and Map Skills", "Regional Geography"],
    JSS: ["Physical Geography", "Human Geography", "Map Skills", "Weather and Climate"],
    Secondary: ["Physical Geography", "Human Geography", "Economic Geography", "Regional Geography", "Geographic Information Systems"],
  },

  "Business Studies": {
    "Senior School": ["Commerce", "Entrepreneurship", "Accounting Principles", "Economics", "Business Communication", "Finance"],
    Secondary: ["Commerce", "Accounting", "Economics", "Business Communication", "Entrepreneurship"],
  },

  "Christian Religious Education": {
    "Senior School": ["Old Testament", "New Testament", "Christian Ethics", "Church History", "Contemporary Issues"],
    Secondary: ["Old Testament", "New Testament", "Christian Ethics", "Church History", "Contemporary Issues"],
  },

  "Islamic Religious Education": {
    "Senior School": ["Quran Studies", "Hadith", "Islamic Ethics", "Islamic History", "Fiqh (Jurisprudence)"],
    Secondary: ["Quran Studies", "Hadith", "Islamic Ethics", "Islamic History", "Fiqh (Jurisprudence)"],
  },

  "Literature in English": {
    "Senior School": ["Prose", "Poetry", "Drama", "Oral Literature", "Literary Criticism", "Set Texts"],
  },

  "Fasihi ya Kiswahili": {
    "Senior School": ["Ushairi", "Fasihi Simulizi", "Hadithi Fupi", "Riwaya", "Tamthilia", "Uhakiki wa Fasihi"],
  },

  French: {
    "Senior School": ["Grammar and Vocabulary", "Comprehension", "Composition", "Translation", "Oral Communication", "French Culture"],
    Secondary: ["Grammar and Vocabulary", "Comprehension", "Composition", "Translation", "Oral Communication"],
  },

  German: {
    "Senior School": ["Grammar and Vocabulary", "Comprehension", "Composition", "Translation", "Oral Communication", "German Culture"],
    Secondary: ["Grammar and Vocabulary", "Comprehension", "Composition", "Translation", "Oral Communication"],
  },

  Arabic: {
    "Senior School": ["Grammar and Vocabulary", "Reading and Comprehension", "Composition", "Translation", "Oral Communication", "Arabic Literature"],
  },

  Mandarin: {
    "Senior School": ["Characters and Pronunciation", "Grammar", "Reading Comprehension", "Oral Communication", "Chinese Culture"],
  },

  // ── Senior School – Arts & Sports ─────────────────────────

  "Visual Arts": {
    "Senior School": ["Drawing and Painting", "Printmaking", "Sculpture", "Photography", "Art History", "Digital Art"],
  },

  "Performing Arts": {
    "Senior School": ["Music Theory", "Dance Techniques", "Drama and Theatre", "Elocution", "Performance and Production", "Arts History"],
  },

  Music: {
    "Senior School": ["Music Theory", "Harmony and Composition", "Music History", "Instrumental Performance", "Vocal Performance", "Digital Music"],
    Secondary: ["Music Theory", "Harmony", "Music History", "Composition", "Performance", "African Music"],
  },

  "Theatre and Film": {
    "Senior School": ["Scriptwriting", "Acting Techniques", "Directing", "Cinematography", "Film Editing", "Production Design"],
  },

  // ── 8-4-4 Secondary ───────────────────────────────────────

  "Home Science": {
    Secondary: ["Nutrition", "Food Preparation", "Textiles and Clothing", "Home Management", "Child Development", "Consumer Education"],
  },

  "Computer Studies": {
    Secondary: ["Computer Systems", "Operating Systems", "Word Processing", "Spreadsheets", "Databases", "Programming", "Internet and Email"],
  },

  History: {
    Secondary: ["History of Africa", "History of Kenya", "World History", "Nationalism and Independence", "Post-Independence Africa"],
  },
};