import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden", className)}>
      {title && (
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
          <h2 className="font-bold text-gray-800">{title}</h2>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};
