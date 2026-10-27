/** Placeholder with a movie card's shape while the list loads. */
export function MovieCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <div className="skeleton aspect-2/3 rounded-2xl" />
      <div className="skeleton h-3.5 rounded-full mt-3 w-4/5" />
      <div className="skeleton h-3 rounded-full mt-2 w-1/2" />
    </div>
  );
}
