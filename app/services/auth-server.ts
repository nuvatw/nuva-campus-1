import bcrypt from 'bcryptjs';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import type { PasswordKey } from '@/app/types/password';

interface VerifyResult {
  success: boolean;
  error?: string;
}

/**
 * Server-side 密碼驗證
 * 使用 bcrypt 比對密碼雜湊值
 */
export async function verifyPassword(
  key: PasswordKey,
  password: string
): Promise<VerifyResult> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('access_passwords')
      .select('password_hash, password')
      .eq('key', key)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('[verifyPassword] Password not found for key:', key);
      return { success: false, error: 'Invalid credentials' };
    }

    // 優先使用 password_hash（bcrypt），若無則回退到明文比對（遷移期間）
    if (data.password_hash) {
      const isValid = await bcrypt.compare(password, data.password_hash);
      return { success: isValid, error: isValid ? undefined : 'Invalid credentials' };
    }

    // 遷移期間：支援明文密碼比對（之後會移除）
    if (data.password) {
      const isValid = data.password === password;
      return { success: isValid, error: isValid ? undefined : 'Invalid credentials' };
    }

    return { success: false, error: 'Invalid credentials' };
  } catch (err) {
    console.error('[verifyPassword] Error:', err);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * 雜湊密碼
 * 使用 bcrypt 生成密碼雜湊值
 * @param password 明文密碼
 * @param rounds bcrypt 輪數（預設 12）
 */
export async function hashPassword(password: string, rounds: number = 12): Promise<string> {
  return bcrypt.hash(password, rounds);
}

/**
 * 批量遷移密碼
 * 將所有明文密碼轉換為 bcrypt 雜湊
 * 僅供管理員使用的一次性遷移腳本
 */
export async function migratePasswords(): Promise<{
  success: boolean;
  migrated: number;
  errors: string[];
}> {
  const supabase = createServerSupabaseClient();
  const errors: string[] = [];
  let migrated = 0;

  try {
    // 獲取所有沒有 password_hash 的記錄
    const { data: records, error } = await supabase
      .from('access_passwords')
      .select('id, key, password')
      .is('password_hash', null);

    if (error) {
      return { success: false, migrated: 0, errors: [error.message] };
    }

    if (!records || records.length === 0) {
      return { success: true, migrated: 0, errors: [] };
    }

    for (const record of records) {
      if (!record.password) {
        errors.push(`Record ${record.key} has no password`);
        continue;
      }

      try {
        const hash = await hashPassword(record.password);

        const { error: updateError } = await supabase
          .from('access_passwords')
          .update({ password_hash: hash })
          .eq('id', record.id);

        if (updateError) {
          errors.push(`Failed to update ${record.key}: ${updateError.message}`);
        } else {
          migrated++;
        }
      } catch (err) {
        errors.push(`Error hashing password for ${record.key}: ${err}`);
      }
    }

    return { success: errors.length === 0, migrated, errors };
  } catch (err) {
    return { success: false, migrated, errors: [`Migration failed: ${err}`] };
  }
}
