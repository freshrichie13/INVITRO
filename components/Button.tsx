
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`px-6 py-2 border-2 border-[#C1714F] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: '#A05A3A',
        color: '#FFFFFF',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3B1F0E';
        (e.currentTarget as HTMLButtonElement).style.color = '#F5ECD7';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#A05A3A';
        (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
