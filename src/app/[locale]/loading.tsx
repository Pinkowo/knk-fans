const shimmer = "animate-pulse bg-white/10";

function SkeletonRow() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className={`h-6 w-32 rounded-full ${shimmer}`} />
      <div className={`mt-3 h-5 w-3/4 rounded-full ${shimmer}`} />
      <div className={`mt-2 h-4 w-1/2 rounded-full ${shimmer}`} />
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div className={`h-32 rounded-2xl ${shimmer}`} key={`tag-${index}`} />
        ))}
      </div>
    </div>
  );
}

export default function LocaleLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <div className="space-y-3">
        <div className={`h-4 w-24 rounded-full ${shimmer}`} />
        <div className={`h-10 w-2/3 rounded-full ${shimmer}`} />
        <div className={`h-5 w-1/2 rounded-full ${shimmer}`} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonRow key={`song-skeleton-${index}`} />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6" key={`show-skeleton-${index}`}>
            <div className={`h-48 rounded-2xl ${shimmer}`} />
            <div className={`mt-4 h-6 w-1/2 rounded-full ${shimmer}`} />
            <div className={`mt-2 h-5 w-3/4 rounded-full ${shimmer}`} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6" key={`charm-skeleton-${index}`}>
            <div className={`mx-auto h-14 w-14 rounded-full ${shimmer}`} />
            <div className={`mt-4 h-5 w-2/3 rounded-full ${shimmer}`} />
            <div className={`mt-2 h-4 w-full rounded-full ${shimmer}`} />
            <div className={`mt-2 h-4 w-3/4 rounded-full ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
