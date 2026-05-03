
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`px-3 py-2.5 sm:py-2 border-2 border-[#6B3A2A] outline-none font-light text-base sm:text-sm placeholder-[#A07060] ${className}`}
      style={{
        backgroundColor: 'rgba(59, 31, 14, 0.70)',
        color: '#F5ECD7',
      }}
      {...props}
    />
  );
};

export default Input;
