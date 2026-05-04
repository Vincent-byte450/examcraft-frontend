import React, { useState } from "react";
import { Target, Layers, BookOpen, FileText, Sparkles, Download } from "lucide-react";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

// ============================================================================
// EnhancementTypeSelector - Cleaner, more focused
// ============================================================================
const enhancementOptions = [
  { 
    value: "detailed-objectives", 
    label: "Enhanced Objectives", 
    icon: Target, 
    description: "Detailed learning objectives with Bloom's Taxonomy" 
  },
  { 
    value: "activities", 
    label: "Learning Activities", 
    icon: Layers, 
    description: "Diverse, engaging activities with differentiation" 
  },
  { 
    value: "resources", 
    label: "Resource Lists", 
    icon: BookOpen, 
    description: "Comprehensive digital and physical resources" 
  },
  { 
    value: "assessments", 
    label: "Assessment Strategies", 
    icon: FileText, 
    description: "Formative and summative assessments with rubrics" 
  },
  { 
    value: "full-enhancement", 
    label: "Complete Enhancement", 
    icon: Sparkles, 
    description: "All enhancements in one comprehensive package" 
  }
];

const EnhancementTypeSelector = ({ value, onChange, onGenerate, generating, disabled }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Enhancement Type</h2>

      <div className="space-y-2 mb-6">
        {enhancementOptions.map((option) => {
          const Icon = option.icon;
          const active = option.value === value;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                active 
                  ? "border-indigo-500 bg-indigo-50 shadow-sm" 
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={active ? "text-indigo-600" : "text-gray-400"} size={18} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{option.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate
          </>
        )}
      </button>
    </div>
  );
};