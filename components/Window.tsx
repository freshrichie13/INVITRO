
import React from 'react';

interface WindowProps {
  title?: string; // Title is optional now, used mainly for accessibility or internal logic if needed
  children: React.ReactNode;
  className?: string;
}

const Window: React.FC<WindowProps> = ({ children, className }) => {
  return (
    <div
      className={`border-2 border-[#C1714F] p-6 md:p-8 w-full ${className}`}
      style={{ backgroundColor: 'rgba(59, 31, 14, 0.85)' }}
    >
      {children}
    </div>
  );
};

export default Window;
