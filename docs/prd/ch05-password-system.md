# Chapter 5: 密碼驗證系統（資料庫驅動）

[← 返回索引](./README.md) | [上一章](./ch04-identity-selector.md) | [下一章 →](./ch06-database.md)

---

## 5.1 功能描述

所有密碼存入 Supabase 資料庫，管理員可在資料庫中隨時修改密碼，無需更改程式碼。

## 5.2 密碼類型

| 類型 | 用途 | 預設密碼 |
|------|------|----------|
| `nunu` | 努努專區入口 | `0812` |
| `ambassador` | 校園大使專區入口 | `2180` |
| `guardian` | 守護者專區入口 | `0001` |
| `event_ws02` | WS02 活動執行 | `0202` |

## 5.3 資料庫結構

```sql
CREATE TABLE access_passwords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,        -- 密碼類型識別碼
  password TEXT NOT NULL,          -- 密碼（4位數）
  description TEXT,                -- 說明
  is_active BOOLEAN DEFAULT true,  -- 是否啟用
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始資料
INSERT INTO access_passwords (key, password, description) VALUES
  ('nunu', '0812', '努努專區入口密碼'),
  ('ambassador', '2180', '校園大使專區入口密碼'),
  ('guardian', '0001', '守護者專區入口密碼'),
  ('event_ws02', '0202', 'WS02 活動執行密碼');
```

## 5.4 驗證流程

```
用戶點擊角色卡片
    ↓
顯示密碼輸入 Modal
    ↓
用戶輸入 4 位數密碼
    ↓
從 Supabase 查詢對應密碼
    ↓
比對密碼 ──正確──→ 儲存驗證狀態到 localStorage
    │                     ↓
    │              導航至對應專區
    │
    └──錯誤──→ 顯示錯誤提示 + 震動效果
                 ↓
              清空輸入
```

## 5.5 LocalStorage 結構

```typescript
interface AuthState {
  nunu: { verified: boolean; expiry: number };
  ambassador: { verified: boolean; expiry: number };
  guardian: { verified: boolean; expiry: number };
  events: {
    [eventId: string]: { verified: boolean; expiry: number };
  };
}

// Key: 'nuva_campus_auth'
// 過期時間：24 小時
```

## 5.6 Hook 設計

```typescript
// /app/hooks/useAuth.ts
function useAuth() {
  return {
    // 驗證密碼
    verifyPassword: async (key: string, password: string) => boolean,

    // 檢查是否已驗證
    isVerified: (key: string) => boolean,

    // 清除驗證狀態
    logout: (key?: string) => void,

    // 獲取所有驗證狀態
    getAuthState: () => AuthState,
  };
}
```

## 5.7 AuthGuard 組件

```typescript
// /app/components/AuthGuard.tsx
interface AuthGuardProps {
  roleKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function AuthGuard({ roleKey, children, fallback }: AuthGuardProps) {
  const { isVerified } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!isVerified(roleKey)) {
    return (
      <>
        {fallback || <PasswordPrompt />}
        <PasswordModal
          isOpen={showModal}
          roleKey={roleKey}
          onSuccess={() => {/* navigate */}}
        />
      </>
    );
  }

  return <>{children}</>;
}
```

## 5.8 Chain of Thought - 實施步驟

```
1. 建立 access_passwords 資料表
   - 執行 SQL 建表
   - 插入初始密碼資料
   - 設定 RLS（只允許讀取 password 欄位）

2. 建立 useAuth Hook
   - verifyPassword 函數
   - isVerified 函數
   - localStorage 管理
   - 過期時間處理

3. 建立 AuthGuard 組件
   - 包裹需要保護的頁面
   - 未驗證時顯示密碼輸入
   - 載入狀態處理

4. 建立 PasswordModal 組件
   - 數字鍵盤 UI
   - 連接 useAuth Hook
   - 動畫效果

5. 測試驗證流程
   - 正確密碼進入
   - 錯誤密碼提示
   - 24小時後過期
   - 修改資料庫密碼後生效
```
