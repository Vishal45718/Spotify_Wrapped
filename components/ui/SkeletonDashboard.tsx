export function SkeletonDashboard() {
  return (
    <div className="animate-pulse space-y-8 mt-8">
      <div className="h-12 w-64 bg-white/5 rounded-xl mx-auto mb-12"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>
        ))}
      </div>

      <div className="h-48 bg-white/5 rounded-3xl w-full max-w-lg mx-auto my-12"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-white/5 rounded"></div>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-white/5 rounded"></div>
          <div className="h-80 bg-white/5 rounded-3xl"></div>
        </div>
      </div>
    </div>
  );
}
