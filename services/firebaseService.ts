
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '../config';
import { RegistrationData } from '../types';

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const registrationsCollection = collection(db, 'registrations');

/**
 * Checks if an email already exists in the Firestore database.
 * @param email The email to check.
 * @returns A boolean indicating if the email exists.
 */
export const checkIfEmailExists = async (email: string): Promise<boolean> => {
  const q = query(registrationsCollection, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

/**
 * Saves a new registration record to the Firestore database.
 * @param data The registration data to save.
 */
export const saveRegistration = async (data: Omit<RegistrationData, 'registeredAt'> & { registeredAt: string }): Promise<void> => {
  try {
    await addDoc(registrationsCollection, {
        ...data,
        registeredAt: Timestamp.fromDate(new Date(data.registeredAt))
    });
  } catch (error) {
    console.error("Error adding document to Firebase: ", error);
    throw new Error('Could not save registration data.');
  }
};