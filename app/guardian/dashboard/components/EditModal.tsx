'use client';

import { useState, memo } from 'react';
import { Button, Input, Modal } from '@/app/components/ui';

interface Registration {
  id: string;
  event_id: string;
  participant_name: string;
  participant_email: string;
  member_type: string;
  ambassador_id: string | null;
  attendance_mode: string;
  lunch_box_required: boolean;
  attended: boolean;
  attended_at: string | null;
  lunch_collected: boolean;
  lunch_collected_at: string | null;
  notification_sent: boolean;
  checkin_code: string | null;
  lunch_code: string | null;
}

interface EditModalProps {
  registration: Registration;
  onClose: () => void;
  onSave: (updates: Partial<Registration>) => Promise<void>;
}

function EditModalComponent({
  registration,
  onClose,
  onSave,
}: EditModalProps) {
  const [formData, setFormData] = useState({
    participant_name: registration.participant_name,
    participant_email: registration.participant_email,
    attendance_mode: registration.attendance_mode,
    lunch_box_required: registration.lunch_box_required,
    attended: registration.attended,
    lunch_collected: registration.lunch_collected,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="編輯報名資料"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            取消
          </Button>
          <Button type="submit" form="edit-form" isLoading={isSaving}>
            儲存
          </Button>
        </>
      }
    >
      <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="姓名"
          value={formData.participant_name}
          onChange={e => setFormData({ ...formData, participant_name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          value={formData.participant_email}
          onChange={e => setFormData({ ...formData, participant_email: e.target.value })}
        />
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">參與方式</label>
          <select
            value={formData.attendance_mode}
            onChange={e => setFormData({ ...formData, attendance_mode: e.target.value })}
            className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="offline">實體</option>
            <option value="online">線上</option>
          </select>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.lunch_box_required}
              onChange={e => setFormData({ ...formData, lunch_box_required: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">需要便當</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.attended}
              onChange={e => setFormData({ ...formData, attended: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">已報到</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.lunch_collected}
              onChange={e => setFormData({ ...formData, lunch_collected: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">已領便當</span>
          </label>
        </div>
        <div className="pt-4 border-t border-border-light text-xs text-text-muted">
          <p>報到碼: {registration.checkin_code || '-'}</p>
          <p>便當碼: {registration.lunch_code || '-'}</p>
        </div>
      </form>
    </Modal>
  );
}

export const EditModal = memo(EditModalComponent);
export default EditModal;

export type { Registration, EditModalProps };
