import React from 'react';
import type { ExifData, LiteraryExcerpt, LocationInfo } from '../types';
import { ResultCard } from './ResultCard';
import { CopyButton } from './CopyButton';
import { CameraIcon, MapPinIcon, BookOpenIcon, HashIcon, ApertureIcon } from './icons';

interface ResultsDisplayProps {
  titles: string[];
  captions: string[];
  excerpts: LiteraryExcerpt[];
  exifData: ExifData | null;
  locationInfo: LocationInfo | null;
  hasImage: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ titles, captions, excerpts, exifData, locationInfo, hasImage }) => {
    if (!hasImage) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full bg-white dark:bg-bunker-900 rounded-lg shadow-lg border border-gray-200 dark:border-bunker-800">
                <div className="w-16 h-16 bg-gray-100 dark:bg-bunker-800 rounded-full flex items-center justify-center mb-4">
                    <BookOpenIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">En attente d'une image</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Téléchargez une image pour commencer l'analyse.
                </p>
            </div>
        )
    }

  const cardClassName = "bg-white dark:bg-bunker-900";

  return (
    <div className="space-y-6">
      {titles.length > 0 && (
        <ResultCard title="Titres Suggérés" icon={<HashIcon className="w-5 h-5" />} className={cardClassName}>
          <ul className="space-y-2">
            {titles.map((title, index) => (
              <li key={index} className="flex justify-between items-center gap-2 p-2 bg-gray-100 dark:bg-bunker-800 rounded-md">
                <span className="text-gray-700 dark:text-gray-300">{title}</span>
                <CopyButton textToCopy={title} />
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      {captions.length > 0 && (
        <ResultCard title="Légendes Suggérées" icon={<HashIcon className="w-5 h-5" />} className={cardClassName}>
          <ul className="space-y-2">
            {captions.map((caption, index) => (
              <li key={index} className="flex justify-between items-center gap-2 p-2 bg-gray-100 dark:bg-bunker-800 rounded-md">
                <span className="text-gray-700 dark:text-gray-300">{caption}</span>
                <CopyButton textToCopy={caption} />
              </li>
            ))}
          </ul>
        </ResultCard>
      )}

      {excerpts.length > 0 && (
        <ResultCard title="Extraits Littéraires" icon={<BookOpenIcon className="w-5 h-5" />} className={cardClassName}>
          <div className="space-y-4">
            {excerpts.map((excerpt, index) => (
              <div key={index} className="p-4 bg-gray-100 dark:bg-bunker-800 rounded-lg border border-gray-200 dark:border-bunker-700">
                <blockquote className="italic text-gray-700 dark:text-gray-300">
                  "{excerpt.extrait}"
                  {excerpt.traduction && <span className="block mt-2 text-sm text-gray-500 dark:text-gray-400">(Traduction: "{excerpt.traduction}")</span>}
                </blockquote>
                <p className="text-right mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  - {excerpt.auteur}, <cite>{excerpt.oeuvre}</cite>
                </p>
                <div className="mt-3 flex justify-end">
                    <CopyButton textToCopy={`${excerpt.extrait} - ${excerpt.auteur}, ${excerpt.oeuvre}`} />
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
      
      {locationInfo && Object.values(locationInfo).some(v => v) && (
        <ResultCard title="Lieu de la Prise de Vue" icon={<MapPinIcon className="w-5 h-5" />} className={cardClassName}>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {locationInfo.city && (
                <>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Commune:</span>
                    <span className="text-gray-800 dark:text-gray-200">{locationInfo.city}</span>
                </>
            )}
            {locationInfo.region && (
                <>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Région:</span>
                    <span className="text-gray-800 dark:text-gray-200">{locationInfo.region}</span>
                </>
            )}
            {locationInfo.country && (
                <>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Pays:</span>
                    <span className="text-gray-800 dark:text-gray-200">{locationInfo.country}</span>
                </>
            )}
          </div>
        </ResultCard>
      )}

      {exifData && (
        <ResultCard title="Données EXIF" icon={<CameraIcon className="w-5 h-5" />} className={cardClassName}>
          <div className="space-y-3 text-sm">
            {exifData.make && exifData.model && (
              <div className="flex items-center gap-3">
                <CameraIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span>{exifData.make} {exifData.model}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
                <ApertureIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span>
                    {exifData.focalLength && `${exifData.focalLength} `}
                    {exifData.fNumber && `ƒ/${exifData.fNumber} `}
                    {exifData.exposureTime && `${exifData.exposureTime}s `}
                    {exifData.iso && `ISO ${exifData.iso}`}
                </span>
            </div>
            {exifData.gps && (
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                 <div>
                  <span className="font-medium">Coordonnées GPS</span>
                  <span className="block text-gray-600 dark:text-gray-400">{exifData.gps.latitude}</span>
                  <span className="block text-gray-600 dark:text-gray-400">{exifData.gps.longitude}</span>
                </div>
              </div>
            )}
          </div>
        </ResultCard>
      )}
    </div>
  );
};