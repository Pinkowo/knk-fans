const shimmer = "animate-pulse bg-white/10";

export default function MembersLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div className="space-y-3">
        <div className={`h-4 w-32 rounded-full ${shimmer}`} />
        <div className={`h-8 w-1/2 rounded-full ${shimmer}`} />
        <div className={`h-5 w-2/3 rounded-full ${shimmer}`} />
      </div>
      {[0, 1].map((section) => (
        <section className="space-y-4" key={`members-skeleton-${section}`}>
          <div className={`h-4 w-40 rounded-full ${shimmer}`} />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="rounded-3xl border border-white/10 bg-white/5" key={`card-${section}-${index}`}>
                <div className={`h-60 rounded-3xl ${shimmer}`} />
                <div className="space-y-3 p-6">
                  <div className={`h-5 w-24 rounded-full ${shimmer}`} />
                  <div className={`h-6 w-3/4 rounded-full ${shimmer}`} />
                  <div className={`h-4 w-full rounded-full ${shimmer}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
