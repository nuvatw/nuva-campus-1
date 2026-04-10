# Chapter 13: 郵件通知系統

[← 返回索引](./README.md) | [上一章](./ch12-code-generator.md) | [下一章 →](./ch14-animation.md)

---

## 13.1 功能描述

提供一鍵發送報到編號郵件給參與者的功能，包含測試郵件功能。

## 13.2 郵件類型

| 類型 | 說明 | 收件人 |
|------|------|--------|
| 測試郵件 | 發送給管理員測試 | ceo@meetnuva.com |
| 報到編號通知 | 發送報到編號給參與者 | 參與者信箱 |

## 13.3 通知頁面介面

```
┌─────────────────────────────────────────────────────────────┐
│  [← 返回]                              發送通知              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  郵件發送統計                                                │
│  ───────────                                                │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │                 │  │                 │                  │
│  │   已發送: 25    │  │   未發送: 20    │                  │
│  │                 │  │                 │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  發送選項                                                   │
│  ─────────                                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  測試郵件                                           │   │
│  │  發送一封測試郵件到 ceo@meetnuva.com               │   │
│  │                                                     │   │
│  │                       [  發送測試郵件  ]            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  發送給所有未通知的參與者                            │   │
│  │  將發送 20 封郵件                                   │   │
│  │                                                     │   │
│  │                       [  發送全部郵件  ]            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  發送記錄                                                   │
│  ─────────                                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 王小明 - xiaoming@example.com                       │   │
│  │ 發送時間: 2026-01-29 14:30                  ✓ 成功  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 李大華 - dahua@example.com                          │   │
│  │ 發送時間: 2026-01-29 14:30                  ✗ 失敗  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 13.4 郵件內容模板

```
主旨：【NUVA 校園計劃】您的活動報到編號

──────────────────────────

親愛的 {姓名} 您好，

感謝您報名參加「{活動名稱}」！

以下是您的活動資訊：

活動時間：{日期} {時間}
活動地點：{地點}

報到編號：{報到編號}
便當編號：{便當編號 或 "無便當"}

請於活動當日憑報到編號完成報到。

如有任何問題，請聯繫我們。

NUVA 校園計劃團隊

──────────────────────────
```

## 13.5 郵件模板程式碼

```typescript
// /app/lib/emailTemplates.ts

export interface CheckinEmailData {
  recipientName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  checkinCode: string;
  lunchCode: string;
}

export function generateCheckinEmail(data: CheckinEmailData) {
  const lunchInfo = data.lunchCode === '0000'
    ? '無便當'
    : data.lunchCode;

  return {
    subject: `【NUVA 校園計劃】您的活動報到編號`,
    html: `
      <div style="font-family: 'Noto Sans TC', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #4A5568; margin-bottom: 24px;">您的活動報到資訊</h2>

        <p style="color: #1A1A1A; line-height: 1.8;">
          親愛的 ${data.recipientName} 您好，
        </p>

        <p style="color: #1A1A1A; line-height: 1.8;">
          感謝您報名參加「${data.eventName}」！
        </p>

        <div style="background: #F7F5F3; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 12px 0; color: #6B7280;">活動時間</p>
          <p style="margin: 0 0 16px 0; color: #1A1A1A; font-weight: 500;">${data.eventDate} ${data.eventTime}</p>

          <p style="margin: 0 0 12px 0; color: #6B7280;">活動地點</p>
          <p style="margin: 0 0 16px 0; color: #1A1A1A; font-weight: 500;">${data.eventLocation}</p>

          <p style="margin: 0 0 12px 0; color: #6B7280;">報到編號</p>
          <p style="margin: 0 0 16px 0; color: #4A5568; font-size: 24px; font-weight: 600; letter-spacing: 4px;">${data.checkinCode}</p>

          <p style="margin: 0 0 12px 0; color: #6B7280;">便當編號</p>
          <p style="margin: 0; color: #4A5568; font-size: 24px; font-weight: 600; letter-spacing: 4px;">${lunchInfo}</p>
        </div>

        <p style="color: #6B7280; line-height: 1.8;">
          請於活動當日憑報到編號完成報到。如有任何問題，請聯繫我們。
        </p>

        <p style="color: #1A1A1A; margin-top: 32px;">
          NUVA 校園計劃團隊
        </p>
      </div>
    `,
  };
}
```

## 13.6 API 設計

```typescript
// /app/api/email/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/app/lib/supabase';
import { generateCheckinEmail } from '@/app/lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY);
const TEST_EMAIL = 'ceo@meetnuva.com';

