const shimmer = "animate-pulse bg-white/10";

export default function SongLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <div className={`h-4 w-20 rounded-full ${shimmer}`} />
      <div className={`h-8 w-2/3 rounded-full ${shimmer}`} />
      <div className={`h-4 w-1/2 rounded-full ${shimmer}`} />
      <div className={`h-64 w-full rounded-3xl ${shimmer}`} />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div className={`h-48 rounded-3xl ${shimmer}`} key={`lyrics-${index}`} />
        ))}
      </div>
    </div>
  );
}
