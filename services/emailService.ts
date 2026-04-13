
import emailjs from '@emailjs/browser';
import { emailJsConfig } from '../config';

interface EmailParams {
  to_name: string;
  to_email: string;
  qr_code_image_url: string;
  event_name: string;      // Nuevo campo dinámico
  event_date: string;      // Nuevo campo dinámico
  event_location: string;  // Nuevo campo dinámico
  event_time: string;      // Nuevo campo dinámico
}

/**
 * Sends a confirmation email using EmailJS.
 * @param params The parameters for the email template.
 */
export const sendConfirmationEmail = async (params: EmailParams): Promise<void> => {
  try {
    const result = await emailjs.send(
      emailJsConfig.serviceID,
      emailJsConfig.templateID,
      params as any,
      emailJsConfig.publicKey
    );
    console.log('Email sent successfully:', result.text);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Could not send confirmation email.');
  }
};
