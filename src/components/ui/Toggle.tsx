import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  label,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
  };

  const thumbSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  };

  return (
    <div className="flex items-center">
      {label && (
        <label className="text-sm font-medium text-gray-700 mr-3">
          {label}
        </label>
      )}
      <button
        type="button"
        className={`
          ${sizeClasses[size]}
          ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
          relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
          focus:ring-blue-500 focus:ring-offset-2
        `}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`
            ${thumbSizeClasses[size]}
            ${enabled ? `translate-x-${size === 'sm' ? '4' : '5'}` : 'translate-x-0'}
            pointer-events-none inline-block transform rounded-full bg-white shadow
            ring-0 transition duration-200 ease-in-out
          `}
        />
      </button>
    </div>
  );
};