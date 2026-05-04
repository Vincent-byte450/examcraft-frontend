import { SyllabusService } from '../services/syllabusService';

const syllabusService = new SyllabusService();
export const createDetailedPrompt = (examData) => {
  const selectedTopics = examData.topics.join(", ");
  const questionTypes = examData.questionTypes.length > 0
    ? examData.questionTypes.join(", ")
    : "multiple choice, structured questions, short answer";

  return `
Generate ${examData.numQuestions} exam questions for ${examData.curriculum} level ${examData.subject}.

CURRICULUM CONTEXT:
- Level: ${examData.curriculum === "JSS" ? "Junior Secondary School (Grade 7-9)" : "Secondary School (Form 1-4)"}
- Subject: ${examData.subject}
- Topics: ${selectedTopics}
- Difficulty: ${examData.difficulty}

QUESTION REQUIREMENTS:
- Question types: ${questionTypes}
- Total questions: ${examData.numQuestions}
- Marks should range from 1-10 per question
- Questions should be curriculum-aligned and age-appropriate
- Include a mix of difficulty levels if "mixed" is selected

CRITICAL: Return ONLY a valid JSON array. No explanatory text before or after.

JSON FORMAT EXAMPLE:
[
  {
    "id": 1,
    "question": "What is photosynthesis?",
    "type": "multiple_choice",
    "options": ["A) Process of plant growth", "B) Process where plants make food using sunlight", "C) Process of water absorption", "D) Process of oxygen production"],
    "correctAnswer": "B) Process where plants make food using sunlight",
    "marks": 2,
    "difficulty": "easy",
    "topic": "Biology",
    "explanation": "Photosynthesis is the process by which plants convert sunlight into energy"
  }
]

Generate exactly ${examData.numQuestions} questions following this format.

${examData.customPrompt ? `\nADDITIONAL REQUIREMENTS: ${examData.customPrompt}` : ""}
`;
};


export const createDetailedPrompt2 = async (examData) => {
  const questionTypes = examData.questionTypes.length > 0
    ? examData.questionTypes.join(", ")
    : "multiple choice, structured questions, short answer";

  let contentSource = "";
  let syllabusContent = "";

  // If a syllabus is selected, fetch its content
  if (examData.selectedSyllabus) {
    try {
      const syllabusData = await syllabusService.getSyllabusContent(examData.selectedSyllabus);
      syllabusContent = syllabusData.content;
      contentSource = "UPLOADED SYLLABUS";
      
      // Increment usage count
      await syllabusService.incrementSyllabusUsage(examData.selectedSyllabus);
    } catch (error) {
      console.error('Error fetching syllabus content:', error);
      // Fall back to topic-based generation
      contentSource = "SELECTED TOPICS";
    }
  } else {
    // Use selected topics
    contentSource = "SELECTED TOPICS";
  }

  const selectedTopics = examData.topics.join(", ");

  return `
Generate ${examData.numQuestions} exam questions for ${examData.curriculum} level ${examData.subject}.

CURRICULUM CONTEXT:
- Level: ${examData.curriculum === "JSS" ? "Junior Secondary School (Grade 7-9)" : "Secondary School (Form 1-4)"}
- Subject: ${examData.subject}
- Content Source: ${contentSource}
${syllabusContent ? `- Syllabus Content: Use the following syllabus content as the primary reference for generating questions:\n\n${syllabusContent}\n\n` : `- Topics: ${selectedTopics}`}
- Difficulty: ${examData.difficulty}

QUESTION REQUIREMENTS:
- Question types: ${questionTypes}
- Total questions: ${examData.numQuestions}
- Marks should range from 1-10 per question
- Questions should be curriculum-aligned and age-appropriate
- Include a mix of difficulty levels if "mixed" is selected
${syllabusContent ? '- IMPORTANT: Base questions strictly on the provided syllabus content above' : '- Base questions on the selected topics'}
- Ensure questions test understanding, application, and analysis skills
- Include contextual examples relevant to Kenyan education system where appropriate

${syllabusContent ? `
SYLLABUS-BASED GENERATION INSTRUCTIONS:
- Analyze the provided syllabus content carefully
- Generate questions that cover the key learning objectives mentioned
- Ensure questions align with the depth and scope indicated in the syllabus
- Cover different sections/units proportionally based on their emphasis in the syllabus
- Include questions that test the specific skills and competencies outlined
` : `
TOPIC-BASED GENERATION INSTRUCTIONS:
- Cover all selected topics: ${selectedTopics}
- Distribute questions evenly across topics unless specified otherwise
- Ensure comprehensive coverage of each topic area
`}

CRITICAL: Return ONLY a valid JSON array. No explanatory text before or after.

JSON FORMAT EXAMPLE:
[
  {
    "id": 1,
    "question": "What is photosynthesis?",
    "type": "multiple_choice",
    "options": ["A) Process of plant growth", "B) Process where plants make food using sunlight", "C) Process of water absorption", "D) Process of oxygen production"],
    "correctAnswer": "B) Process where plants make food using sunlight",
    "marks": 2,
    "difficulty": "easy",
    "topic": "Biology",
    "explanation": "Photosynthesis is the process by which plants convert sunlight into energy",
    "syllabusRef": "${syllabusContent ? 'Based on uploaded syllabus content' : 'Based on selected topics'}"
  }
]

Generate exactly ${examData.numQuestions} questions following this format.

${examData.customPrompt ? `\nADDITIONAL REQUIREMENTS: ${examData.customPrompt}` : ""}
`;
};

