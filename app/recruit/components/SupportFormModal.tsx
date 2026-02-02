'use client';

import { useState, useMemo, useRef, useEffect, memo } from 'react';
import { mutate } from 'swr';
import { supabase } from '@/app/lib/supabase';
import { universities, type University } from '@/app/data/universities';
import type { SupportType } from '../types';
import { Modal, Button, Input, useToast } from '@/app/components/ui';

interface SupportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportType: SupportType;
  onSuccess: (data: { name: string; university: string; type: SupportType }) => void;
}

function SupportFormModalComponent({
  isOpen,
  onClose,
  supportType,
  onSuccess,
}: SupportFormModalProps) {
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUniversity(null);
      setSearchQuery('');
      setName('');
      setEmail('');
      setOrganization('');
      setJobTitle('');
      setMessage('');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter universities based on search query
  const filteredUniversities = useMemo(() => {
    if (!searchQuery.trim()) return universities.slice(0, 10);

    const query = searchQuery.toLowerCase();
    return universities.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.shortName.toLowerCase().includes(query) ||
      u.city.includes(query)
    ).slice(0, 10);
  }, [searchQuery]);

  const handleSelectUniversity = (university: University) => {
    setSelectedUniversity(university);
    setSearchQuery(university.name);
    setIsDropdownOpen(false);
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedUniversity(null);
    setIsDropdownOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUniversity) {
      showToast('error', '請選擇學校');
      return;
    }

    if (!name.trim() || !email.trim()) {
      showToast('error', '請填寫姓名和信箱');
      return;
    }

    setIsSubmitting(true);

    try {
      const insertData: Record<string, unknown> = {
        university_id: selectedUniversity.id,
        university_name: selectedUniversity.name,
        city: selectedUniversity.city,
        supporter_name: name.trim(),
        supporter_email: email.trim(),
        support_type: supportType,
        message: message.trim() || null,
      };

      insertData.organization = organization.trim() || null;
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

      onSuccess({
        name: name.trim(),
        university: selectedUniversity.name,
        type: supportType,
      });
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      showToast('error', '提交失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supportType === 'help' ? '我可以幫忙' : '我想參加活動'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* University Search Dropdown */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm font-medium text-text-primary mb-2">
            選擇學校 <span className="text-error">*</span>
          </label>
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              placeholder="搜尋學校名稱，例如：台大、清華..."
              className="w-full pl-12 pr-4 py-3 bg-bg-primary border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {selectedUniversity && (
              <button
                type="button"
                onClick={() => {
                  setSelectedUniversity(null);
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown List */}
          {isDropdownOpen && filteredUniversities.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredUniversities.map((university) => (
                <button
                  key={university.id}
                  type="button"
                  onClick={() => handleSelectUniversity(university)}
                  className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors flex items-center justify-between ${
                    selectedUniversity?.id === university.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-text-primary">{university.name}</p>
                    <p className="text-xs text-text-muted">{university.city}</p>
                  </div>
                  {selectedUniversity?.id === university.id && (
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {isDropdownOpen && searchQuery && filteredUniversities.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg p-4 text-center text-text-muted">
              找不到符合的學校
            </div>
          )}
        </div>

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

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            取消
          </Button>
          <Button type="submit" isLoading={isSubmitting} fullWidth>
            {supportType === 'help' ? '送出' : '為學校應援'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export const SupportFormModal = memo(SupportFormModalComponent);
export default SupportFormModal;
