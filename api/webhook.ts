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

    const payerEmail = paymentData.external_reference || paymentData.payer?.email;
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

    // Generate Alter Ego Consign (1 of 4)
    const alterEgoVersions = [
      "Tu animal favorito de la infancia + una marca de condimento. (Ej: Tigre Heinz, Delfín Maggi, Cocodrilo Tajín)",
      "Tu personaje de caricatura favorito... pero pronunciado al revés. (Ej: Tobmab, Ymmit, Ocinotsed)",
      "Un objeto completamente inservible + un número al azar. (Ej: Pisapapeles 3000, Destapacaños 77, Sacagrapas 404)",
      "Si fueras magx de día y stripper de noche... ¿cuál sería tu nombre artístico?"
    ];
    const assignedAlterEgo = alterEgoVersions[Math.floor(Math.random() * alterEgoVersions.length)];

    const objectConsign = "TRAE UN OBJETO RANDOM. Basura reciclable, un electrónico descompuesto, un juguete olvidado, un adorno que nadie sabe de dónde salió, algo del cajón del caos, de debajo del sillón o de la cajuela del carro. Mientras más random, mejor. En serio, no lo olvides {va a hacer falta}. Ah, y una vez que lo tengas: guárdalo. No lo muestres ni lo menciones hasta que se te indique ese día. {No te decimos para qué todavía}. Confía.";

    // Update Firebase — confirm registration
    await updateDoc(pendingDoc.ref, {
      qrCodeUrl,
      paymentStatus: 'paid',
      assignedAlterEgo: assignedAlterEgo // Store it so we know what was sent
    });

    // Send confirmation email via EmailJS REST API
    try {
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailJsConfig.serviceID,
          template_id: emailJsConfig.templateID,
          user_id: emailJsConfig.publicKey,
          template_params: {
            to_name: `${registrationData.firstName} ${registrationData.lastName}`,
            to_email: payerEmail,
            qr_code_image_url: qrCodeUrl,
            event_name: "ESTÁS MIRANDO EN RADIANES",
            event_date: "Jueves 14 de mayo",
            event_location: "SAMÖ Cafeart · C. Cortadores de Aurora 120, Cd Aurora, León, Gto.",
            event_time: "6:00 – 8:30 pm",
            monto_pago: "$550 MXN",
            consigna_objeto: objectConsign,
            consigna_alter_ego: assignedAlterEgo
          }
        })
      });
      if (!emailResponse.ok) {
        console.error('EmailJS returned error:', await emailResponse.text());
      } else {
        console.log('Confirmation email sent successfully.');
      }
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
