// 토스증권·DART 프록시(SGS Connector)에서 받은 종목 리포트를 서버(/api/stock-brief)에 요청한다
export type ProxyResult = { ok: boolean; status: number; data: unknown };

export type StockBriefResult = {
  symbol: string;
  year: string;
  fetchedAt: string;
  price: ProxyResult;
  technical: ProxyResult;
  candles: ProxyResult;
  financial: ProxyResult;
  growth: ProxyResult;
  disclosures: ProxyResult;
};

export async function requestStockBrief(symbol: string, year: string): Promise<StockBriefResult> {
  const response = await fetch(`/api/stock-brief?symbol=${encodeURIComponent(symbol)}&year=${encodeURIComponent(year)}`);
  const json = (await response.json().catch(() => null)) as StockBriefResult | { error: string } | null;
  if (!json) throw new Error(`종목 리포트 조회 실패 (HTTP ${response.status})`);
  if ("error" in json) throw new Error(json.error);
  return json;
}
