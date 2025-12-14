"use client";

export function PaginationControls({
  currentPage,
  lastPage,
  disabled,
  onPrev,
  onNext,
  className,
}: {
  currentPage: number;
  lastPage: number;
  disabled?: boolean;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  const prevDisabled = disabled || currentPage <= 1;
  const nextDisabled = disabled || currentPage >= lastPage;

  return (
    <div
      className={[
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={prevDisabled}
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 sm:w-auto sm:min-w-24"
      >
        Previous
      </button>
      <div className="text-center text-sm text-zinc-600">
        Page {currentPage} of {lastPage}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 sm:w-auto sm:min-w-24"
      >
        Next
      </button>
    </div>
  );
}
