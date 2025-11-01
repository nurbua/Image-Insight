import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//
// IMPORTANT: Remplacez l'objet ci-dessous par la configuration de votre propre projet Firebase.
// Vous pouvez trouver cette configuration dans la console Firebase, sous les paramètres de votre projet.
//
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

// Vérifie si la configuration de Firebase a été remplacée par de vraies valeurs
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "VOTRE_API_KEY" && 
  firebaseConfig.projectId !== "VOTRE_PROJECT_ID";


// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services Firebase pour les utiliser dans l'application
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);