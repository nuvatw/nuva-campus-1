/**
 * 格式化名字：取第一個字 + 桑
 */
export function formatName(name: string): string {
  if (!name) return '匿名桑';
  const trimmed = name.trim();
  // 檢查是否是英文開頭（保留完整英文名）
  if (/^[a-zA-Z]/.test(trimmed)) {
    // 取第一個單詞或整個名字（如果沒有空格）
    const firstWord = trimmed.split(' ')[0];
    return `${firstWord} 桑`;
  }
  // 中文名字取第一個字
  return `${trimmed.charAt(0)}桑`;
}
