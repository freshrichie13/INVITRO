import type { VercelRequest, VercelResponse } from '@vercel/node';
import MercadoPago, { MercadoPagoConfig, Payment } from 'mercadopago';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

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

const emailJsConfig = {
  serviceID: process.env.VITE_EMAILJS_SERVICE_ID || 'service_1oj8qi9',
  templateID: process.env.VITE_EMAILJS_TEMPLATE_ID || 'template_i88nezb',
  publicKey: process.env.VITE_EMAILJS_PUBLIC_KEY || 'prfdakd1VLopLQF-v'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { topic, id } = req.query;

  // Only process payment notifications
  if (topic !== 'payment' || !id) {
    return res.status(200).end();
  }

  try {
    // Get payment details from MP
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: String(id) });

    // Only process approved payments
    if (paymentData.status !== 'approved') {
      return res.status(200).end();
    }

    const payerEmail = paymentData.payer?.email;
    if (!payerEmail) {
      console.warn('Webhook: no payer email in payment data');
      return res.status(200).end();
    }

    const registrationsCollection = collection(db, 'registrations');

    // Idempotency check — skip if already paid
    const paidQuery = query(
      registrationsCollection,
      where("email", "==", payerEmail),
      where("paymentStatus", "==", "paid")
    );
    const paidSnapshot = await getDocs(paidQuery);
    if (!paidSnapshot.empty) {
      console.log(`Webhook: email ${payerEmail} already confirmed, skipping.`);
      return res.status(200).end();
    }

    // Find pending registration
    const pendingQuery = query(
      registrationsCollection,
      where("email", "==", payerEmail),
      where("paymentStatus", "==", "pending_payment")
    );
    const pendingSnapshot = await getDocs(pendingQuery);

    if (pendingSnapshot.empty) {
      console.warn(`Webhook: no pending registration found for email: ${payerEmail}`);
      return res.status(200).end();
    }

    const pendingDoc = pendingSnapshot.docs[0];
    const registrationData = pendingDoc.data();

    // Generate QR URL
    const qrContent = encodeURIComponent(
      `PAGADO EN LÍNEA | Nombre: ${registrationData.firstName} ${registrationData.lastName} | Email: ${payerEmail} | Evento: ESTÁS MIRANDO EN RADIANES - MAYO 14`
    );
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrContent}&margin=10`;

    // Update Firebase — confirm registration
    await updateDoc(pendingDoc.ref, {
      qrCodeUrl,
      paymentStatus: 'paid'
    });

    // Send confirmation email via EmailJS
    try {
      emailjs.init(emailJsConfig.publicKey);
      await emailjs.send(
        emailJsConfig.serviceID,
        emailJsConfig.templateID,
        {
          to_name: `${registrationData.firstName} ${registrationData.lastName}`,
          to_email: payerEmail,
          qr_code_image_url: qrCodeUrl,
          event_name: "ESTÁS MIRANDO EN RADIANES",
          event_date: "14 de Mayo",
          event_location: "Por confirmar",
          event_time: "8:00 PM"
        }
      );
    } catch (emailError) {
      // Log but don't fail — registration is already confirmed in Firebase
      console.error('Webhook: failed to send confirmation email:', emailError);
    }

    return res.status(200).end();

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Error processing webhook.' });
  }
}
