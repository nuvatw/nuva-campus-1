export default function Loading() {
  return (
    <div className="py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-24 bg-bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
