import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner = ({ 
  size = "medium", 
  message = "Loading...",
  className = "",
  showMessage = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      case 'xlarge':
        return 'w-16 h-16';
      default:
        return 'w-8 h-8';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader className={`${getSizeClasses()} text-green-600 animate-spin ${showMessage ? 'mb-2' : ''}`} />
      {showMessage && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;