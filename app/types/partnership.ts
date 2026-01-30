export interface PartnershipApplication {
  id: string;
  school: string;
  department: string;
  job_title: string;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface PartnershipFormData {
  school: string;
  department: string;
  job_title: string;
  name: string;
  phone: string;
  email: string;
  message?: string;
}
