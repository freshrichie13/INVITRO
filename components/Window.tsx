
import React from 'react';

interface WindowProps {
  title?: string; // Title is optional now, used mainly for accessibility or internal logic if needed
  children: React.ReactNode;
  className?: string;
}

const Window: React.FC<WindowProps> = ({ children, className }) => {
  return (
    <div className={`bg-white border-2 border-black p-6 md:p-8 w-full ${className}`}>
      {children}
    </div>
  );
};

export default Window;
