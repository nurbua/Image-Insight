import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { GoogleGenAI } from '@google/genai';
import type { ChatMessage } from '../types';
import { getChatHistoryStream, saveChatMessage } from '../services/firebaseService';
import { generateChatResponse } from '../services/geminiService';
import { XIcon, SendIcon, LogoIcon } from './icons';

interface ChatProps {
    user: User;
    ai: GoogleGenAI;
    onClose: () => void;
}

export const Chat: React.FC<ChatProps> = ({ user, ai, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = getChatHistoryStream(user.uid, (loadedMessages) => {
            setMessages(loadedMessages);
        });
        return () => unsubscribe();
    }, [user.uid]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessageText = input;
        setInput('');
        
        await saveChatMessage(user.uid, { text: userMessageText, role: 'user' });
        setIsLoading(true);

        try {
            const history = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            })).filter(msg => msg.role === 'user' || msg.role === 'model') as ({ role: "user" | "model"; parts: { text: string }[] }[]);

            const resultStream = await generateChatResponse(ai, userMessageText, history);

            let streamedResponse = '';
            for await (const chunk of resultStream) {
                streamedResponse += chunk.text;
            }

            if (streamedResponse) {
                await saveChatMessage(user.uid, { text: streamedResponse, role: 'model' });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            await saveChatMessage(user.uid, {
                text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
                role: 'model',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-4 md:right-8 w-[calc(100%-2rem)] max-w-md h-[70vh] max-h-[600px] bg-white dark:bg-bunker-900 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out border border-gray-200 dark:border-bunker-800 animate-fade-in-up">
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
            `}</style>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-bunker-800 flex-shrink-0">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-100">
                    <LogoIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Assistant IA
                </h3>
                <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-bunker-800">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    {messages.map((msg, index) => (
                        <div key={msg.id || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-gray-100 dark:bg-bunker-800 text-gray-800 dark:text-gray-200 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="max-w-[80%] p-3 rounded-2xl bg-gray-100 dark:bg-bunker-800 text-gray-800 dark:text-gray-200 rounded-bl-none">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-bunker-800 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Posez votre question..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-bunker-700 rounded-full bg-gray-50 dark:bg-bunker-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-bunker-700 disabled:cursor-not-allowed transition-colors">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};
