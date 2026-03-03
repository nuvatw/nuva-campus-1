/**
 * 角色相關常數
 * 定義系統中所有角色的標識符和相關配置
 */

/** 角色標識符 */
export const ROLES = {
  NUNU: 'nunu',
  AMBASSADOR: 'ambassador',
  GUARDIAN: 'guardian',
  GUARDIAN_ADMIN: 'guardian_admin',
} as const;

/** 角色類型 */
export type Role = typeof ROLES[keyof typeof ROLES];

/** 所有角色列表 */
export const ALL_ROLES: Role[] = [
  ROLES.NUNU,
  ROLES.AMBASSADOR,
  ROLES.GUARDIAN,
  ROLES.GUARDIAN_ADMIN,
];

/** 角色顯示名稱 */
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.NUNU]: '活動志工',
  [ROLES.AMBASSADOR]: '校園大使',
  [ROLES.GUARDIAN]: '守護者',
  [ROLES.GUARDIAN_ADMIN]: '守護者管理員',
};

/** 角色路由路徑 */
export const ROLE_ROUTES: Record<Role, string> = {
  [ROLES.NUNU]: '/nunu',
  [ROLES.AMBASSADOR]: '/ambassador',
  [ROLES.GUARDIAN]: '/guardian',
  [ROLES.GUARDIAN_ADMIN]: '/guardian',
};

/**
 * 檢查是否為有效的基本角色（非活動角色）
 */
export function isBaseRole(key: string): key is Role {
  return ALL_ROLES.includes(key as Role);
}

/**
 * 檢查是否為活動角色
 */
export function isEventRole(key: string): boolean {
  return key.startsWith('event_');
}

/**
 * 從活動 key 提取活動 ID
 */
export function extractEventId(key: string): string | null {
  if (!isEventRole(key)) return null;
  return key.replace('event_', '');
}

/**
 * 建立活動 key
 */
export function createEventKey(eventId: string): `event_${string}` {
  return `event_${eventId}`;
}
