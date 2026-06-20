import { NextResponse } from "next/server";

// Upstream: ZenQuotes "quote of the day" — keyless, returns a single-item array.
const ZEN_QUOTES_TODAY = "https://zenquotes.io/api/today";

type ZenQuote = { q?: string; a?: string };

// GET /api/quote — proxy the daily quote so the API stays server-side and
// cacheable, and the client never deals with CORS or upstream response shape.
export async function GET() {
  try {
    const res = await fetch(ZEN_QUOTES_TODAY, {
      // The quote only changes once a day; revalidate hourly to be safe while
      // keeping us well within the upstream's rate limits.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      throw new Error(`Upstream responded with ${res.status}`);
    }

    const [quote] = (await res.json()) as ZenQuote[];
    if (!quote?.q) {
      throw new Error("Unexpected upstream response shape");
    }

    return NextResponse.json({
      text: quote.q,
      author: quote.a ?? "Unknown",
    });
  } catch (error) {
    console.error("GET /api/quote failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 502 },
    );
  }
}
