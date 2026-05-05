
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegistrationData extends UserData {
    qrCodeUrl?: string;
    paymentStatus: 'pending_payment' | 'paid' | 'pay_at_door';
    registeredAt: string;
}

export type AppState = 'form' | 'confirmation' | 'pending_payment' | 'success' | 'success_door' | 'payment_failed';
