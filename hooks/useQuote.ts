"use client";

import { useEffect, useState } from "react";
import { fetchQuote } from "@/utils/api";
import type { Quote } from "@/utils/types";

/**
 * Loads the quote of the day. The quote is purely decorative, so failures are
 * swallowed — the UI simply renders nothing rather than showing an error.
 */
export function useQuote(): Quote | null {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    let active = true;
    fetchQuote()
      .then((q) => active && setQuote(q))
      .catch(() => {
        /* non-critical: leave the banner empty */
      });
    return () => {
      active = false;
    };
  }, []);

  return quote;
}
