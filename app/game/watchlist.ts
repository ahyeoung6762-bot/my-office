// 관심종목 분석 결과를 서버(/api/watchlist-analysis)에 요청한다
export type StockVerdict = { code: string; name: string; verdict: string; reason: string; score: number };

export type WatchlistAnalysis = {
  ok: boolean;
  generatedAt: string;
  year: string;
  summary: string;
  stocks: StockVerdict[];
  error?: string;
};

export async function requestWatchlistAnalysis(year: string): Promise<WatchlistAnalysis> {
  const response = await fetch(`/api/watchlist-analysis?year=${encodeURIComponent(year)}`, { method: "POST" });
  const json = (await response.json().catch(() => null)) as WatchlistAnalysis | null;
  if (!json) throw new Error(`관심종목 분석 실패 (HTTP ${response.status})`);
  return json;
}
