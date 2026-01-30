import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/app/services/auth-server';
import { checkRateLimit } from '@/app/lib/rate-limit';
import type { PasswordKey } from '@/app/types/password';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 每分鐘最多 10 次嘗試
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`auth:${clientIp}`, 10, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many attempts',
          message: '嘗試次數過多，請稍後再試',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const { key, password } = await request.json();

    if (!key || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing credentials', message: '缺少必要的驗證資訊' },
        { status: 400 }
      );
    }

    // 使用 Server-Side 驗證服務（支援 bcrypt）
    const result = await verifyPassword(key as PasswordKey, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials', message: '密碼錯誤' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '驗證成功',
    });
  } catch (error: unknown) {
    console.error('[auth/verify] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { success: false, error: 'Server error', message },
      { status: 500 }
    );
  }
}
