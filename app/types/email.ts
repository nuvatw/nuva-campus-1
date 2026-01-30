export interface EmailLog {
  id: string;
  event_id: string;
  registration_id: string | null;
  recipient_email: string;
  recipient_name: string | null;
  email_type: 'checkin_code' | 'reminder' | 'test';
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface SendEmailRequest {
  eventId: string;
  type: 'test' | 'single' | 'all';
  registrationId?: string;
}

export interface SendEmailResponse {
  success: boolean;
  sentCount?: number;
  failedCount?: number;
  sentTo?: string;
  error?: string;
}