// Alternative prompt creation function for when syllabus content is already available
export const createSyllabusBasedPrompt = (examData, syllabusContent) => {
  const questionTypes = examData.questionTypes.length > 0
    ? examData.questionTypes.join(", ")
    : "multiple choice, structured questions, short answer";

  return `
Generate ${examData.numQuestions} exam questions for ${examData.curriculum} level ${examData.subject} based on the provided syllabus.

CURRICULUM CONTEXT:
- Level: ${examData.curriculum === "JSS" ? "Junior Secondary School (Grade 7-9)" : "Secondary School (Form 1-4)"}
- Subject: ${examData.subject}
- Content Source: UPLOADED SYLLABUS
- Difficulty: ${examData.difficulty}

SYLLABUS CONTENT:
${syllabusContent}

QUESTION REQUIREMENTS:
- Question types: ${questionTypes}
- Total questions: ${examData.numQuestions}
- Marks should range from 1-10 per question
- Questions should be curriculum-aligned and age-appropriate
- Include a mix of difficulty levels if "mixed" is selected
- IMPORTANT: Base questions strictly on the provided syllabus content above
- Ensure questions test understanding, application, and analysis skills
- Include contextual examples relevant to Kenyan education system where appropriate

SYLLABUS-BASED GENERATION INSTRUCTIONS:
- Analyze the provided syllabus content carefully
- Generate questions that cover the key learning objectives mentioned
- Ensure questions align with the depth and scope indicated in the syllabus
- Cover different sections/units proportionally based on their emphasis in the syllabus
- Include questions that test the specific skills and competencies outlined
- Reference specific syllabus sections or learning outcomes where relevant

CRITICAL: Return ONLY a valid JSON array. No explanatory text before or after.

JSON FORMAT EXAMPLE:
[
  {
    "id": 1,
    "question": "According to the syllabus learning objectives, explain the process of photosynthesis and its importance in the ecosystem.",
    "type": "structured_question",
    "options": null,
    "correctAnswer": "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. It is important because: 1) It provides food for plants, 2) Produces oxygen for other organisms, 3) Forms the base of food chains, 4) Helps regulate atmospheric CO2 levels.",
    "marks": 6,
    "difficulty": "medium",
    "topic": "Plant Biology - Photosynthesis",
    "explanation": "This question tests understanding of a key biological process as outlined in the syllabus learning objectives for plant biology.",
    "syllabusRef": "Section 3.2: Plant Nutrition and Photosynthesis"
  }
]

Generate exactly ${examData.numQuestions} questions following this format.

${examData.customPrompt ? `\nADDITIONAL REQUIREMENTS: ${examData.customPrompt}` : ""}
`;
};

// Utility function to validate syllabus content
export const validateSyllabusContent = (content) => {
  if (!content || typeof content !== 'string' || content.trim().length < 100) {
    return false;
  }
  return true;
};

// Function to extract key topics from syllabus content
export const extractTopicsFromSyllabus = (syllabusContent) => {
  // Simple extraction based on common patterns in syllabi
  const topics = [];
  const lines = syllabusContent.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    // Look for numbered sections, bullet points, or capitalized topics
    if (/^\d+\./.test(line) || /^[A-Z][A-Z\s]+$/.test(line) || /^•/.test(line)) {
      const topic = line.replace(/^\d+\./, '').replace(/^•/, '').trim();
      if (topic.length > 3 && topic.length < 100) {
        topics.push(topic);
      }
    }
  });
  
  return topics.slice(0, 20); // Limit to 20 topics
};

// Function to estimate question distribution across syllabus sections
export const calculateQuestionDistribution = (syllabusContent, totalQuestions) => {
  const sections = syllabusContent.split(/\n\s*\n/); // Split by double newlines
  const distribution = {};
  
  sections.forEach((section, index) => {
    const weight = section.length; // Use section length as weight
    distribution[`Section ${index + 1}`] = Math.max(1, Math.floor((weight / syllabusContent.length) * totalQuestions));
  });
  
  return distribution;
};