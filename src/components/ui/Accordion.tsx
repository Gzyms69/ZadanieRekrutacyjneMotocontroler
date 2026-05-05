import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Komponent akordeonu dla sekcji kół.
 * Na mobile pomaga oszczędzić miejsce, na desktopie może służyć jako kontener.
 */
export const Accordion: React.FC<AccordionProps> = ({ 
  title, 
  children, 
  defaultOpen = false,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left font-bold text-gray-800 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown 
          className={cn("w-5 h-5 transition-transform duration-300", isOpen && "rotate-180")} 
        />
      </button>
      <div 
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 bg-white space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
