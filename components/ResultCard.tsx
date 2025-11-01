import React from 'react';

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800 ${className} transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1`}>
      <div className="p-4 border-b border-gray-200 dark:border-bunker-800">
        <h3 className="text-lg font-semibold flex items-center gap-3 text-gray-800 dark:text-gray-100">
            <span className="text-blue-600 dark:text-blue-400">{icon}</span>
            {title}
        </h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};