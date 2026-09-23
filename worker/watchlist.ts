/**
 * 관심종목 분석 — company.config.ts의 WATCHLIST 종목들의 실제 DART 재무 데이터를 모아
 * Claude(웹 검색 포함)에게 넘겨, 저평가 신호·요즘 뜨는 테마와의 연관성을 종합 결론으로 받는다.
 *
 * 버튼을 눌렀을 때만 실행된다 (자동 실행 없음) — Claude API 호출 비용이 발생하기 때문.
 *
 * 비밀값은 코드에 두지 않는다. 로컬은 `.dev.vars`, 배포는 `wrangler secret put`.
 *   TOSS_API_KEY / TOSS_API_BASE_URL   DART 재무 데이터 조회용 (worker/toss.ts와 동일)
 *   ANTHROPIC_API_KEY                   Claude 분석용 (worker/ai-brief.ts와 동일)
 */

import { getWatchlistFinancials, type TossEnv } from "./toss";
import type { AiBriefEnv } from "./ai-brief";

export type WatchlistEnv = TossEnv & AiBriefEnv;

export type StockVerdict = { code: string; name: string; verdict: string; reason: string };

export type WatchlistAnalysis = {
  ok: boolean;
  generatedAt: string;
  year: string;
  summary: string;
  themes: string[];
  stocks: StockVerdict[];
  error?: string;
};

const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-opus-5";

function buildPrompt(watchlist: { code: string; name: string }[], dataBlock: string): string {
  return [
    "당신은 한국 개인 투자자를 위한 증권 리서치 애널리스트입니다.",
    "아래는 대표님의 관심종목 리스트에 대해 DART 공시 기반으로 실제 조회한 재무 데이터입니다.",
    "",
    dataBlock,
    "",
    "요청:",
    "1. 위 실제 데이터(부채비율·유동비율·이익률·전년 대비 성장률 등)만 근거로, 각 종목의 재무적 저평가·우려 신호를 짧게 평가하세요.",
    "   데이터에 없는 주가·PER·PBR 같은 밸류에이션 수치는 모른다고 하고 추측하지 마세요.",
    "2. 웹 검색으로 지금 국내 증시에서 뜨고 있는 업종·테마를 확인하고, 위 종목들과 관련 있으면 연결해서 언급하세요.",
    "3. 마지막에 대표님이 참고할 3~5문장짜리 종합 결론을 쓰세요.",
    "   특정 종목의 매수·매도를 권유하는 표현은 쓰지 말고, 사실과 관찰 위주로 담백하게 쓰세요. 이 분석은 투자 자문이 아닙니다.",
    "",
    "검색을 마친 뒤, 마지막 응답은 반드시 아래 JSON 형식만 출력하세요. JSON 앞뒤에 다른 설명 문장을 절대 쓰지 마세요.",
    "",
    `<<<JSON>>>{"summary":"종합 결론 3~5문장","themes":["테마1","테마2"],"stocks":[${watchlist
      .map((w) => `{"code":"${w.code}","name":"${w.name}","verdict":"저평가 신호 있음|중립|우려 신호 있음","reason":"근거 1~2문장"}`)
      .join(",")}]}<<<END>>>`,
  ].join("\n");
}

function extractAnalysis(text: string): Omit<WatchlistAnalysis, "ok" | "generatedAt" | "year"> | null {
  const match = text.match(/<<<JSON>>>([\s\S]*?)<<<END>>>/);
  const raw = (match ? match[1] : text).trim();
  try {
    const parsed = JSON.parse(raw) as { summary?: string; themes?: unknown; stocks?: unknown };
    if (!parsed.summary || !Array.isArray(parsed.stocks)) return null;
    const stocks = parsed.stocks.filter(
      (s): s is StockVerdict =>
        Boolean(s) &&
        typeof (s as StockVerdict).code === "string" &&
        typeof (s as StockVerdict).verdict === "string",
    );
    if (stocks.length === 0) return null;
    return {
      summary: parsed.summary,
      themes: Array.isArray(parsed.themes) ? parsed.themes.filter((t): t is string => typeof t === "string") : [],
      stocks,
    };
  } catch {
    return null;
  }
}

export async function analyzeWatchlist(
  env: WatchlistEnv,
  watchlist: { code: string; name: string }[],
  year: string,
): Promise<WatchlistAnalysis> {
  const generatedAt = new Date().toISOString();
  const base = { ok: false as const, generatedAt, year, summary: "", themes: [], stocks: [] };

  if (!env.TOSS_API_KEY || !env.TOSS_API_BASE_URL) {
    return { ...base, error: "TOSS_API_KEY / TOSS_API_BASE_URL 미설정 — 재무 데이터를 가져올 수 없어요." };
  }
  if (!env.ANTHROPIC_API_KEY) {
    return { ...base, error: "ANTHROPIC_API_KEY 미설정 — .dev.vars에 키를 추가하세요." };
  }
  if (watchlist.length === 0) {
    return { ...base, error: "관심종목 리스트가 비어있어요. company.config.ts의 WATCHLIST를 채워주세요." };
  }

  const dataResults = await Promise.all(watchlist.map((item) => getWatchlistFinancials(env, item.code, year)));

  const dataBlock = dataResults
    .map((r, i) => {
      const name = watchlist[i].name;
      const financialText = r.financial.ok ? JSON.stringify(r.financial.data) : `조회 실패: ${JSON.stringify(r.financial.data)}`;
      const growthText = r.growth.ok ? JSON.stringify(r.growth.data) : `조회 실패: ${JSON.stringify(r.growth.data)}`;
      const disclosuresText = r.disclosures.ok ? JSON.stringify(r.disclosures.data) : "공시 조회 실패";
      return `### ${name} (${r.symbol})\n재무: ${financialText}\n성장률: ${growthText}\n최근공시: ${disclosuresText}`;
    })
    .join("\n\n");

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
        messages: [{ role: "user", content: buildPrompt(watchlist, dataBlock) }],
      }),
    });
  } catch (error) {
    return { ...base, error: `Claude API 요청 실패: ${String(error)}` };
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return { ...base, error: `Claude API 오류 (HTTP ${response.status}) ${detail.slice(0, 300)}` };
  }

  const json = (await response.json()) as { content?: { type: string; text?: string }[] };
  const text = (json.content ?? [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n");

  const analysis = extractAnalysis(text);
  if (!analysis) {
    return { ...base, error: "응답을 해석하지 못했어요. 잠시 후 다시 시도해주세요." };
  }

  return { ok: true, generatedAt, year, ...analysis };
}
