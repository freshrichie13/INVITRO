
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { firebaseConfig } from '../config';
import { RegistrationData } from '../types';

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const registrationsCollection = collection(db, 'registrations');

/**
 * Checks if an email already exists in the Firestore database (any status).
 */
export const checkIfEmailExists = async (email: string): Promise<boolean> => {
  const q = query(registrationsCollection, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

/**
 * Checks if an email already has a confirmed (paid) registration.
 */
export const checkIfPaidEmailExists = async (email: string): Promise<boolean> => {
  const q = query(
    registrationsCollection,
    where("email", "==", email),
    where("paymentStatus", "==", "paid")
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

/**
 * Saves a pending registration (before payment) to Firestore.
 */
export const savePendingRegistration = async (
  data: Omit<RegistrationData, 'qrCodeUrl'> & { qrCodeUrl?: string }
): Promise<void> => {
  try {
    const fullName = `${data.firstName} ${data.lastName}`;
    await addDoc(registrationsCollection, {
      firstName: data.firstName,
      lastName: data.lastName,
      name: fullName,
      email: data.email,
      qrCodeUrl: data.qrCodeUrl || '',
      paymentStatus: data.paymentStatus,
      howDidYouHear: data.howDidYouHear || '',
      registeredAt: Timestamp.fromDate(new Date(data.registeredAt))
    });
  } catch (error) {
    console.error("Error saving pending registration: ", error);
    throw new Error('Could not save registration data.');
  }
};

/**
 * Confirms a pending registration by updating paymentStatus to 'paid' and setting the QR URL.
 */
export const confirmRegistration = async (email: string, qrCodeUrl: string): Promise<void> => {
  try {
    const q = query(
      registrationsCollection,
      where("email", "==", email),
      where("paymentStatus", "==", "pending_payment")
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.warn(`No pending registration found for email: ${email}`);
      return;
    }
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, { qrCodeUrl, paymentStatus: 'paid' });
  } catch (error) {
    console.error("Error confirming registration: ", error);
    throw new Error('Could not confirm registration.');
  }
};

/**
 * Saves a new registration record to the Firestore database.
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
