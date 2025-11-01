import React from 'react';
import type { AnalysisResult } from '../types';
import { BookOpenIcon } from './icons';

interface HistoryProps {
    history: AnalysisResult[];
    onSelect: (item: AnalysisResult) => void;
}

export const History: React.FC<HistoryProps> = ({ history, onSelect }) => {
    
    const formatDate = (timestamp: { seconds: number; nanoseconds: number; }) => {
        if (!timestamp) return 'Date inconnue';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    if(history.length === 0) {
        return null; // Don't show the component if there's no history
    }

    return (
        <div className="bg-white dark:bg-bunker-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800">
            <h3 className="text-lg font-semibold flex items-center gap-3 text-gray-800 dark:text-gray-100 mb-4">
                <BookOpenIcon className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                Votre Historique
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {history.map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => onSelect(item)}
                        className="w-full flex items-center gap-4 p-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-bunker-800 transition-colors"
                    >
                        <img src={item.imageUrl} alt={item.fileName} className="w-16 h-16 rounded-md object-cover flex-shrink-0 bg-gray-200 dark:bg-bunker-700"/>
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{item.fileName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.createdAt)}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
