'use client';

interface CodeInputProps {
  code: string[];
  error?: boolean;
  label?: string;
}

export function CodeInput({ code, error = false, label }: CodeInputProps) {
  return (
    <div className="text-center">
      {label && (
        <p className="text-text-secondary text-sm mb-4">{label}</p>
      )}
      <div className="flex justify-center gap-3">
        {code.map((digit, index) => (
          <div
            key={index}
            className={`
              code-digit
              ${digit ? 'filled' : ''}
              ${error ? 'border-error' : ''}
            `}
          >
            {digit || ''}
          </div>
        ))}
      </div>
    </div>
  );
}
