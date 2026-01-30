'use client';

import { useState, memo } from 'react';
import { mutate } from 'swr';
import { supabase } from '@/app/lib/supabase';
import type { University } from '@/app/data/universities';
import type { SupportType } from '../types';
import { Button, Input, useToast } from '@/app/components/ui';

interface SupportFormProps {
  university: University;
  supportType: SupportType;
  onSuccess: (data: { name: string; university: string; type: SupportType }) => void;
  onCancel: () => void;
}

function SupportFormComponent({
  university,
  supportType,
  onSuccess,
  onCancel,
}: SupportFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      showToast('error', '請填寫姓名和信箱');
      return;
    }

    setIsSubmitting(true);

    try {
      const insertData: Record<string, unknown> = {
        university_id: university.id,
        university_name: university.name,
        city: university.city,
        supporter_name: name.trim(),
        supporter_email: email.trim(),
        support_type: supportType,
        message: message.trim() || null,
      };

      // 加入單位/學系
      insertData.organization = organization.trim() || null;
      // 只有 help 類型才加入職稱
      if (supportType === 'help') {
        insertData.job_title = jobTitle.trim() || null;
      }

      const { error } = await supabase.from('campus_supporters').insert(insertData);

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '23505') {
          showToast('warning', '你已經為這所學校應援過了');
        } else {
          throw error;
        }
        return;
      }

      showToast('success', '感謝你的應援！我們會盡快與你聯繫');
      mutate('supporters');
      mutate('support-stats');
      // 傳遞資料以觸發動畫
      onSuccess({
        name: name.trim(),
        university: university.name,
        type: supportType,
      });
    } catch (err) {
      console.error('Submit error:', err);
      showToast('error', '提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-card rounded-2xl p-6 shadow-xl border border-border-light animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">
            {supportType === 'help' ? '我想幫忙' : '我想參加'}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            為 <span className="text-primary font-medium">{university.name}</span> 應援
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-bg-secondary"
          aria-label="關閉"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="姓名"
          placeholder="請輸入你的姓名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="請輸入你的信箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="單位 / 學系"
          placeholder={supportType === 'help' ? '例如：台大創創中心、資工系' : '例如：資訊工程學系、企管系'}
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          helperText="選填"
        />

        {supportType === 'help' && (
          <Input
            label="職稱"
            placeholder="例如：專案經理、教授、學生"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            helperText="選填"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            想說的話（選填）
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={supportType === 'help' ? '我可以提供什麼幫助...' : '我很期待這個活動...'}
            rows={3}
            className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-primary transition-all duration-200 resize-none"
          />
        </div>

        <Button type="submit" isLoading={isSubmitting} fullWidth size="lg">
          {supportType === 'help' ? '送出' : '為學校應援'}
        </Button>
      </form>
    </div>
  );
}

export const SupportForm = memo(SupportFormComponent);
export default SupportForm;
