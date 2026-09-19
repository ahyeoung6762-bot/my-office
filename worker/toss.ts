/**
 * 사용자가 직접 만든 토스증권 시세/기술분석 + DART 재무 프록시 서버("SGS Connector")를 호출한다.
 * Claude나 다른 LLM을 전혀 쓰지 않는 순수 데이터 조회라 API 비용이 들지 않는다.
 *
 * ⚠️ ngrok 무료 터널은 컴퓨터를 껐다 켜거나 ngrok을 재시작할 때마다 주소가 바뀐다.
 *    그때마다 .dev.vars의 TOSS_API_BASE_URL을 새 주소로 바꿔줘야 한다.
 *    (SGS Connector 서버 자체가 켜져 있어야만 조회가 된다)
 *
 * 비밀값은 코드에 두지 않는다. 로컬은 `.dev.vars`, 배포는 `wrangler secret put`.
 *   TOSS_API_KEY         SGS Connector openapi.yaml의 MyApiKey (X-API-Key 헤더 값)
 *   TOSS_API_BASE_URL     SGS Connector 서버 주소 (예: https://xxxx.ngrok-free.dev, 끝에 / 없이)
 */

export type TossEnv = { TOSS_API_KEY?: string; TOSS_API_BASE_URL?: string };

export type ProxyResult = { ok: boolean; status: number; data: unknown };

const TIMEOUT_MS = 15000;

async function call(env: TossEnv, path: string): Promise<ProxyResult> {
  if (!env.TOSS_API_KEY || !env.TOSS_API_BASE_URL) {
    return { ok: false, status: 0, data: { error: "TOSS_API_KEY / TOSS_API_BASE_URL 미설정" } };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${env.TOSS_API_BASE_URL}${path}`, {
      headers: {
        "X-API-Key": env.TOSS_API_KEY,
        // ngrok 무료 터널이 보여주는 안내 페이지(HTML)를 건너뛰고 바로 API 응답을 받기 위함
        "ngrok-skip-browser-warning": "true",
      },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      status: 0,
      data: {
        error: timedOut
          ? `${TIMEOUT_MS / 1000}초 안에 응답이 없어 중단했어요 — SGS Connector·ngrok 서버가 켜져 있는지, TOSS_API_BASE_URL이 최신 ngrok 주소인지 확인하세요.`
          : `요청 실패: ${String(error)} — SGS Connector·ngrok 서버가 켜져 있는지 확인하세요.`,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

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

export async function getStockBrief(env: TossEnv, symbol: string, year: string): Promise<StockBriefResult> {
  const [price, technical, candles, financial, growth, disclosures] = await Promise.all([
    call(env, `/stock/${symbol}/price`),
    call(env, `/stock/${symbol}/technical-simple`),
    call(env, `/stock/${symbol}/candles-simple?interval=1d&count=20`),
    call(env, `/dart/${symbol}/financial-sgs?bsns_year=${year}`),
    call(env, `/dart/${symbol}/financial-growth-sgs?bsns_year=${year}`),
    call(env, `/dart/${symbol}/disclosures-simple?count=10&days=365`),
  ]);
  return { symbol, year, fetchedAt: new Date().toISOString(), price, technical, candles, financial, growth, disclosures };
}
