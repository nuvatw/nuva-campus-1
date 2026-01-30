export function StatsSection() {
  return (
    <section className="py-12 bg-bg-secondary/50">
      <div className="max-w-4xl mx-auto px-6">
        {/* 主題標語 */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-text-primary mb-4">
          下一站，<span className="text-accent">AI</span>！
        </h2>

        <p className="text-center text-text-secondary mb-8 leading-relaxed">
          我們將在 <span className="text-accent font-semibold">4 月中至 5 月中</span>，開著露營車巡迴全台灣
        </p>

        {/* 一天的行程 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-bg-card rounded-xl p-5 text-center border border-border-light">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-sm text-text-muted mb-1">早上</p>
            <p className="font-medium text-text-primary">一對一職涯諮詢</p>
          </div>
          <div className="bg-bg-card rounded-xl p-5 text-center border border-border-light">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.06-7.072m-2.83 9.9a9 9 0 010-12.728M12 18v3m0-3a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <p className="text-sm text-text-muted mb-1">下午</p>
            <p className="font-medium text-text-primary">大會主題演講</p>
          </div>
          <div className="bg-bg-card rounded-xl p-5 text-center border border-border-light">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <p className="text-sm text-text-muted mb-1">晚上</p>
            <p className="font-medium text-text-primary">戶外大型交流活動</p>
          </div>
        </div>

        {/* 數據統計 */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-accent">1</p>
            <p className="text-sm text-text-muted mt-1">露營車</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-accent">15+</p>
            <p className="text-sm text-text-muted mt-1">目標學校</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-accent">30</p>
            <p className="text-sm text-text-muted mt-1">天巡迴</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-bold text-accent">3000+</p>
            <p className="text-sm text-text-muted mt-1">目標學生</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
