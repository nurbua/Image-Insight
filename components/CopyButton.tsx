
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface CopyButtonProps {
  textToCopy: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-md transition-colors ${copied ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-300' : 'bg-gray-200 dark:bg-bunker-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-bunker-700'}`}
      aria-label="Copier le texte"
    >
      {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
    </button>
  );
};
