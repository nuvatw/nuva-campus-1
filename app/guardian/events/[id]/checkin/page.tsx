'use client';

import { OperationalChecklist, type OperationalConfig } from '@/app/components/operational';

const checkinConfig: OperationalConfig = {
  swrKeyPrefix: 'checkin-participants',
  title: '參與者報到',
  statusField: 'attended',
  selectFields: 'id, participant_name, participant_email, attended, ambassador_id, attendance_mode, member_type',
  modalTitle: '確認報到',
  actionLabel: '確認報到',
  undoLabel: '撤銷報到',
  completedLabel: '已報到',
  searchLabel: '輸入大使編號快速報到',
  filterLabels: {
    all: '全部',
    pending: '尚未報到',
    completed: '已報到',
  },
  messages: {
    alreadyDone: '此參與者已報到',
    success: (name) => `${name} 報到成功`,
    undoSuccess: (name) => `${name} 已撤銷報到`,
    failed: (msg) => `報到失敗：${msg}`,
    undoFailed: (msg) => `撤銷失敗：${msg}`,
    notFound: (id) => `找不到大使編號 ${id}`,
    emptyTitle: '沒有找到參與者',
    emptyDescription: '請確認 Supabase RLS 設定及資料條件（attendance_mode = offline）',
  },
  backHref: (eventId) => `/guardian/events/${eventId}`,
};

export default function CheckinPage() {
  return <OperationalChecklist config={checkinConfig} />;
}
