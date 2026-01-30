export default function Loading() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-8 w-32 bg-bg-secondary rounded mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-48 bg-bg-secondary rounded mx-auto animate-pulse" />
        </div>
        <div className="mb-8">
          <div className="h-6 w-32 bg-bg-secondary rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            <div className="card animate-pulse">
              <div className="h-6 w-48 bg-bg-secondary rounded mb-3" />
              <div className="flex gap-4">
                <div className="h-8 w-24 bg-bg-secondary rounded-full" />
                <div className="h-8 w-24 bg-bg-secondary rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
