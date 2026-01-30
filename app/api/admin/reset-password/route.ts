import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/app/lib/api-auth';
import { hashPassword } from '@/app/services/auth-server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import type { PasswordKey } from '@/app/types/password';

/**
 * 密碼重設 API
 * 設定指定 key 的新密碼（會自動 bcrypt hash）
 *
 * POST /api/admin/reset-password
 * Body: { key: "guardian", password: "0001" }
 * Header: x-api-key: YOUR_API_SECRET_KEY
 */
export async function POST(request: NextRequest) {
  try {
    // API 認證檢查
    const authResult = await requireApiAuth();
    if (!authResult.authorized && authResult.error) {
      return authResult.error;
    }

    const { key, password } = await request.json();

    if (!key || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing key or password' },
        { status: 400 }
      );
    }

    // 驗證 key 格式
    const validKeys: PasswordKey[] = ['nunu', 'ambassador', 'guardian', 'guardian_admin'];
    const isValidKey = validKeys.includes(key as PasswordKey) || key.startsWith('event_');

    if (!isValidKey) {
      return NextResponse.json(
        { success: false, error: `Invalid key: ${key}` },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 產生 bcrypt hash
    const passwordHash = await hashPassword(password);

    // 更新資料庫
    const { data, error } = await supabase
      .from('access_passwords')
      .update({
        password: password,
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select('key, is_active')
      .single();

    if (error) {
      // 如果記錄不存在，則建立新記錄
      if (error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('access_passwords')
          .insert({
            key,
            password,
            password_hash: passwordHash,
            is_active: true,
          });

        if (insertError) {
          return NextResponse.json(
            { success: false, error: insertError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: `已建立密碼: ${key}`,
          created: true,
        });
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `已更新密碼: ${key}`,
      data: { key: data.key, is_active: data.is_active },
    });
  } catch (error: unknown) {
    console.error('[admin/reset-password] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * 查詢所有密碼狀態（不顯示密碼內容）
 *
 * GET /api/admin/reset-password
 * Header: x-api-key: YOUR_API_SECRET_KEY
 */
export async function GET() {
  try {
    // API 認證檢查
    const authResult = await requireApiAuth();
    if (!authResult.authorized && authResult.error) {
      return authResult.error;
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('access_passwords')
      .select('key, is_active, password_hash, created_at, updated_at')
      .order('key');

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 顯示狀態但不顯示實際密碼
    const status = data?.map((item) => ({
      key: item.key,
      is_active: item.is_active,
      has_hash: !!item.password_hash,
      updated_at: item.updated_at,
    }));

    return NextResponse.json({
      success: true,
      passwords: status,
    });
  } catch (error: unknown) {
    console.error('[admin/reset-password] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
