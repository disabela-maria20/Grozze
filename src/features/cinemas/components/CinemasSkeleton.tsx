/** Same layout as the cinemas page, shown while the catalog loads. */
export function CinemasSkeleton() {
  return (
    <div
      className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]"
      role="status"
      aria-label="Carregando cinemas"
    >
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">
            Cinemas
          </h1>
        </header>
        <div className="skeleton min-h-[52px] max-sm:min-h-12 rounded-2xl border border-line mb-5" />
        <div className="grid grid-cols-[0.95fr_1.05fr] max-md:grid-cols-1 gap-6.5">
          <div className="skeleton h-[440px] max-md:h-[280px] border border-line rounded-[20px]" />
          <div className="grid gap-3 content-start">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="border border-line rounded-[17px] max-sm:rounded-2xl p-5 max-sm:p-4 bg-surface grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center"
              >
                <div className="grid gap-2.5">
                  <div className="skeleton h-5 w-3/5 rounded-md" />
                  <div className="skeleton h-3.5 w-4/5 rounded-md" />
                  <div className="skeleton h-3 w-2/5 rounded-md" />
                </div>
                <div className="skeleton w-[42px] h-[42px] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