export async function POST(request: NextRequest) {
  const { eventId, type, registrationId } = await request.json();

  if (type === 'test') {
    return sendTestEmail(eventId);
  }

  if (type === 'single') {
    return sendSingleEmail(registrationId);
  }

  if (type === 'all') {
    return sendBulkEmails(eventId);
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

async function sendTestEmail(eventId: string) {
  // 獲取活動資訊和第一筆報名資料作為測試
  const { data: registration } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .limit(1)
    .single();

  const email = generateCheckinEmail({
    recipientName: '測試用戶',
    eventName: '校園計劃 WS02',
    eventDate: '2026.02.15 (六)',
    eventTime: '09:00 - 17:00',
    eventLocation: '台北市立大學',
    checkinCode: registration?.checkin_code || '1234',
    lunchCode: registration?.lunch_code || '5678',
  });

  await resend.emails.send({
    from: 'NUVA Campus <noreply@meetnuva.com>',
    to: TEST_EMAIL,
    subject: `[測試] ${email.subject}`,
    html: email.html,
  });

  return NextResponse.json({ success: true, sentTo: TEST_EMAIL });
}

async function sendSingleEmail(registrationId: string) {
  // 實作單筆發送邏輯
  // ...
}

async function sendBulkEmails(eventId: string) {
  // 獲取所有未發送的報名記錄
  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('notification_sent', false);

  let sentCount = 0;
  let failedCount = 0;

  for (const reg of registrations || []) {
    try {
      const email = generateCheckinEmail({
        recipientName: reg.participant_name,
        eventName: '校園計劃 WS02',
        eventDate: '2026.02.15 (六)',
        eventTime: '09:00 - 17:00',
        eventLocation: '台北市立大學',
        checkinCode: reg.checkin_code,
        lunchCode: reg.lunch_code,
      });

      await resend.emails.send({
        from: 'NUVA Campus <noreply@meetnuva.com>',
        to: reg.participant_email,
        subject: email.subject,
        html: email.html,
      });

      // 更新發送狀態
      await supabase
        .from('event_registrations')
        .update({
          notification_sent: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq('id', reg.id);

      // 記錄發送日誌
      await supabase.from('email_logs').insert({
        event_id: eventId,
        registration_id: reg.id,
        recipient_email: reg.participant_email,
        recipient_name: reg.participant_name,
        email_type: 'checkin_code',
        status: 'sent',
        sent_at: new Date().toISOString(),
      });

      sentCount++;
    } catch (error) {
      failedCount++;

      await supabase.from('email_logs').insert({
        event_id: eventId,
        registration_id: reg.id,
        recipient_email: reg.participant_email,
        recipient_name: reg.participant_name,
        email_type: 'checkin_code',
        status: 'failed',
        error_message: String(error),
      });
    }
  }

  return NextResponse.json({ success: true, sentCount, failedCount });
}
```

## 13.7 郵件服務設置

使用 Resend 作為郵件服務：

```bash
npm install resend
```

環境變數：
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
TEST_EMAIL_RECIPIENT=ceo@meetnuva.com
```

## 13.8 Chain of Thought - 實施步驟

```
1. 選擇並設置郵件服務
   - 註冊 Resend 帳號
   - 獲取 API Key
   - 設置環境變數

2. 建立郵件模板
   - /app/lib/emailTemplates.ts
   - 報到編號通知模板
   - 支援變數替換

3. 建立郵件 API
   - /app/api/email/send/route.ts
   - 測試郵件邏輯
   - 批量發送邏輯

4. 建立通知頁面
   - /app/guardian/events/[id]/notify/page.tsx
   - 發送統計
   - 發送按鈕
   - 發送記錄列表

5. 記錄發送狀態
   - 更新 email_logs 表
   - 更新 notification_sent 欄位

6. 測試
   - 發送測試郵件到 ceo@meetnuva.com
   - 發送單封郵件
   - 發送批量郵件
```
