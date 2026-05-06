
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  getDoc, 
  onSnapshot, 
  setDoc, 
  increment, 
  Timestamp 
} from 'firebase/firestore';
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

/**
 * Subscribes to real-time updates for the occupied spots count.
 */
export const getOccupiedSpotsListener = (callback: (count: number) => void) => {
  const statsRef = doc(db, 'metadata', 'event_stats');
  
  return onSnapshot(statsRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().occupied_spots || 0);
    } else {
      // Initialize if doesn't exist
      setDoc(statsRef, { occupied_spots: 0 });
      callback(0);
    }
  });
};

/**
 * Adds an email to the waitlist collection.
 */
export const addToWaitlist = async (email: string): Promise<void> => {
  try {
    const waitlistCollection = collection(db, 'waitlist');
    await addDoc(waitlistCollection, {
      email: email.toLowerCase().trim(),
      registeredAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error adding to waitlist: ", error);
    throw new Error('Could not join waitlist.');
  }
};

/**
 * Atomic increment of the occupied spots count.
 * To be used from serverless functions (webhooks).
 */
export const incrementOccupiedSpots = async (): Promise<void> => {
  const statsRef = doc(db, 'metadata', 'event_stats');
  await updateDoc(statsRef, {
    occupied_spots: increment(1)
  });
};

