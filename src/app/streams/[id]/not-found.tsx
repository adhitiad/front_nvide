import Link from "next/link";

export default function StreamsNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-2xl font-bold text-neutral-400">Stream not found</h2>
      <p className="text-sm text-neutral-500 max-w-sm">
        This stream does not exist or has been removed.
      </p>
      <Link
        href="/streams"
        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
      >
        Browse streams
      </Link>
    </div>
  );
}
