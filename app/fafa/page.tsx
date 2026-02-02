'use client';

export default function FafaPage() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-text-primary mb-3">
            法法
          </h1>
          <p className="text-text-secondary">
            活動參與者專區
          </p>
        </div>

        {/* Content */}
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-text-primary mb-2">
            敬請期待
          </h2>
          <p className="text-text-muted">
            法法專區即將開放，請耐心等候
          </p>
        </div>
      </div>
    </div>
  );
}
