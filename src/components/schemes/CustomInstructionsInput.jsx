import React from "react";
import PropTypes from "prop-types";

/**
 * Simple controlled textarea for custom instructions.
 * Keeps accessibility and keyboard focus in mind.
 */
const CustomInstructionsInput = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Instructions (Optional)</h2>
      <textarea
        aria-label="Custom instructions"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add any specific requirements, teaching approaches, or contextual notes..."
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <p className="text-xs text-gray-500 mt-2">Optional guidance to tailor the generated content (differentiation, assessment focus, etc.).</p>
    </div>
  );
};

CustomInstructionsInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default CustomInstructionsInput;