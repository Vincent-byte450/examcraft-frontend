import React from 'react';
import { FileText, Plus } from 'lucide-react';

const EmptyState = ({ 
  hasFilters, 
  onCreateNew, 
  title = "No exams created yet",
  filteredTitle = "No exams match your filters",
  description,
  filteredDescription = "Try adjusting your search criteria or filters.",
  showCreateButton = true,
  createButtonText = "Create Your First Exam",
  icon: Icon = FileText
}) => {
  const isFiltered = hasFilters;
  
  return (
    <div className="p-8 text-center text-gray-500">
      <div className="mb-4">
        <Icon className="w-16 h-16 mx-auto text-gray-300" />
      </div>
      <p className="text-lg font-medium text-gray-900 mb-2">
        {isFiltered ? filteredTitle : title}
      </p>
      <p className="text-gray-500 mb-4">
        {isFiltered 
          ? filteredDescription 
          : (description || 'Create your first AI-generated exam to get started.')
        }
      </p>
      {!isFiltered && showCreateButton && onCreateNew && (
        <button
          onClick={onCreateNew}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          {createButtonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;