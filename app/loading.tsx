/**
 * Global Loading Page
 *
 * 在頁面導航時顯示的載入畫面
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
      {/* 品牌文字 */}
      <div className="text-2xl font-bold text-text-primary tracking-widest mb-8 animate-pulse">
        nuva
      </div>

      {/* 載入動畫 - 三個跳動的點 */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>

      {/* 載入文字 */}
      <p className="mt-6 text-sm text-text-muted">
        載入中...
      </p>
    </div>
  );
}
