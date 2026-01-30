import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const API_SECRET = process.env.API_SECRET_KEY;

interface AuthResult {
  authorized: boolean;
  error?: NextResponse;
}

/**
 * 驗證 API Key
 * 檢查請求標頭中的 x-api-key 是否與環境變數中的 API_SECRET_KEY 相符
 */
export async function validateApiKey(): Promise<boolean> {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');

  if (!API_SECRET) {
    console.warn('[api-auth] API_SECRET_KEY not configured');
    return false;
  }

  return apiKey === API_SECRET;
}

/**
 * 需要 API 認證
 * 如果認證失敗，返回 401 錯誤回應
 * 如果認證成功，返回 null
 */
export async function requireApiAuth(): Promise<AuthResult> {
  const isValid = await validateApiKey();

  if (!isValid) {
    return {
      authorized: false,
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      ),
    };
  }

  return { authorized: true };
}

/**
 * 驗證內部請求
 * 檢查請求是否來自可信任的來源（例如：同一應用程式內部）
 * 使用 x-internal-token 標頭
 */
export async function validateInternalRequest(): Promise<boolean> {
  const headersList = await headers();
  const internalToken = headersList.get('x-internal-token');

  const expectedToken = process.env.INTERNAL_API_TOKEN;

  if (!expectedToken) {
    return false;
  }

  return internalToken === expectedToken;
}

/**
 * 生成安全的隨機 API Key
 * 用於初始設定或金鑰輪換
 */
export function generateApiKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}
