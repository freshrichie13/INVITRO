
// Firebase Configuration
// Supports environment variables for production, falls back to hardcoded values for development
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAkPmNsYWi2HAxsxArIuu_NUEH8xqDqLak",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "liveshow29nov.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "liveshow29nov",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "liveshow29nov.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "466535666878",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:466535666878:web:31edf2c07ff7c757673aef"
};

// EmailJS Configuration
// Supports environment variables for production, falls back to hardcoded values for development
export const emailJsConfig = {
    serviceID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_3nev2f6',
    templateID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_7s5fpvw', // The template that accepts {{to_name}}, {{to_email}}, {{qr_code_image_url}}
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '6LS7KFxFzc74sMpvs'
};
