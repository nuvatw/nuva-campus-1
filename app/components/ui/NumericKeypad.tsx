'use client';

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onConfirm?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showConfirm?: boolean;
}

export function NumericKeypad({
  onDigit,
  onBackspace,
  onConfirm,
  size = 'md',
  showConfirm = false,
}: NumericKeypadProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-16 h-16 text-2xl',
  };

  const buttonClass = `${sizeClasses[size]} rounded-lg bg-bg-card border border-border-light
    text-text-primary font-medium transition-all duration-150
    hover:bg-bg-secondary active:scale-95 active:bg-primary/10
    focus:outline-none focus:ring-2 focus:ring-primary/50`;

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
      {digits.map((digit) => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className={buttonClass}
        >
          {digit}
        </button>
      ))}

      {/* Bottom row */}
      {showConfirm && onConfirm ? (
        <button
          type="button"
          onClick={onConfirm}
          className={`${buttonClass} text-success`}
        >
          <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={() => onDigit('0')}
        className={buttonClass}
      >
        0
      </button>

      <button
        type="button"
        onClick={onBackspace}
        className={`${buttonClass} text-text-secondary`}
      >
        <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      </button>
    </div>
  );
}
