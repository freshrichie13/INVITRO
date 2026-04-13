
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface RegistrationData extends UserData {
    qrCodeDataUrl: string;
    registeredAt: string;
}

export type AppState = 'form' | 'confirmation' | 'success';
