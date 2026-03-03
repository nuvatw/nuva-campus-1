/**
 * Types 統一導出
 *
 * 集中匯出所有型別，簡化 import 路徑
 * @example
 * ```ts
 * import type { Ambassador, Mission, NunuEvent } from '@/app/types';
 * ```
 */

// Ambassador
export type { Ambassador } from './ambassador';

// Email
export type { EmailLog, SendEmailRequest, SendEmailResponse } from './email';

// Mission
export type { Mission, Submission } from './mission';

// Nunu Events
export type {
  NunuEvent,
  NunuEventRegistration,
  ShirtSize,
  CheckinStatus,
  NunuEventCheckin,
} from './nunu';
export { SHIRT_SIZES } from './nunu';

// Partnership
export type { PartnershipApplication, PartnershipFormData } from './partnership';

// Result (error handling)
export type { Result, ApiError, ErrorCode } from './result';
export {
  ErrorCodes,
  ErrorMessages,
  createApiError,
  ok,
  err,
  fromSupabaseError,
  isNetworkError,
  tryCatch,
} from './result';

// Story
export type {
  StoryLog,
  StoryTemplate,
  CreateStoryLogInput,
  CreateTemplateInput,
} from './story';

// Subscriber
export type { NewsletterSubscriber, SubscriberFormData } from './subscriber';

// Supporter
export type { Supporter, SupportStats, TotalStats, SupportType } from './supporter';

// Workshop
export type { ScheduleItem, Workshop, EventRegistration } from './workshop';
