'use client';

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onConfirm?: () => void;
  disabled?: boolean;
  showConfirm?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: {
    grid: 'gap-2 max-w-[200px]',
    button: 'w-14 h-12 text-lg',
    icon: 'w-5 h-5',
  },
  md: {
    grid: 'gap-3 max-w-[264px]',
    button: 'w-[72px] h-14 md:w-20 md:h-16 text-xl',
    icon: 'w-6 h-6',
  },
  lg: {
    grid: 'gap-4 max-w-[300px]',
    button: 'w-20 h-16 md:w-24 md:h-20 text-2xl',
    icon: 'w-7 h-7',
  },
};

export function NumericKeypad({
  onDigit,
  onBackspace,
  onConfirm,
  disabled = false,
  showConfirm = false,
  size = 'md',
}: NumericKeypadProps) {
  const keys = showConfirm
    ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'confirm']
    : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

  const sizeStyles = sizes[size];

  return (
    <div
      className={`grid grid-cols-3 ${sizeStyles.grid} mx-auto`}
      role="group"
      aria-label="數字鍵盤"
    >
      {keys.map((key, index) => {
        if (key === '') {
          return (
            <div
              key={index}
              className={sizeStyles.button}
              aria-hidden="true"
            />
          );
        }

        if (key === 'back') {
          return (
            <button
              key={index}
              type="button"
              onClick={onBackspace}
              disabled={disabled}
              aria-label="退格"
              className={`keypad-btn ${sizeStyles.button} focus:outline-none focus:ring-2 focus:ring-primary/30`}
            >
              <svg
                className={sizeStyles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                />
              </svg>
            </button>
          );
        }

        if (key === 'confirm') {
          return (
            <button
              key={index}
              type="button"
              onClick={onConfirm}
              disabled={disabled}
              aria-label="確認"
              className={`keypad-btn ${sizeStyles.button} bg-primary text-white border-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50`}
            >
              <svg
                className={sizeStyles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          );
        }

        return (
          <button
            key={index}
            type="button"
            onClick={() => onDigit(key)}
            disabled={disabled}
            aria-label={`數字 ${key}`}
            className={`keypad-btn ${sizeStyles.button} focus:outline-none focus:ring-2 focus:ring-primary/30`}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
