export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  created_at: string;
}

export interface SubscriberFormData {
  name: string;
  email: string;
}
