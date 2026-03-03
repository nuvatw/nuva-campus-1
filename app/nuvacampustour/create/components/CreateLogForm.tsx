'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/app/components/ui/Toast';
import { storyService } from '@/app/services/story.service';
import type { StoryTemplate, CreateStoryLogInput } from '@/app/types/story';

interface CreateLogFormProps {
  templates: StoryTemplate[];
  onLogCreated: () => void;
  onSaveTemplate: (data: { location: string; content: string; recorder: string }) => void;
}

function getNow() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5);
  return { date, time };
}

export default function CreateLogForm({ templates, onLogCreated, onSaveTemplate }: CreateLogFormProps) {
  const { showToast } = useToast();
  const now = getNow();
  const [formData, setFormData] = useState<CreateStoryLogInput>({
    log_date: now.date,
    log_time: now.time,
    location: '',
    content: '',
    recorder: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof CreateStoryLogInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTemplateSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    if (!templateId) return;
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        location: template.location || prev.location,
        content: template.content || prev.content,
        recorder: template.recorder || prev.recorder,
      }));
      showToast('info', `已套用模板「${template.name}」`);
    }
    e.target.value = '';
  }, [templates, showToast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.location.trim() || !formData.content.trim() || !formData.recorder.trim()) {
      showToast('warning', '請填寫所有必填欄位');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await storyService.createLog({
        ...formData,
        location: formData.location.trim(),
        content: formData.content.trim(),
        recorder: formData.recorder.trim(),
      });

      if (result) {
        showToast('success', 'Log 已新增');
        const freshNow = getNow();
        setFormData({
          log_date: freshNow.date,
          log_time: freshNow.time,
          location: '',
          content: '',
          recorder: formData.recorder, // Keep recorder for convenience
        });
        onLogCreated();
      } else {
        showToast('error', '新增失敗，請稍後再試');
      }
    } catch {
      showToast('error', '新增失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, showToast, onLogCreated]);

  const handleSaveAsTemplate = useCallback(() => {
    if (!formData.location.trim() && !formData.content.trim() && !formData.recorder.trim()) {
      showToast('warning', '請先填寫表單內容再儲存模板');
      return;
    }
    onSaveTemplate({
      location: formData.location.trim(),
      content: formData.content.trim(),
      recorder: formData.recorder.trim(),
    });
  }, [formData, showToast, onSaveTemplate]);

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg font-bold text-text-primary mb-5 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        新增 Log
      </h2>

      {/* Template selector */}
      {templates.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">快速套用模板</label>
          <select
            onChange={handleTemplateSelect}
            defaultValue=""
            className="w-full input text-sm"
          >
            <option value="">選擇模板...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Date & Time row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            日期 <span className="text-error">*</span>
          </label>
          <input
            type="date"
            value={formData.log_date}
            onChange={e => handleChange('log_date', e.target.value)}
            className="w-full input text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            時間 <span className="text-error">*</span>
          </label>
          <input
            type="time"
            value={formData.log_time}
            onChange={e => handleChange('log_time', e.target.value)}
            className="w-full input text-sm"
            required
          />
        </div>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          地點 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={e => handleChange('location', e.target.value)}
          placeholder="例如：台大、政大、師大"
          className="w-full input text-sm"
          required
        />
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          內容 <span className="text-error">*</span>
        </label>
        <textarea
          value={formData.content}
          onChange={e => handleChange('content', e.target.value)}
          placeholder="記錄今天發生的事情..."
          rows={4}
          className="w-full input text-sm resize-y min-h-[100px]"
          required
        />
      </div>

      {/* Recorder */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          記錄人 <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={formData.recorder}
          onChange={e => handleChange('recorder', e.target.value)}
          placeholder="你的名字"
          className="w-full input text-sm"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleSaveAsTemplate}
          className="btn-secondary text-sm py-2.5 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          儲存為模板
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary text-sm py-2.5 flex-1 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
          {isSubmitting ? '送出中...' : '送出 Log'}
        </button>
      </div>
    </form>
  );
}
