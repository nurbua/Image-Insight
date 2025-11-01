import { db, storage } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { AnalysisData, AnalysisResult, ChatMessage } from '../types';

/**
 * Sauvegarde le résultat d'une analyse dans Firebase.
 * @param userId L'ID de l'utilisateur.
 * @param file Le fichier image analysé.
 * @param data Les données d'analyse générées par Gemini.
 */
export const saveAnalysisResult = async (userId: string, file: File, data: AnalysisData): Promise<void> => {
  try {
    // 1. Téléverser l'image sur Firebase Storage
    const storageRef = ref(storage, `images/${userId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);

    // 2. Sauvegarder les métadonnées et l'URL de l'image dans Firestore
    const docRef = await addDoc(collection(db, 'analyses'), {
      userId,
      imageUrl,
      fileName: file.name,
      ...data,
      createdAt: serverTimestamp(),
    });

    console.log("Analyse sauvegardée avec l'ID: ", docRef.id);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'analyse: ", error);
    throw new Error("Impossible de sauvegarder le résultat de l'analyse.");
  }
};

/**
 * Récupère l'historique des analyses pour un utilisateur.
 * @param userId L'ID de l'utilisateur.
 * @returns Une promesse qui se résout avec un tableau de résultats d'analyse.
 */
export const getAnalysisHistory = async (userId: string): Promise<AnalysisResult[]> => {
    try {
        const q = query(
            collection(db, 'analyses'), 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const history: AnalysisResult[] = [];
        querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() } as AnalysisResult);
        });
        
        return history;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique: ", error);
        throw new Error("Impossible de récupérer l'historique des analyses.");
    }
}

/**
 * Sauvegarde un message de chat dans Firestore.
 * @param userId L'ID de l'utilisateur.
 * @param message Le message à sauvegarder.
 */
export const saveChatMessage = async (userId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<void> => {
    try {
        await addDoc(collection(db, 'users', userId, 'chat'), {
            ...message,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du message de chat: ", error);
        throw new Error("Impossible de sauvegarder le message de chat.");
    }
};

/**
 * Récupère l'historique de chat d'un utilisateur en temps réel.
 * @param userId L'ID de l'utilisateur.
 * @param callback La fonction à appeler avec les nouveaux messages.
 * @returns Une fonction pour se désabonner des mises à jour.
 */
export const getChatHistoryStream = (userId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe => {
    const q = query(
        collection(db, 'users', userId, 'chat'),
        orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        callback(messages);
    }, (error) => {
        console.error("Erreur lors de la récupération du chat en temps réel: ", error);
    });

    return unsubscribe;
};
