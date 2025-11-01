import React, { useState, useRef, useCallback } from 'react';
import { UploadCloudIcon, LinkIcon } from './icons';

interface ImageUploaderProps {
  onImageReady: (file: File) => void;
  disabled: boolean;
}

type UploadMode = 'file' | 'url';

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageReady, disabled }) => {
  const [mode, setMode] = useState<UploadMode>('file');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      onImageReady(file);
    }
  };

  const handleUrlSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url) {
      setError('Veuillez entrer une URL.');
      return;
    }
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur de réseau: ${response.statusText}`);
      }
      const blob = await response.blob();
      const fileName = url.substring(url.lastIndexOf('/') + 1) || 'image.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      onImageReady(file);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger l'image depuis l'URL. Vérifiez le lien et réessayez.");
    }
  };
  
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="bg-white dark:bg-bunker-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800">
      <div className="flex border-b border-gray-200 dark:border-bunker-700 mb-4">
        <button
          onClick={() => setMode('file')}
          className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 ${mode === 'file' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          <UploadCloudIcon className="w-5 h-5" /> Fichier
        </button>
        <button
          onClick={() => setMode('url')}
          className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 ${mode === 'url' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          <LinkIcon className="w-5 h-5" /> URL
        </button>
      </div>

      {mode === 'file' ? (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png"
            className="hidden"
            disabled={disabled}
          />
          <button
            onClick={triggerFileSelect}
            disabled={disabled}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-bunker-900 disabled:bg-gray-400 dark:disabled:bg-bunker-700 disabled:cursor-not-allowed transition-colors"
          >
            Choisir une image
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Formats supportés : JPG, PNG.
          </p>
        </div>
      ) : (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemple.com/image.jpg"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-bunker-700 rounded-lg bg-gray-50 dark:bg-bunker-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={disabled}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-bunker-900 disabled:bg-gray-400 dark:disabled:bg-bunker-700 disabled:cursor-not-allowed transition-colors"
          >
            Analyser depuis l'URL
          </button>
        </form>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>}
    </div>
  );
};