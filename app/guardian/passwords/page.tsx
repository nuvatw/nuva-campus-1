'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { AuthGuard } from '@/app/components/AuthGuard';
import type { AccessPassword } from '@/app/types/password';

export default function PasswordManagementPage() {
  const [passwords, setPasswords] = useState<AccessPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const { data, error } = await supabase
        .from('access_passwords')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      setPasswords(data || []);
    } catch (err) {
      console.error('Error fetching passwords:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (password: AccessPassword) => {
    setEditingId(password.id);
    setEditValue(password.password);
    setMessage(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (id: string) => {
    if (!editValue || editValue.length !== 4 || !/^\d{4}$/.test(editValue)) {
      setMessage({ type: 'error', text: '密碼必須是 4 位數字' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('access_passwords')
        .update({ password: editValue, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setPasswords(prev =>
        prev.map(p => (p.id === id ? { ...p, password: editValue } : p))
      );
      setEditingId(null);
      setEditValue('');
      setMessage({ type: 'success', text: '密碼已更新' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving password:', err);
      setMessage({ type: 'error', text: '儲存失敗' });
    } finally {
      setSaving(false);
    }
  };

  const getDisplayName = (key: string): string => {
    const names: Record<string, string> = {
      guardian: '守護者',
      nunu: '努努',
      ambassador: '校園大使',
      guardian_admin: '密碼管理',
    };
    if (key.startsWith('event_')) {
      return `活動 ${key.replace('event_', '').toUpperCase()}`;
    }
    return names[key] || key;
  };

  return (
    <AuthGuard roleKey="guardian_admin" title="輸入管理密碼" redirectOnFail="/guardian">
      <div className="py-8 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/guardian"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">返回</span>
            </Link>
            <h1 className="text-lg font-medium text-text-primary">密碼管理</h1>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-success/10 text-success'
                  : 'bg-error/10 text-error'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Password List */}
          {loading ? (
            <div className="text-center py-12 text-text-muted">載入中...</div>
          ) : (
            <div className="space-y-3">
              {passwords.map((password) => (
                <div key={password.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">
                        {getDisplayName(password.key)}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        {password.description || password.key}
                      </p>
                    </div>

                    {editingId === password.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="input w-20 text-center text-lg font-mono tracking-widest"
                          maxLength={4}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(password.id)}
                          disabled={saving}
                          className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 text-text-muted hover:bg-bg-secondary rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-mono tracking-widest text-text-primary">
                          {password.password}
                        </span>
                        <button
                          onClick={() => handleEdit(password)}
                          className="p-2 text-text-muted hover:text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="mt-8 p-4 bg-bg-secondary rounded-lg">
            <p className="text-sm text-text-secondary">
              所有密碼必須是 4 位數字。修改後會立即生效。
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
