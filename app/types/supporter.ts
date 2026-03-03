export interface Supporter {
  id: string;
  supporter_name: string;
  university_name: string;
  support_type: 'attend' | 'help';
  message: string | null;
  created_at: string;
}

export interface SupportStats {
  university_id: string;
  university_name: string;
  city: string;
  total_supporters: number;
  attend_count: number;
  help_count: number;
}

export interface TotalStats {
  totalSupporters: number;
  totalHelpers: number;
  totalAttendees: number;
  supportedSchools: number;
}

export type SupportType = 'attend' | 'help';
