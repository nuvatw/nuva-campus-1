import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { requireApiAuth } from '@/app/lib/api-auth';
import { checkRateLimit } from '@/app/lib/rate-limit';

// Lazy initialization to avoid build-time errors
const getResend = () => new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // API 認證檢查
    const authResult = await requireApiAuth();
    if (!authResult.authorized && authResult.error) {
      return authResult.error;
    }

    // Rate Limiting - 每分鐘最多 5 次請求
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = checkRateLimit(`email:${clientIp}`, 5, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `請求過於頻繁，請 ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} 秒後再試`,
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { type, eventId, to } = body;

    if (type === 'test') {
      // 發送測試郵件
      const { error } = await getResend().emails.send({
        from: 'NUVA Campus <noreply@meetnuva.com>',
        to: to || 'ceo@meetnuva.com',
        subject: `[測試] NUVA Campus 活動通知`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; color: #1A1A1A; margin: 0;">NUVA Campus</h1>
            </div>

            <div style="background: #F7F5F3; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="font-size: 18px; color: #1A1A1A; margin: 0 0 16px 0;">這是一封測試郵件</h2>
              <p style="color: #6B7280; margin: 0; line-height: 1.6;">
                如果您收到這封郵件，表示郵件系統運作正常。
              </p>
            </div>

            <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
              <p>NUVA Campus</p>
            </div>
          </div>
        `,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (type === 'batch') {
      if (!eventId) {
        return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
      }

      // 批量發送郵件給未通知的參與者
      const { data: registrations, error: fetchError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('notification_sent', false);

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      if (!registrations || registrations.length === 0) {
        return NextResponse.json({ sent: 0, message: '沒有需要發送的郵件' });
      }

      let sentCount = 0;
      const errors: string[] = [];

      for (const reg of registrations) {
        try {
          const { error: sendError } = await getResend().emails.send({
            from: 'NUVA Campus <noreply@meetnuva.com>',
            to: reg.participant_email,
            subject: `NUVA Campus 活動報到資訊`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="font-size: 24px; color: #1A1A1A; margin: 0;">NUVA Campus</h1>
                </div>

                <p style="color: #1A1A1A; font-size: 16px; margin-bottom: 24px;">
                  親愛的 ${reg.participant_name}，您好！
                </p>

                <p style="color: #6B7280; margin-bottom: 24px; line-height: 1.6;">
                  感謝您報名參加 NUVA Campus 活動，以下是您的報到資訊：
                </p>

                <div style="background: #F7F5F3; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <div style="margin-bottom: 16px;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">報到編號</p>
                    <p style="color: #4A5568; font-size: 32px; font-weight: 600; letter-spacing: 8px; margin: 0;">${reg.checkin_code || '----'}</p>
                  </div>

                  ${reg.lunch_box_required && reg.lunch_code && reg.lunch_code !== '0000' ? `
                  <div style="padding-top: 16px; border-top: 1px solid #E5E7EB;">
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 4px 0;">便當編號</p>
                    <p style="color: #4A5568; font-size: 32px; font-weight: 600; letter-spacing: 8px; margin: 0;">${reg.lunch_code}</p>
                  </div>
                  ` : ''}
                </div>

                <p style="color: #6B7280; font-size: 14px; line-height: 1.6;">
                  請於活動當天出示此編號進行報到${reg.lunch_box_required ? '及領取便當' : ''}。
                </p>

                <div style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 32px;">
                  <p>NUVA Campus</p>
                </div>
              </div>
            `,
          });

          if (sendError) {
            errors.push(`${reg.participant_email}: ${sendError.message}`);
            continue;
          }

          // 更新發送狀態
          await supabase
            .from('event_registrations')
            .update({
              notification_sent: true,
              notification_sent_at: new Date().toISOString(),
            })
            .eq('id', reg.id);

          sentCount++;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`${reg.participant_email}: ${message}`);
        }
      }

      return NextResponse.json({
        sent: sentCount,
        total: registrations.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: unknown) {
    console.error('[email/send] Error:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
