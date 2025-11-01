import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebaseConfig';
import { LogoIcon } from './icons';

export const Login: React.FC = () => {
    const handleGoogleSignIn = async () => {
        if (!isFirebaseConfigured) return;
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erreur lors de la connexion avec Google: ", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-bunker-950 p-4">
            <div className="max-w-md w-full text-center">
                <div className="flex justify-center items-center gap-4 mb-6">
                    <LogoIcon className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    <div>
                         <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Image Insight</h1>
                         <p className="text-gray-600 dark:text-gray-300">Votre expert en analyse d'images</p>
                    </div>
                </div>
               
                <div className="bg-white dark:bg-bunker-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800">
                    {!isFirebaseConfigured ? (
                        <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 mb-6 text-left rounded-r-lg" role="alert">
                            <h3 className="font-bold">Configuration requise</h3>
                            <p className="text-sm mt-1">
                                Pour activer la connexion, veuillez configurer vos identifiants Firebase dans le fichier :
                                <code className="bg-yellow-200 dark:bg-yellow-800/60 text-yellow-900 dark:text-yellow-100 px-1 py-0.5 rounded text-xs mx-1 font-mono">
                                    services/firebaseConfig.ts
                                </code>
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Connexion</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Veuillez vous connecter pour continuer.</p>
                        </>
                    )}
                    
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={!isFirebaseConfigured}
                        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-bunker-800 border border-gray-300 dark:border-bunker-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-bunker-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-bunker-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48">
                            <path fill="#4285F4" d="M24 9.5c3.21 0 6.18.98 8.63 3.32l6.5-6.5C34.63 2.52 29.63 0 24 0 14.52 0 6.46 5.8 3.06 13.91l7.84 6.06C12.58 13.46 17.84 9.5 24 9.5z"></path>
                            <path fill="#34A853" d="M46.94 24.5c0-1.66-.15-3.28-.43-4.85H24v9.16h12.95c-.56 2.97-2.19 5.49-4.71 7.22l7.74 6.01c4.52-4.17 7.1-10.13 7.1-17.54z"></path>
                            <path fill="#FBBC05" d="M10.9 20.03c-.56-1.66-.88-3.42-.88-5.28s.32-3.62.88-5.28L3.06 3.42C1.12 7.25 0 11.5 0 16.25s1.12 8.99 3.06 12.83l7.84-6.05z"></path>
                            <path fill="#EA4335" d="M24 48c5.63 0 10.63-1.85 14.13-5.01l-7.74-6.01c-1.86 1.26-4.25 2.02-6.39 2.02-6.16 0-11.42-3.96-13.26-9.35L3.06 35.59C6.46 43.2 14.52 48 24 48z"></path>
                            <path fill="none" d="M0 0h48v48H0z"></path>
                        </svg>
                        Se connecter avec Google
                    </button>
                </div>
            </div>
        </div>
    );
};