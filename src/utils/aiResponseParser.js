export const parseAIResponse = (responseData, examData = {}) => {
  try {
    
    // The API returns { success: true, questions: {...} }
    // Extract the actual exam data from the questions field
    let examResponse = responseData;
    
    // If response has a 'questions' field, that contains the actual exam data
    if (responseData.questions) {
      examResponse = responseData.questions;
    }
    
    // Validate we have the expected structure
    if (!examResponse.sections) {
      throw new Error('Missing sections in exam response');
    }

    const questions = [];
    let questionCounter = 1;

    const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

    const normalizeDifficulty = (difficulty) => {
      if (!difficulty) return 'medium';
      const lower = difficulty.toLowerCase();
      if (VALID_DIFFICULTIES.includes(lower)) return lower;
      if (lower.includes('easy')) return 'easy';
      if (lower.includes('hard')) return 'hard';
      return 'medium';
    };

    // Process each section
    Object.keys(examResponse.sections).forEach(sectionKey => {
      const section = examResponse.sections[sectionKey];
      const sectionLetter = sectionKey.replace('section', '').toUpperCase();
      const questionsList = Array.isArray(section.questions) && section.questions.length > 0 ? section.questions : Array.isArray(section.questionsList) ? section.questionsList : null;
      if (questionsList) {
        questionsList.forEach(q => {
          const processedQuestion = {
            id: q.id || questionCounter++,
            question: q.question,
            type: q.type || 'short-answer',
            marks: q.marks || 1,
            difficulty: normalizeDifficulty(q.difficulty),
            topic: q.topic || examData.subject || 'General',
            section: sectionLetter,
            expectedAnswer: q.expectedAnswer || '',
            questionFormat: q.questionFormat || '',
            
            // Handle structured questions
            ...(q.subQuestions && {
              subQuestions: q.subQuestions,
              hasImage: q.hasImage || false,
              imageDescription: q.imageDescription || ''
            }),
            
            // Handle essay questions with parts
            ...(q.subQuestions && q.type === 'essay' && {
              parts: q.subQuestions // For essay questions, subQuestions become parts
            })
          };
          
          questions.push(processedQuestion);
        });
      }
    });

    const totalMarks = examResponse.totalMarks || questions.reduce((sum, q) => sum + (q.marks || 0), 0);

    return {
      success: true,
      examTitle: examResponse.examTitle || `${examData.subject || 'Subject'} ${examData.paperType || 'Paper 1'}`,
      paperType: examResponse.paperType || examData.paperType || 'Paper 1',
      curriculum: examResponse.curriculum || examData.curriculum || 'Secondary',
      subject: examResponse.subject || examData.subject || 'General',
      duration: examResponse.duration || examData.duration || 120,
      totalMarks: totalMarks,
      instructions: examResponse.instructions || 'Answer all questions as instructed in each section.',
      questions: questions,
      sections: examResponse.sections,
      totalQuestions: questions.length
    };

  } catch (error) {
    console.error("Error parsing AI response:", error);
    return generateFallbackQuestions(examData);
  }
};

// Generate fallback questions if parsing fails
const generateFallbackQuestions = (examData) => {
  
  const fallbackQuestions = [
    {
      id: 1,
      question: `State three main concepts in ${examData.subject || 'this subject'}. (2 marks)`,
      type: 'short-answer',
      marks: 2,
      difficulty: 'easy',
      topic: examData.subject || 'General',
      section: 'A',
      expectedAnswer: 'Three main concepts to be provided',
      questionFormat: 'state'
    },
    {
      id: 2,
      question: `Explain the importance of ${examData.subject || 'this subject'} in daily life.`,
      type: 'structured',
      marks: 10,
      difficulty: 'medium',
      topic: examData.subject || 'General',
      section: 'B',
      subQuestions: [
        {
          part: 'a)',
          question: `Define ${examData.subject || 'this subject'}. (3 marks)`,
          marks: 3,
          expectedAnswer: 'Definition to be provided'
        },
        {
          part: 'b)',
          question: 'Give four practical applications. (4 marks)',
          marks: 4,
          expectedAnswer: 'Four applications to be provided'
        },
        {
          part: 'c)',
          question: 'State three benefits. (3 marks)',
          marks: 3,
          expectedAnswer: 'Three benefits to be provided'
        }
      ],
      hasImage: false,
      imageDescription: ''
    }
  ];

  return {
    success: true,
    examTitle: `${examData.subject || 'Subject'} ${examData.paperType || 'Paper 1'}`,
    paperType: examData.paperType || 'Paper 1',
    curriculum: examData.curriculum || 'Secondary',
    subject: examData.subject || 'General',
    duration: examData.duration || 120,
    totalMarks: fallbackQuestions.reduce((sum, q) => sum + q.marks, 0),
    instructions: 'Answer all questions as instructed in each section.',
    questions: fallbackQuestions,
    sections: {
      sectionA: {
        title: "SECTION A",
        instructions: "Answer ALL questions in this section",
        questions: fallbackQuestions.filter(q => q.section === 'A')
      },
      sectionB: {
        title: "SECTION B",
        instructions: "Answer ALL questions in this section",
        questions: fallbackQuestions.filter(q => q.section === 'B')
      },
      sectionC: {
        title: "SECTION C",
        instructions: "Answer any TWO questions in this section",
        questions: fallbackQuestions.filter(q => q.section === 'C')
      }
    },
    totalQuestions: fallbackQuestions.length
  };
};

// Simplified validation function
export const validateExamData = (examData) => {
  const errors = [];
  const warnings = [];

  if (!examData) {
    errors.push('No exam data provided');
    return { isValid: false, errors, warnings };
  }

  if (!examData.questions || !Array.isArray(examData.questions) || examData.questions.length === 0) {
    errors.push('No valid questions found');
  }

  // Basic question validation
  if (examData.questions) {
    examData.questions.forEach((question, index) => {
      if (!question.question || question.question.trim() === '') {
        errors.push(`Question ${index + 1}: Missing question text`);
      }
      if (!question.marks || question.marks <= 0) {
        warnings.push(`Question ${index + 1}: Invalid marks allocation`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalQuestions: examData.questions?.length || 0,
    totalMarks: examData.questions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0
  };
};