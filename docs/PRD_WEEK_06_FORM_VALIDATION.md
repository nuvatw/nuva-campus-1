# PRD Week 6: 表單驗證與使用者回饋優化

**專案**: NUVA Campus 效能與 UI/UX 優化計畫
**週次**: 第 6 週 (共 10 週)
**負責人**: TBD
**預計交付日期**: TBD

---

## 1. 本週目標

實作即時表單驗證、優化 Toast 通知系統、改善整體使用者回饋機制。

---

## 2. 問題陳述

### 2.1 表單缺少即時驗證 (P2 - Medium)

**現況**:
- `/app/recruit/page.tsx` SupportForm 只在提交時驗證
- 使用者填完整張表單才發現錯誤
- 沒有 field-level 驗證回饋

**影響**:
- 使用者需要來回修正
- 表單完成率可能降低
- 使用者體驗不佳

### 2.2 Toast 缺少動畫 (P2 - Medium)

**現況**:
- `/app/components/ui/Toast.tsx` Toast 消失時直接移除
- 沒有進入和離開動畫
- 多個 Toast 時堆疊處理不佳

**影響**:
- 視覺突兀
- 使用者可能錯過通知
- 專業感降低

### 2.3 缺少操作確認回饋 (P2 - Medium)

**現況**:
- 危險操作（刪除、取消報名等）沒有確認對話框
- 成功/失敗操作回饋不明顯
- 缺少進度指示

**影響**:
- 誤操作風險
- 使用者不確定操作是否成功
- 可能導致資料遺失

---

## 3. 解決方案

### 3.1 表單驗證系統

#### 3.1.1 安裝依賴

```bash
npm install react-hook-form zod @hookform/resolvers
```

#### 3.1.2 建立驗證 Schema

建立 `/app/schemas/support-form.ts`:

```typescript
import { z } from 'zod'

export const supportFormSchema = z.object({
  name: z
    .string()
    .min(2, '姓名至少需要 2 個字')
    .max(50, '姓名不能超過 50 個字'),

  email: z
    .string()
    .email('請輸入有效的電子郵件')
    .min(1, '請輸入電子郵件'),

  university: z
    .string()
    .min(1, '請選擇學校'),

  department: z
    .string()
    .min(1, '請輸入系所'),

  phone: z
    .string()
    .regex(/^09\d{8}$/, '請輸入有效的手機號碼（09開頭）')
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .max(500, '留言不能超過 500 字')
    .optional(),

  agreeToTerms: z
    .boolean()
    .refine(val => val === true, '請同意服務條款'),
})

export type SupportFormData = z.infer<typeof supportFormSchema>
```

#### 3.1.3 建立通用表單組件

建立 `/app/components/form/FormField.tsx`:

```typescript
'use client'

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  className?: string
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  className,
}: FormFieldProps) {
  const {
    register,
    formState: { errors, touchedFields },
  } = useFormContext()

  const error = errors[name]
  const touched = touchedFields[name]
  const hasError = touched && error

  return (
    <div className={cn('space-y-1', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className={cn(
          hasError && 'border-red-500 focus:ring-red-500'
        )}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />

      {hasError && (
        <p
          id={`${name}-error`}
          className="text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error.message as string}
        </p>
      )}
    </div>
  )
}
```

#### 3.1.4 重構 SupportForm

修改 `/app/recruit/components/SupportForm/index.tsx`:

```typescript
'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supportFormSchema, SupportFormData } from '@/schemas/support-form'
import { FormField } from '@/components/form/FormField'
import { FormSelect } from '@/components/form/FormSelect'
import { FormCheckbox } from '@/components/form/FormCheckbox'
import { FormTextarea } from '@/components/form/FormTextarea'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { submitSupportForm } from '@/services/support'
import { universities } from '@/data/universities'

export function SupportForm() {
  const { toast } = useToast()

  const methods = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    mode: 'onBlur', // 失焦時驗證
    reValidateMode: 'onChange', // 之後每次輸入都驗證
    defaultValues: {
      name: '',
      email: '',
      university: '',
      department: '',
      phone: '',
      message: '',
      agreeToTerms: false,
    },
  })

  const { handleSubmit, formState: { isSubmitting, isValid } } = methods

  const onSubmit = async (data: SupportFormData) => {
    const result = await submitSupportForm(data)

    if (result.success) {
      toast({
        type: 'success',
        title: '報名成功！',
        message: '感謝您成為校園支持者，我們會盡快與您聯繫。',
      })
      methods.reset()
    } else {
      toast({
        type: 'error',
        title: '報名失敗',
        message: result.error.message,
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-xl mx-auto"
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="name"
            label="姓名"
            placeholder="請輸入姓名"
            required
          />

          <FormField
            name="email"
            label="電子郵件"
            type="email"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            name="university"
            label="學校"
            placeholder="請選擇學校"
            options={universities}
            required
          />

          <FormField
            name="department"
            label="系所"
            placeholder="請輸入系所"
            required
          />
        </div>

        <FormField
          name="phone"
          label="手機號碼"
          type="tel"
          placeholder="0912345678"
        />

        <FormTextarea
          name="message"
          label="想說的話"
          placeholder="有什麼想對我們說的嗎？（選填）"
          rows={4}
          maxLength={500}
          showCount
        />

        <FormCheckbox
          name="agreeToTerms"
          label={
            <>
              我已閱讀並同意
              <a href="/terms" className="text-blue-600 hover:underline ml-1">
                服務條款
              </a>
            </>
          }
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !isValid}
          loading={isSubmitting}
        >
          {isSubmitting ? '提交中...' : '成為支持者'}
        </Button>
      </form>
    </FormProvider>
  )
}
```

