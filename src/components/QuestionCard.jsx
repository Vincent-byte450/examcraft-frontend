import { RefreshCw, Edit3, Trash2, Loader } from 'lucide-react';

const QuestionCard = ({ question, index, onRegenerate, onEdit, onDelete }) => {
  // Ensure question object exists and has required properties
  if (!question) {
    return (
      <div className="p-6 border-l-4 border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">Error: Question data is missing</p>
      </div>
    );
  }

  const {
    id,
    question: questionText = 'No question text available',
    type = 'unknown',
    marks = 0,
    difficulty = 'medium',
    topic = 'No topic',
    options = [],
    markingScheme = [],
    correctAnswer = '',
    expectedAnswer = '',
    explanation = '',
    section = '',
    isRegenerating = false
  } = question;

  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded">
              Q{index + 1}
            </span>
            <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium px-2 py-1 rounded">
              {type.replace(/_/g, " ")}
            </span>
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded">
              {marks} mark{marks !== 1 ? 's' : ''}
            </span>
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium px-2 py-1 rounded">
              {difficulty}
            </span>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-2 py-1 rounded">
              {topic}
            </span>
            {section && (
              <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-1 rounded">
                Section {section}
              </span>
            )}
          </div>

          <p className="text-gray-800 dark:text-gray-200 mb-2 font-medium">{questionText}</p>

          {Array.isArray(options) && options.length > 0 && (
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
              {options.map((option, optIndex) => (
                <div key={optIndex} className="ml-4">{option}</div>
              ))}
            </div>
          )}

          {Array.isArray(markingScheme) && markingScheme.length > 0 && (
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <p className="font-medium text-gray-700 dark:text-gray-300">Marking Scheme:</p>
              {markingScheme.map((item, itemIndex) => (
                <div key={itemIndex} className="ml-4">• {item}</div>
              ))}
            </div>
          )}

          {(correctAnswer || expectedAnswer) && (
            <div className="text-sm text-green-600 dark:text-green-400 mt-2">
              <strong>Answer:</strong> {correctAnswer || expectedAnswer}
            </div>
          )}

          {explanation && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              <strong>Explanation:</strong> {explanation}
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          {isRegenerating ? (
            <div className="p-2">
              <Loader className="w-4 h-4 animate-spin text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <>
              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(id)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"
                  title="Regenerate this question"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(id)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Edit this question"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                  title="Delete this question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;