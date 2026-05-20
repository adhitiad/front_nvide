'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#09090b] px-4 text-center">
      <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
      <p className="text-sm text-neutral-400 max-w-md">
        An unexpected error occurred. This has been logged.
      </p>
      {error.digest && (
        <p className="text-xs font-mono text-neutral-600">Ref: {error.digest}</p>
      )}
      <button
        onClick={() => reset()}
        className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
