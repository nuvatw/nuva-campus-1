'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { useToast } from '@/app/components/ui/Toast';
import { storyService } from '@/app/services/story.service';
import type { StoryTemplate } from '@/app/types/story';

interface TemplateManagerProps {
  templates: StoryTemplate[];
  isLoading: boolean;
  onUpdated: () => void;
  /** When set, opens the save modal with this data pre-filled */
  pendingSave: { location: string; content: string; recorder: string } | null;
  onPendingSaveDone: () => void;
}

export default function TemplateManager({
  templates,
  isLoading,
  onUpdated,
  pendingSave,
  onPendingSaveDone,
}: TemplateManagerProps) {
  const { showToast } = useToast();
  const [templateName, setTemplateName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    if (!templateName.trim() || !pendingSave) return;

    setIsSaving(true);
    try {
      const result = await storyService.createTemplate({
        name: templateName.trim(),
        location: pendingSave.location,
        content: pendingSave.content,
        recorder: pendingSave.recorder,
      });

      if (result) {
        showToast('success', `模板「${templateName.trim()}」已儲存`);
        setTemplateName('');
        onPendingSaveDone();
        onUpdated();
      } else {
        showToast('error', '儲存失敗');
      }
    } catch {
      showToast('error', '儲存失敗');
    } finally {
      setIsSaving(false);
    }
  }, [templateName, pendingSave, showToast, onPendingSaveDone, onUpdated]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    setDeletingId(id);
    try {
      const success = await storyService.deleteTemplate(id);
      if (success) {
        showToast('success', `模板「${name}」已刪除`);
        onUpdated();
      } else {
        showToast('error', '刪除失敗');
      }
    } catch {
      showToast('error', '刪除失敗');
    } finally {
      setDeletingId(null);
    }
  }, [showToast, onUpdated]);

  return (
    <>
      {/* Save Template Modal */}
      <Modal
        isOpen={!!pendingSave}
        onClose={onPendingSaveDone}
        title="儲存為模板"
        size="sm"
      >
        <div className="py-4">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">模板名稱</label>
          <input
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="例如：日常巡迴紀錄"
            className="w-full input text-sm mb-4"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && templateName.trim()) handleSave();
            }}
          />

          {pendingSave && (
            <div className="bg-bg-secondary rounded-lg p-3 mb-4 text-xs text-text-secondary space-y-1">
              {pendingSave.location && <p>地點：{pendingSave.location}</p>}
              {pendingSave.content && <p>內容：{pendingSave.content.slice(0, 60)}{pendingSave.content.length > 60 ? '...' : ''}</p>}
              {pendingSave.recorder && <p>記錄人：{pendingSave.recorder}</p>}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onPendingSaveDone}
              className="btn-secondary text-sm py-2 flex-1"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!templateName.trim() || isSaving}
              className="btn-primary text-sm py-2 flex-1 disabled:opacity-50"
            >
              {isSaving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Template List */}
      <div className="bg-white border border-border rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          模板管理
          <span className="text-sm font-normal text-text-muted">({templates.length})</span>
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse h-12 bg-bg-secondary rounded-lg" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">
            還沒有模板，填寫表單後點擊「儲存為模板」
          </p>
        ) : (
          <div className="space-y-2">
            {templates.map(template => (
              <div
                key={template.id}
                className="flex items-center justify-between border border-border/60 rounded-xl px-4 py-3 hover:border-border transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{template.name}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {[template.location, template.recorder].filter(Boolean).join(' · ') || '空模板'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(template.id, template.name)}
                  disabled={deletingId === template.id}
                  className="text-text-muted hover:text-error transition-colors p-1.5 ml-2 disabled:opacity-50"
                  aria-label={`刪除模板 ${template.name}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
