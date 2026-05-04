import { useState } from 'react';
import { API_API_BASE_URL } from '../config/env';

export const useAIQuestionGeneration = (examData) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const API_BASE_URL = API_API_BASE_URL; 

  const getAuthToken = () => {
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  };

  const saveQuestionsToBackend = async (questions) => {
    const token = getAuthToken();
    const savedQuestions = [];
    const failedQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      try {
        const questionData = {
          question: question.question,
          options: question.options || [],
          correctAnswer: question.correctAnswer || question.expectedAnswer || "",
          explanation: question.explanation || "",
          subject: examData.subject,
          topic: question.topic,
          curriculum: examData.curriculum,
          difficulty: question.difficulty || "medium",
          marks: question.marks || 1,
          type: question.type || "short_answer",
          section: question.section || null,
          questionFormat: question.questionFormat || null,
          subQuestions: question.subQuestions || [],
          hasImage: question.hasImage || false,
          imageDescription: question.imageDescription || ""
        };

        setGenerationProgress(Math.round(((i + 1) / questions.length) * 80) + 20);

        const response = await fetch(`${API_BASE_URL}/questions/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(questionData),
        });

        if (response.ok) {
          const result = await response.json();
          savedQuestions.push({ 
            ...question, 
            backendId: result.question._id,
            saved: true
          });
        } else {
          const error = await response.json();
          console.error("Failed to save question:", error);
          failedQuestions.push({
            ...question,
            error: error.message || "Unknown error",
            saved: false
          });
        }
      } catch (error) {
        console.error("Error saving question:", error);
        failedQuestions.push({
          ...question,
          error: error.message,
          saved: false
        });
      }
    }

    return { savedQuestions, failedQuestions };
  };

  const saveExamToBackend = async (parsedExamData) => {
    const token = getAuthToken();

    try {
      const questions = parsedExamData.questions || [];
      const totalMarks = parsedExamData.totalMarks ||
        questions.reduce((sum, q) => sum + (q.marks || 1), 0);

      const examPayload = {
        title: examData.title,
        curriculum: examData.curriculum,
        term: examData.term,
        classLevel: examData.classLevel,
        type: examData.type,
        subject: examData.subject,
        paperType: examData.paperType,
        duration: examData.duration,
        totalMarks,
        instructions: parsedExamData.instructions || examData.instructions,
        status: "completed",
        questions: questions.map((q) => ({
          questionRef: q.backendId || null,
          question: q.question,
          type: q.type || "short-answer",
          marks: q.marks || 1,
          difficulty: q.difficulty || "medium",
          topic: q.topic || "",
          section: q.section || null,
          expectedAnswer: q.expectedAnswer || "",
          subQuestions: q.subQuestions || [],
          hasImage: q.hasImage || false,
          imageDescription: q.imageDescription || ""
        })),
        sections: parsedExamData.sections || {}
      };

      const response = await fetch(`${API_BASE_URL}/exams/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(examPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save exam (${response.status})`);
      }

      const result = await response.json();
      return result.exam;
    } catch (error) {
      console.error("Error saving exam to backend:", error);
      throw error;
    }
  };

  const processGeneratedExam = async (parsedExamData) => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);

      const questions = parsedExamData.questions || [];
      
      if (questions.length === 0) {
        throw new Error("No questions found in generated exam");
      }


      // Save questions first
      const { savedQuestions, failedQuestions } = await saveQuestionsToBackend(questions);

      // Update exam data with backend IDs
      const updatedParsedExamData = {
        ...parsedExamData,
        questions: savedQuestions
      };

      // Save exam metadata
      const savedExam = await saveExamToBackend(updatedParsedExamData);
      setGenerationProgress(100);

      return {
        success: true,
        exam: savedExam,
        questions: savedQuestions,
        failedQuestions,
        totalQuestions: questions.length,
        savedCount: savedQuestions.length,
        failedCount: failedQuestions.length
      };

    } catch (error) {
      console.error("Error processing generated exam:", error);
      return {
        success: false,
        error: error.message,
        questions: [],
        failedQuestions: [],
        totalQuestions: 0,
        savedCount: 0,
        failedCount: 0
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generationProgress,
    setIsGenerating,
    setGenerationProgress,
    processGeneratedExam
  };
};