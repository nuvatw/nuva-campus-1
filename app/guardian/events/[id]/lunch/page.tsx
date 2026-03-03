'use client';

import { OperationalChecklist, type OperationalConfig } from '@/app/components/operational';

const lunchConfig: OperationalConfig = {
  swrKeyPrefix: 'lunch-participants',
  title: '便當領取',
  statusField: 'lunch_collected',
  selectFields: 'id, participant_name, participant_email, lunch_collected, lunch_box_required, ambassador_id, attendance_mode, member_type',
  extraFilters: [{ field: 'lunch_box_required', value: true }],
  modalTitle: '確認領取便當',
  actionLabel: '確認領取',
  undoLabel: '撤銷領取',
  completedLabel: '已領取',
  searchLabel: '輸入大使編號快速領取',
  filterLabels: {
    all: '全部',
    pending: '尚未領取',
    completed: '已領取',
  },
  messages: {
    alreadyDone: '此便當已領取',
    success: (name) => `${name} 便當領取成功`,
    undoSuccess: (name) => `${name} 已撤銷領取`,
    failed: (msg) => `領取失敗：${msg}`,
    undoFailed: (msg) => `撤銷失敗：${msg}`,
    notFound: (id) => `找不到大使編號 ${id}`,
    emptyTitle: '沒有找到需要便當的參與者',
    emptyDescription: '請確認 Supabase RLS 設定及資料條件（attendance_mode = offline, lunch_box_required = true）',
  },
  backHref: (eventId) => `/guardian/events/${eventId}`,
};

export default function LunchPage() {
  return <OperationalChecklist config={lunchConfig} />;
}
