
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegistrationData extends UserData {
    qrCodeUrl: string;      // URL https:// del QR (api.qrserver.com)
    registeredAt: string;
}

export type AppState = 'form' | 'confirmation' | 'success';
