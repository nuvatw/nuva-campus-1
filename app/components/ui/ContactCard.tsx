export default function ContactCard() {
  return (
    <section className="bg-gray-50 py-20 px-8">
      <div className="max-w-4xl mx-auto fade-in-section">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-primary after:rounded">
          📬 聯絡我們
        </h2>
        
        <div className="bg-primary text-white text-center p-12 rounded-3xl max-w-2xl mx-auto relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-8 -right-8 text-[10rem] opacity-10">✉</div>
          
          <h3 className="text-2xl font-semibold mb-4 relative z-10">
            有任何問題嗎？
          </h3>
          <p className="text-lg opacity-90 mb-6 relative z-10">
            歡迎隨時來信，我們會盡快回覆你！
          </p>
          <a 
            href="mailto:hello@meetnuva.com" 
            className="inline-flex items-center gap-3 bg-white/20 px-8 py-4 rounded-full text-white font-medium text-lg transition-all duration-300 hover:bg-white/30 hover:-translate-y-1 relative z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            hello@meetnuva.com
          </a>
        </div>
      </div>
    </section>
  );
}