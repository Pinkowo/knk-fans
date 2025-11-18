const shimmer = "animate-pulse bg-white/10";

export default function VarietyLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div className="space-y-3">
        <div className={`h-4 w-32 rounded-full ${shimmer}`} />
        <div className={`h-8 w-1/2 rounded-full ${shimmer}`} />
        <div className={`h-5 w-2/3 rounded-full ${shimmer}`} />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4" key={`series-skeleton-${index}`}>
          <div className="flex items-center gap-4">
            <div className={`h-16 w-24 rounded-2xl ${shimmer}`} />
            <div className="flex-1 space-y-3">
              <div className={`h-3 w-24 rounded-full ${shimmer}`} />
              <div className={`h-5 w-1/2 rounded-full ${shimmer}`} />
              <div className={`h-4 w-3/4 rounded-full ${shimmer}`} />
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {Array.from({ length: 2 }).map((_, epIndex) => (
              <div className={`h-48 rounded-2xl ${shimmer}`} key={`ep-${index}-${epIndex}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
