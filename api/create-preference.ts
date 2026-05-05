import type { VercelRequest, VercelResponse } from '@vercel/node';
import MercadoPago, { MercadoPagoConfig, Preference } from 'mercadopago';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// Initialize Firebase (conditional to avoid re-initialization in warm invocations)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBvqhRJGsPq6DlZDi7srrAASA2QkAQ7lGM",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "invitro-radianes.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "invitro-radianes",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "invitro-radianes.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "273564995581",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:273564995581:web:41406018ed2604a3169394"
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp);

async function checkIfPaidEmailExists(email: string): Promise<boolean> {
  const registrationsCollection = collection(db, 'registrations');
  const q = query(
    registrationsCollection,
    where("email", "==", email),
    where("paymentStatus", "==", "paid")
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, lastName, email } = req.body || {};

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check for duplicate paid registration
    const alreadyPaid = await checkIfPaidEmailExists(email);
    if (alreadyPaid) {
      return res.status(409).json({ error: 'Este email ya está registrado y tiene un pago confirmado.' });
    }

    // Initialize Mercado Pago client
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const preference = new Preference(client);

    const appUrl = 'https://invitro-radianes.vercel.app';

    const result = await preference.create({
      body: {
        items: [{
          id: 'entrada-evento',
          title: 'Entrada — ESTÁS MIRANDO EN RADIANES',
          quantity: 1,
          unit_price: 550,
          currency_id: 'MXN',
        }],
        payer: {
          name: firstName,
          surname: lastName,
          email: email,
        },
        back_urls: {
          success: `${appUrl}/?payment=success`,
          failure: `${appUrl}/?payment=failure`,
          pending: `${appUrl}/?payment=pending`,
        },
        auto_return: 'approved',
        ...(appUrl.includes('localhost') ? {} : { notification_url: `${appUrl}/api/webhook` }),
      }
    });

    return res.status(200).json({ init_point: result.init_point });

  } catch (error: any) {
    console.error('Error detallado de MP:', error);
    return res.status(500).json({ 
      error: error.message || 'Error al crear la preferencia de pago.',
      details: error.response?.data || error.cause || error 
    });
  }
}
