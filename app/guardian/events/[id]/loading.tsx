export default function Loading() {
  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card">
            <div className="text-center animate-pulse">
              <div className="h-6 w-16 bg-bg-secondary rounded mx-auto mb-4" />
              <div className="w-16 h-px bg-border mx-auto mb-4" />
              <div className="h-12 w-24 bg-bg-secondary rounded mx-auto mb-2" />
              <div className="h-4 w-20 bg-bg-secondary rounded mx-auto" />
            </div>
          </div>
          <div className="card">
            <div className="text-center animate-pulse">
              <div className="h-6 w-20 bg-bg-secondary rounded mx-auto mb-4" />
              <div className="w-16 h-px bg-border mx-auto mb-4" />
              <div className="h-12 w-24 bg-bg-secondary rounded mx-auto mb-2" />
              <div className="h-4 w-20 bg-bg-secondary rounded mx-auto" />
            </div>
          </div>
        </div>
        <div className="card animate-pulse">
          <div className="h-6 w-24 bg-bg-secondary rounded mb-4" />
          <div className="w-12 h-px bg-border mb-4" />
          <div className="flex gap-8">
            <div>
              <div className="h-4 w-12 bg-bg-secondary rounded mb-2" />
              <div className="h-8 w-8 bg-bg-secondary rounded" />
            </div>
            <div>
              <div className="h-4 w-12 bg-bg-secondary rounded mb-2" />
              <div className="h-8 w-8 bg-bg-secondary rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
