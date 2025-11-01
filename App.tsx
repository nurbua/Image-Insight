import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './services/firebaseConfig';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ThemeToggle } from './components/ThemeToggle';
import { Loader } from './components/Loader';
import { generateContent } from './services/geminiService';
import { parseExifData } from './services/exifService';
import type { ExifData, LiteraryExcerpt, Theme, LocationInfo } from './types';
import { LogoIcon, MessageCircleIcon, EnterFullScreenIcon, ExitFullScreenIcon } from './components/icons';
import { Login } from './components/Login';
import { Chat } from './components/Chat';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [titles, setTitles] = useState<string[]>([]);
  const [captions, setCaptions] = useState<string[]>([]);
  const [excerpts, setExcerpts] = useState<LiteraryExcerpt[]>([]);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  
  useEffect(() => {
    if (process.env.API_KEY) {
      setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
    } else {
       setError("La clé API Gemini n'est pas configurée.");
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
        setAuthChecked(true);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            alert(`Erreur lors du passage en plein écran: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  const resetState = (keepImage: boolean = false) => {
    setTitles([]);
    setCaptions([]);
    setExcerpts([]);
    setExifData(null);
    setLocationInfo(null);
    setError(null);
    if (!keepImage) {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleImageProcess = useCallback(async (file: File) => {
    if (!ai) {
      setError("Le client Gemini API n'est pas initialisé.");
      return;
    }
    
    setIsLoading(true);
    resetState(true); // Keep image preview while processing
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    try {
      const exifResult = await parseExifData(file);
      const contentResult = await generateContent(ai, file, exifResult);
      
      if(contentResult) {
        setTitles(contentResult.titles);
        setCaptions(contentResult.captions);
        setExcerpts(contentResult.excerpts);
        setLocationInfo(contentResult.location);
      }
      setExifData(exifResult);

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de l'analyse de l'image. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }, [ai]);

  if (!authChecked) {
      return <div className="min-h-screen flex items-center justify-center bg-ivory-light dark:bg-bunker-950"><Loader /></div>;
  }

  if (!user && isFirebaseConfigured) {
      return <Login />;
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <header className="py-4 px-4 md:px-8 border-b border-gray-200 dark:border-bunker-800 sticky top-0 bg-white/80 dark:bg-bunker-950/80 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Image Insight
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-bunker-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-bunker-950"
              aria-label="Basculer en plein écran"
            >
              {isFullscreen ? <ExitFullScreenIcon className="h-6 w-6" /> : <EnterFullScreenIcon className="h-6 w-6" />}
            </button>
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
            <ImageUploader onImageReady={handleImageProcess} disabled={isLoading} />
            {error && (
              <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Erreur : </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
          </div>
          
          <div className="lg:mt-0 space-y-6">
            {imagePreview && (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-bunker-800 shadow-lg">
                    <img src={imagePreview} alt="Aperçu" className="w-full h-auto object-contain" />
                </div>
            )}
            {isLoading ? (
              <Loader />
            ) : (
              (titles.length > 0 || captions.length > 0 || excerpts.length > 0 || exifData || locationInfo) ? (
                <ResultsDisplay
                  titles={titles}
                  captions={captions}
                  excerpts={excerpts}
                  exifData={exifData}
                  locationInfo={locationInfo}
                  hasImage={!!imagePreview}
                />
              ) : (
                 !imagePreview &&
                <div className="flex flex-col items-center justify-center text-center p-8 h-full bg-white dark:bg-bunker-900 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-bunker-800 rounded-full flex items-center justify-center mb-4">
                        <LogoIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Bienvenue sur Image Insight</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Téléchargez une image pour commencer.
                    </p>
                </div>
              )
            )}
          </div>
        </div>
      </main>

       {user && ai && (
          <>
              {!isChatOpen && (
                  <button
                      onClick={() => setIsChatOpen(true)}
                      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-40 transition-transform hover:scale-110"
                      aria-label="Ouvrir le chat"
                  >
                      <MessageCircleIcon className="w-8 h-8" />
                  </button>
              )}
              {isChatOpen && (
                  <Chat user={user} ai={ai} onClose={() => setIsChatOpen(false)} />
              )}
          </>
      )}
    </div>
  );
};

export default App;