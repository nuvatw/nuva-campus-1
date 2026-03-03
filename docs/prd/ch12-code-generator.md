# Chapter 12: 報到編號生成系統

[← 返回索引](./README.md) | [上一章](./ch11-checkin-lunch.md) | [下一章 →](./ch13-email-system.md)

---

## 12.1 編號生成規則

```typescript
// 報到編號 (checkin_code)
// - 四位數字 (1000-9999)
// - 同一活動內不重複
// - 報名時自動生成

// 便當編號 (lunch_code)
// - 四位數字 (1000-9999)
// - 同一活動內不重複
// - 需要便當：生成編號
// - 不需要便當：設為 '0000'
```

## 12.2 生成邏輯

```typescript
// /app/lib/codeGenerator.ts

import { supabase } from './supabase';

export async function generateCheckinCode(eventId: string): Promise<string> {
  const { data: existingCodes } = await supabase
    .from('event_registrations')
    .select('checkin_code')
    .eq('event_id', eventId)
    .not('checkin_code', 'is', null);

  const usedCodes = new Set(existingCodes?.map(r => r.checkin_code));

  let code: string;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (usedCodes.has(code));

  return code;
}

export async function generateLunchCode(
  eventId: string,
  needsLunch: boolean
): Promise<string> {
  if (!needsLunch) return '0000';

  const { data: existingCodes } = await supabase
    .from('event_registrations')
    .select('lunch_code')
    .eq('event_id', eventId)
    .not('lunch_code', 'eq', '0000');

  const usedCodes = new Set(existingCodes?.map(r => r.lunch_code));

  let code: string;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (usedCodes.has(code));

  return code;
}
```

## 12.3 觸發時機

報名成功後在應用層生成編號：

```typescript
// 報名 API 或報名表單提交時
const checkinCode = await generateCheckinCode(eventId);
const lunchCode = await generateLunchCode(eventId, needsLunchBox);

await supabase.from('event_registrations').insert({
  event_id: eventId,
  participant_name: name,
  participant_email: email,
  checkin_code: checkinCode,
  lunch_code: lunchCode,
  // ... 其他欄位
});
```

## 12.4 為現有記錄補上編號

```typescript
// /scripts/backfill-codes.ts
// 執行一次性腳本為現有記錄生成編號

async function backfillCodes() {
  // 獲取所有沒有 checkin_code 的記錄
  const { data: records } = await supabase
    .from('event_registrations')
    .select('id, event_id, lunch_box_required')
    .is('checkin_code', null);

  for (const record of records || []) {
    const checkinCode = await generateCheckinCode(record.event_id);
    const lunchCode = await generateLunchCode(
      record.event_id,
      record.lunch_box_required
    );

    await supabase
      .from('event_registrations')
      .update({
        checkin_code: checkinCode,
        lunch_code: lunchCode,
      })
      .eq('id', record.id);
  }
}
```

## 12.5 Chain of Thought - 實施步驟

```
1. 建立 /app/lib/codeGenerator.ts
   - generateCheckinCode 函數
   - generateLunchCode 函數

2. 更新報名流程
   - 在報名時調用生成函數
   - 儲存編號到資料庫

3. 建立補號腳本
   - 為現有記錄生成編號
   - 確保唯一性

4. 測試
   - 新報名生成編號
   - 編號唯一性驗證
   - 不需要便當時設為 0000
```
