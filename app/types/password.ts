export interface AccessPassword {
  id: string;
  key: string;
  password: string;
  password_hash: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PasswordKey =
  | 'nunu'
  | 'ambassador'
  | 'guardian'
  | 'guardian_admin'
  | `event_${string}`;

export interface AuthState {
  nunu: { verified: boolean; expiry: number };
  ambassador: { verified: boolean; expiry: number };
  guardian: { verified: boolean; expiry: number };
  guardian_admin: { verified: boolean; expiry: number };
  events: {
    [eventId: string]: { verified: boolean; expiry: number };
  };
}
