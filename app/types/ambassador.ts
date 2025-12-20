export interface Ambassador {
  id: string; // UUID 格式
  ambassador_id: string; // 三位數編號（000, 001...）
  name: string | null;
  is_alive: boolean;
  school: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  discord_id: string | null;
  line_user_id: string | null;
  student_proof_url: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}