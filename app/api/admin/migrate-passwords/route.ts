import { NextRequest, NextResponse } from 'next/server';
import { requireApiAuth } from '@/app/lib/api-auth';
import { migratePasswords } from '@/app/services/auth-server';

/**
 * 密碼遷移 API
 * 將所有明文密碼轉換為 bcrypt 雜湊
 *
 * POST /api/admin/migrate-passwords
 * 需要 API Key 認證
 */
export async function POST(request: NextRequest) {
  try {
    // API 認證檢查
    const authResult = await requireApiAuth();
    if (!authResult.authorized && authResult.error) {
      return authResult.error;
    }

    // 執行密碼遷移
    const result = await migratePasswords();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: '部分密碼遷移失敗',
          migrated: result.migrated,
          errors: result.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `成功遷移 ${result.migrated} 個密碼`,
      migrated: result.migrated,
    });
  } catch (error: unknown) {
    console.error('[admin/migrate-passwords] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
