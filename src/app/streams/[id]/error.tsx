'use client';

import Link from "next/link";

export default function StreamsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-bold text-red-400">Failed to load stream</h2>
      <p className="text-sm text-neutral-400 max-w-md">
        This stream could not be loaded. It may have ended or been removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 cursor-pointer"
        >
          Retry
        </button>
        <Link
          href="/streams"
          className="rounded-xl border border-neutral-700 px-5 py-2 text-sm font-bold text-neutral-300 hover:bg-neutral-800"
        >
          Browse streams
        </Link>
      </div>
    </div>
  );
}
