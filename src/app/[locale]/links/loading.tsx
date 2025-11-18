const shimmer = "animate-pulse bg-white/10";

export default function LinksLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <div className="space-y-3">
        <div className={`h-4 w-24 rounded-full ${shimmer}`} />
        <div className={`h-8 w-2/3 rounded-full ${shimmer}`} />
        <div className={`h-4 w-1/2 rounded-full ${shimmer}`} />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6" key={`link-skeleton-${index}`}>
          <div className={`h-4 w-16 rounded-full ${shimmer}`} />
          <div className={`mt-3 h-6 w-1/2 rounded-full ${shimmer}`} />
          <div className={`mt-2 h-4 w-2/3 rounded-full ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}
