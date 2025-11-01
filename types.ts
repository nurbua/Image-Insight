export type Theme = 'light' | 'dark';

export interface LiteraryExcerpt {
  extrait: string;
  traduction: string | null;
  auteur: string;
  oeuvre: string;
}

export interface ExifData {
  make?: string;
  model?: string;
  focalLength?: string;
  fNumber?: string;
  iso?: string;
  exposureTime?: string;
  gps?: {
    latitude: string;
    longitude: string;
  };
}

// FIX: Add missing type definitions for Firebase services.
export interface AnalysisData {
  titles: string[];
  captions: string[];
  excerpts: LiteraryExcerpt[];
}

export interface AnalysisResult extends AnalysisData {
  id: string;
  imageUrl: string;
  fileName: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  userId: string;
}

export interface ChatMessage {
  id?: string;
  text: string;
  role: 'user' | 'model';
  createdAt: any; // Using `any` for Firestore timestamp flexibility
}
