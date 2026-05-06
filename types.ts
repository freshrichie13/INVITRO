
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  howDidYouHear?: string;
}

export interface RegistrationData extends UserData {
    qrCodeUrl?: string;
    paymentStatus: 'pending_payment' | 'paid';
    assignedAlterEgo?: string;
    registeredAt: string;
}

export type AppState = 'landing' | 'form' | 'confirmation' | 'pending_payment' | 'success' | 'payment_failed';
