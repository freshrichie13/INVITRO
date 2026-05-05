
// Firebase Configuration
// Supports environment variables for production, falls back to hardcoded values for development
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBvqhRJGsPq6DlZDi7srrAASA2QkAQ7lGM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "invitro-radianes.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "invitro-radianes",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "invitro-radianes.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "273564995581",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:273564995581:web:41406018ed2604a3169394"
};

// Mercado Pago Configuration
export const mpConfig = {
  publicKey: import.meta.env.VITE_MP_PUBLIC_KEY || 'APP_USR-d5189982-3f09-4684-8823-bd7270b3b337'
};

// EmailJS Configuration
// Supports environment variables for production, falls back to hardcoded values for development
export const emailJsConfig = {
    serviceID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_1oj8qi9',
    templateID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_i88nezb',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'prfdakd1VLopLQF-v'
};