### 3.2 Toast 系統重構

#### 3.2.1 Toast Provider

建立 `/app/components/toast/ToastProvider.tsx`:

```typescript
'use client'

import { createContext, useContext, useReducer, useCallback } from 'react'
import { ToastContainer } from './ToastContainer'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string }

const ToastContext = createContext<{
  toast: (options: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
} | null>(null)

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD':
      return { toasts: [...state.toasts, action.toast] }
    case 'REMOVE':
      return { toasts: state.toasts.filter(t => t.id !== action.id) }
    default:
      return state
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] })

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    const duration = options.duration ?? 5000

    dispatch({ type: 'ADD', toast: { ...options, id } })

    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE', id })
      }, duration)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id })
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={state.toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
```

#### 3.2.2 Toast 動畫組件

建立 `/app/components/toast/ToastContainer.tsx`:

```typescript
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      aria-label="通知"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.type]

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30
              }}
              className={`
                pointer-events-auto
                flex items-start gap-3 p-4
                rounded-lg border shadow-lg
                ${colors[toast.type]}
              `}
              role="alert"
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />

              <div className="flex-1 min-w-0">
                <p className="font-medium">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>
                )}
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
                aria-label="關閉通知"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
```

### 3.3 確認對話框

#### 3.3.1 建立 ConfirmDialog

建立 `/app/components/ui/ConfirmDialog.tsx`:

```typescript
'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
  loading?: boolean
}

const variantStyles = {
  danger: {
    icon: 'text-red-500',
    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    icon: 'text-yellow-500',
    button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  },
  default: {
    icon: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = '取消',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const styles = variantStyles[variant]

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
                  <Dialog.Title className="text-lg font-medium">
                    {title}
                  </Dialog.Title>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-gray-100"
                  aria-label="關閉"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <p className="text-gray-600">{message}</p>
              </div>

              <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText}
                </Button>
                <Button
                  className={styles.button}
                  onClick={onConfirm}
                  loading={loading}
                >
                  {confirmText}
                </Button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
```

#### 3.3.2 useConfirm Hook

建立 `/app/hooks/useConfirm.ts`:

```typescript
'use client'

import { useState, useCallback } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'default'
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    options: ConfirmOptions | null
    resolve: ((value: boolean) => void) | null
  }>({
    open: false,
    options: null,
    resolve: null,
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState({ open: false, options: null, resolve: null })
  }, [state])

  const handleCancel = useCallback(() => {
    state.resolve?.(false)
    setState({ open: false, options: null, resolve: null })
  }, [state])

  return {
    confirm,
    dialogProps: {
      open: state.open,
      onClose: handleCancel,
      onConfirm: handleConfirm,
      ...(state.options ?? { title: '', message: '' }),
    },
  }
}
```

---

## 4. 技術規格

### 4.1 新增依賴

```json
{
  "dependencies": {
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "framer-motion": "^11.0.0",
    "@headlessui/react": "^1.7.0"
  }
}
```

### 4.2 表單驗證策略

| 時機 | 行為 | 說明 |
|------|------|------|
| onBlur | 首次驗證 | 使用者離開欄位時 |
| onChange | 後續驗證 | 已 touched 的欄位即時驗證 |
| onSubmit | 最終驗證 | 提交前完整驗證 |

### 4.3 Toast 動畫參數

| 參數 | 進入 | 離開 |
|------|------|------|
| 方向 | 從下往上 | 往右滑出 |
| 透明度 | 0 → 1 | 1 → 0 |
| 縮放 | 0.9 → 1 | 1 → 0.9 |
| 時長 | 300ms | 200ms |

---

## 5. 驗收標準

### 5.1 表單驗證驗收

- [ ] 欄位失焦時顯示驗證錯誤
- [ ] 錯誤訊息清楚易懂
- [ ] 錯誤樣式明顯（紅色邊框）
- [ ] 無障礙標籤正確 (aria-invalid, aria-describedby)

### 5.2 Toast 驗收

- [ ] 進入和離開有流暢動畫
- [ ] 多個 Toast 正確堆疊
- [ ] 可手動關閉
- [ ] 自動消失 (預設 5 秒)

### 5.3 確認對話框驗收

- [ ] 刪除操作有確認對話框
- [ ] 對話框有進入/離開動畫
- [ ] 可用 ESC 關閉
- [ ] Loading 狀態正確顯示

---

## 6. 交付清單

- [ ] `/app/schemas/support-form.ts` - 新增
- [ ] `/app/components/form/FormField.tsx` - 新增
- [ ] `/app/components/form/FormSelect.tsx` - 新增
- [ ] `/app/components/form/FormCheckbox.tsx` - 新增
- [ ] `/app/components/form/FormTextarea.tsx` - 新增
- [ ] `/app/recruit/components/SupportForm/index.tsx` - 重構
- [ ] `/app/components/toast/ToastProvider.tsx` - 新增
- [ ] `/app/components/toast/ToastContainer.tsx` - 新增
- [ ] `/app/components/ui/ConfirmDialog.tsx` - 新增
- [ ] `/app/hooks/useConfirm.ts` - 新增

---

## 7. 成功指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| 表單完成率 | 提升 20%+ | 分析工具 |
| 表單錯誤率 | 降低 30%+ | 錯誤日誌 |
| 使用者滿意度 | 提升 | 問卷調查 |

---

*下一週預告: 資料快取與 Real-time 優化*
