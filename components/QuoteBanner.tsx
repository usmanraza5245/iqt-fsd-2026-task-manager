"use client";

import { useQuote } from "@/hooks/useQuote";

export default function QuoteBanner() {
  const quote = useQuote();
  if (!quote) return null;

  return (
    <figure className="mt-4 border-l-2 border-zinc-300 pl-3 text-left dark:border-zinc-700">
      <blockquote className="text-sm italic text-zinc-600 dark:text-zinc-400">
        “{quote.text}”
      </blockquote>
      <figcaption className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        — {quote.author}
      </figcaption>
    </figure>
  );
}
