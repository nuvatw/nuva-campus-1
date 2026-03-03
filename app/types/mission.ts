export interface Mission {
  id: string;
  name: string;
  status: 'completed' | 'ongoing' | 'locked';
  description: string;
  due_date?: string | null;
  submissions: Submission[];
}

export interface Submission {
  ambassadorId: string;
  submitted: boolean;
  submittedAt?: string;
}