const shimmer = "animate-pulse bg-white/10";

export default function DiscographyLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div className={`h-4 w-24 rounded-full ${shimmer}`} />
      <div className={`h-8 w-1/2 rounded-full ${shimmer}`} />
      <div className={`h-4 w-2/3 rounded-full ${shimmer}`} />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="rounded-3xl border border-white/10 bg-white/5" key={`disc-${index}`}>
            <div className={`h-48 rounded-3xl ${shimmer}`} />
            <div className="space-y-3 p-6">
              <div className={`h-3 w-20 rounded-full ${shimmer}`} />
              <div className={`h-5 w-3/4 rounded-full ${shimmer}`} />
              <div className={`h-4 w-full rounded-full ${shimmer}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
