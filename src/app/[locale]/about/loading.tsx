const shimmer = "animate-pulse bg-white/10";

export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-12">
      <div className={`h-4 w-24 rounded-full ${shimmer}`} />
      <div className={`h-8 w-1/2 rounded-full ${shimmer}`} />
      <div className={`h-48 rounded-3xl ${shimmer}`} />
      <div className={`h-6 w-1/3 rounded-full ${shimmer}`} />
      <div className={`h-4 w-1/2 rounded-full ${shimmer}`} />
      <div className={`h-4 w-2/3 rounded-full ${shimmer}`} />
    </div>
  );
}
