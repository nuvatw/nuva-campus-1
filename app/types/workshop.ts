export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface Workshop {
  id: string;
  title: string;
  type: 'online' | 'offline';
  date: string;
  time: string;
  checkinTime?: string;
  location: string;
  locationUrl?: string;
  description?: string;
  registrationUrl?: string;
  liveUrl?: string;
  tallyFormId?: string;
  schedule?: ScheduleItem[];
  youtubeVideoId?: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  member_type: string;
  ambassador_id: string | null;
  participant_name: string;
  participant_email: string;
  attendance_mode: 'online' | 'offline';
  lunch_box_required: boolean;
  attended: boolean;
  registered_at: string;
  created_at: string;
  updated_at: string;
}