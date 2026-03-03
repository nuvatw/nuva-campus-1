'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { supabase } from '@/app/lib/supabase';
import { Button, Badge } from '@/app/components/ui';
import { useReducedMotion } from '@/app/components/motion';
import { spring } from '@/app/styles/tokens';
import type { NunuEventRegistration, ShirtSize } from '@/app/types/nunu';
import { SHIRT_SIZES } from '@/app/types/nunu';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  registrations: NunuEventRegistration[];
  onSuccess: () => Promise<void>;
}

export function RegistrationModal({ isOpen, onClose, eventId, registrations, onSuccess }: RegistrationModalProps) {
  const prefersReduced = useReducedMotion();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    chinese_name: '',
    english_name: '',
    shirt_size: '' as ShirtSize | '',
    dietary_restrictions: '',
    picky_eating: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.chinese_name || !formData.english_name || !formData.shirt_size) {
      alert('請填寫必填欄位');
      return;
    }

    setSubmitting(true);

    try {
      const existingReg = registrations.find(
        (r) => r.chinese_name === formData.chinese_name
      );

      if (existingReg) {
        const { error } = await supabase
          .from('nunu_event_registrations')
          .update({
            english_name: formData.english_name,
            shirt_size: formData.shirt_size,
            dietary_restrictions: formData.dietary_restrictions || null,
            picky_eating: formData.picky_eating || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReg.id);

        if (error) throw error;
      } else {
        const maxNumber = registrations.length > 0
          ? Math.max(...registrations.map((r) => r.registration_number))
          : 0;

        const { error } = await supabase
          .from('nunu_event_registrations')
          .insert({
            event_id: eventId,
            registration_number: maxNumber + 1,
            chinese_name: formData.chinese_name,
            english_name: formData.english_name,
            shirt_size: formData.shirt_size,
            dietary_restrictions: formData.dietary_restrictions || null,
            picky_eating: formData.picky_eating || null,
          });

        if (error) throw error;
      }

      setFormData({
        chinese_name: '',
        english_name: '',
        shirt_size: '',
        dietary_restrictions: '',
        picky_eating: '',
      });
      onClose();
      await onSuccess();
    } catch (err) {
      console.error('Submit error:', err);
      alert('提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <m.div
            className="bg-bg-card rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={prefersReduced ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
            animate={prefersReduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
            transition={spring.gentle}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] text-primary tracking-widest uppercase font-medium">Registration</p>
                  <h2 className="text-lg font-semibold text-text-primary">努努參戰</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    中文姓名 <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.chinese_name}
                    onChange={(e) => setFormData({ ...formData, chinese_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-primary transition-all"
                    placeholder="王小明"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    英文姓名 <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.english_name}
                    onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-primary transition-all"
                    placeholder="Xiao Ming Wang"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    衣服尺寸 <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {SHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, shirt_size: size })}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          formData.shirt_size === size
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'bg-bg-secondary text-text-secondary border border-border hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    飲食禁忌（不能吃）
                  </label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-primary transition-all"
                    placeholder="海鮮、牛肉、花生過敏"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    挑食（不愛吃）
                  </label>
                  <input
                    type="text"
                    value={formData.picky_eating}
                    onChange={(e) => setFormData({ ...formData, picky_eating: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-text-primary transition-all"
                    placeholder="香菜、茄子、青椒"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  isLoading={submitting}
                  variant="gradient"
                  fullWidth
                  className="mt-2"
                >
                  {submitting ? '送出中...' : '送出報名'}
                </Button>
              </form>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
