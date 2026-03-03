'use client';

import { useState, useCallback, useEffect } from 'react';
import PasswordGate from './components/PasswordGate';
import CreateLogForm from './components/CreateLogForm';
import LogList from './components/LogList';
import TemplateManager from './components/TemplateManager';
import { storyService } from '@/app/services/story.service';
import type { StoryLog, StoryTemplate } from '@/app/types/story';

function StoryCreateDashboard() {
  const [logs, setLogs] = useState<StoryLog[]>([]);
  const [templates, setTemplates] = useState<StoryTemplate[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [pendingSave, setPendingSave] = useState<{ location: string; content: string; recorder: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await storyService.getLogs();
      setLogs(data);
    } catch {
      // Error handled in service
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const data = await storyService.getTemplates();
      setTemplates(data);
    } catch {
      // Error handled in service
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchTemplates();
  }, [fetchLogs, fetchTemplates]);

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">故事進度管理</h1>
              <p className="text-sm text-text-secondary">記錄你的校園巡迴故事</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <CreateLogForm
          templates={templates}
          onLogCreated={fetchLogs}
          onSaveTemplate={setPendingSave}
        />

        <LogList
          logs={logs}
          isLoading={isLoadingLogs}
          onDeleted={fetchLogs}
        />

        <TemplateManager
          templates={templates}
          isLoading={isLoadingTemplates}
          onUpdated={fetchTemplates}
          pendingSave={pendingSave}
          onPendingSaveDone={() => setPendingSave(null)}
        />
      </div>
    </div>
  );
}

export default function StoryCreatePage() {
  return (
    <PasswordGate>
      <StoryCreateDashboard />
    </PasswordGate>
  );
}
