export interface NunuEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  picnicTime?: string;
  location: string;
  meetingTime: string;
  description?: string;
  gameStartTime?: string;
  preMeeting?: {
    date: string;
    startTime: string;
    endTime: string;
    link: string;
  };
}

export interface NunuEventRegistration {
  id: string;
  event_id: string;
  registration_number: number;
  chinese_name: string;
  english_name: string;
  shirt_size: ShirtSize;
  dietary_restrictions: string | null;
  picky_eating: string | null;
  registered_at: string;
  created_at: string;
  updated_at: string;
}

export type ShirtSize = 'S' | 'M' | 'L' | 'XL' | '2XL';

export const SHIRT_SIZES: ShirtSize[] = ['S', 'M', 'L', 'XL', '2XL'];
