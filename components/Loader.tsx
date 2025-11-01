import React from 'react';
import { LoaderCircleIcon } from './icons';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 h-full bg-white dark:bg-bunker-900 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800">
        <LoaderCircleIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Analyse en cours...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Veuillez patienter.</p>
    </div>
  );
};