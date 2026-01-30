export default function Loading() {
  return (
    <div className="py-8 px-6 min-h-[calc(100vh-120px)]">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-5 w-16 bg-bg-secondary rounded animate-pulse" />
        </div>
        <div className="text-center">
          <div className="h-8 w-32 bg-bg-secondary rounded mx-auto mb-8 animate-pulse" />
          <div className="flex justify-center gap-3 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-14 h-16 bg-bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-14 bg-bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
