
// This app does not have a build process, so we must load the library from a CDN.
// Let's create a dynamic script loader.
const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
};

declare const ExifReader: any;

import type { ExifData } from "../types";

// Helper to format exposure time
const formatExposureTime = (value: number): string => {
    if (value >= 1) {
        return value.toString();
    }
    if (value > 0) {
        const reciprocal = Math.round(1 / value);
        return `1/${reciprocal}`;
    }
    return String(value);
};

export const parseExifData = async (file: File): Promise<ExifData | null> => {
    try {
        await loadScript('https://unpkg.com/exifreader@4.21.0/dist/exif-reader.js');
        
        // Reading the file as an ArrayBuffer is more robust for binary data.
        const arrayBuffer = await file.arrayBuffer();
        const tags = ExifReader.load(arrayBuffer);
        
        const data: ExifData = {};

        if (tags.Make?.description) data.make = tags.Make.description;
        if (tags.Model?.description) data.model = tags.Model.description.replace(/\0/g, '').trim();
        
        // Use description for FocalLength as it includes units. Use value for others for clean numbers.
        if (tags.FocalLength?.description) data.focalLength = tags.FocalLength.description;
        if (tags.FNumber?.value) data.fNumber = String(tags.FNumber.value);
        if (tags.ISOSpeedRatings?.value) data.iso = String(tags.ISOSpeedRatings.value);
        if (tags.ExposureTime?.value) data.exposureTime = formatExposureTime(tags.ExposureTime.value);
        
        // Simplified GPS data extraction: get the raw description string.
        if (tags.GPSLatitude?.description && tags.GPSLongitude?.description) {
            data.gps = {
                latitude: tags.GPSLatitude.description,
                longitude: tags.GPSLongitude.description,
            };
        }
        
        // Return null if no data was extracted, otherwise the data object
        return Object.keys(data).length > 0 ? data : null;

    } catch (error) {
        console.warn("Could not read EXIF data:", error);
        return null; // Return null if there's an error (e.g., no EXIF data in image)
    }
};
