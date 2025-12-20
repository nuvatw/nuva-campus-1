export default function ContactCard() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-10 text-center relative pb-4">
          📬 聯絡我們
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary rounded" />
        </h2>

        <div className="bg-primary rounded-2xl p-6 sm:p-10 text-center text-white relative overflow-hidden">
          {/* 背景裝飾 */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">有任何問題嗎？</h3>
            <p className="text-white/80 mb-6 sm:mb-8 text-sm sm:text-base">歡迎隨時來信，我們會盡快回覆你！</p>
            
            <a 
              href="mailto:hello@meetnuva.com" 
              className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-white/20 hover:bg-white/30 transition-colors px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">hello@meetnuva.com</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}