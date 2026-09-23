/**
 * 관심종목 분석 — company.config.ts의 WATCHLIST 종목들의 실제 DART 재무 데이터만으로
 * 규칙 기반(부채비율·이익률·성장률 등 임계값 비교) 재무 건전성 점수를 계산한다.
 *
 * AI(Claude)를 쓰지 않는 순수 계산이라 API 비용이 들지 않는다.
 * ⚠️ 주가·PER·PBR 같은 밸류에이션 데이터는 쓰지 않으므로, "저평가"가 아니라
 *    "재무 건전성" 신호로만 해석해야 한다.
 *
 * 비밀값은 코드에 두지 않는다. 로컬은 `.dev.vars`, 배포는 `wrangler secret put`.
 *   TOSS_API_KEY / TOSS_API_BASE_URL   DART 재무 데이터 조회용 (worker/toss.ts와 동일)
 */

import { getWatchlistFinancials, type TossEnv } from "./toss";

export type WatchlistEnv = TossEnv;

export type StockVerdict = { code: string; name: string; verdict: string; reason: string; score: number };

export type WatchlistAnalysis = {
  ok: boolean;
  generatedAt: string;
  year: string;
  summary: string;
  stocks: StockVerdict[];
  error?: string;
};

function num(data: unknown, key: string): number | null {
  const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const value = rec[key];
  if (typeof value !== "string") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** 부채비율·유동비율·이익률·이익의 질·성장률을 각각 +1/0/-1로 채점해 합산한다 */
function scoreStock(financial: unknown, growth: unknown): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const debtRatio = num(financial, "debtRatio");
  if (debtRatio !== null) {
    if (debtRatio < 100) {
      score += 1;
      reasons.push(`부채비율 ${debtRatio}% (양호)`);
    } else if (debtRatio > 200) {
      score -= 1;
      reasons.push(`부채비율 ${debtRatio}% (부담)`);
    }
  }

  const currentRatio = num(financial, "currentRatio");
  if (currentRatio !== null) {
    if (currentRatio > 150) {
      score += 1;
      reasons.push(`유동비율 ${currentRatio}% (양호)`);
    } else if (currentRatio < 100) {
      score -= 1;
      reasons.push(`유동비율 ${currentRatio}% (주의)`);
    }
  }

  const operatingMargin = num(financial, "operatingMargin");
  if (operatingMargin !== null) {
    if (operatingMargin > 10) {
      score += 1;
      reasons.push(`영업이익률 ${operatingMargin}% (양호)`);
    } else if (operatingMargin < 0) {
      score -= 1;
      reasons.push(`영업이익률 ${operatingMargin}% (적자)`);
    }
  }

  const netMargin = num(financial, "netMargin");
  if (netMargin !== null && netMargin < 0) {
    score -= 1;
    reasons.push(`순이익률 ${netMargin}% (적자)`);
  }

  const cfToNi = num(financial, "operatingCashFlowToNetIncome");
  if (cfToNi !== null) {
    if (cfToNi >= 1) {
      score += 1;
      reasons.push(`영업현금흐름/순이익 ${cfToNi} (이익의 질 양호)`);
    } else if (cfToNi < 0.5) {
      score -= 1;
      reasons.push(`영업현금흐름/순이익 ${cfToNi} (이익의 질 우려)`);
    }
  }

  const revenueGrowth = num(growth, "revenueGrowth");
  if (revenueGrowth !== null && revenueGrowth > 0) {
    score += 1;
    reasons.push(`매출 성장률 +${revenueGrowth}%`);
  }

  const opGrowth = num(growth, "operatingProfitGrowth");
  if (opGrowth !== null) {
    if (opGrowth > 0) {
      score += 1;
      reasons.push(`영업이익 성장률 +${opGrowth}%`);
    } else {
      score -= 1;
      reasons.push(`영업이익 성장률 ${opGrowth}%`);
    }
  }

  const niGrowth = num(growth, "netIncomeGrowth");
  if (niGrowth !== null) {
    if (niGrowth > 0) {
      score += 1;
      reasons.push(`순이익 성장률 +${niGrowth}%`);
    } else {
      score -= 1;
      reasons.push(`순이익 성장률 ${niGrowth}%`);
    }
  }

  const debtRatioChange = num(growth, "debtRatioChange");
  if (debtRatioChange !== null) {
    if (debtRatioChange < 0) {
      score += 1;
      reasons.push(`부채비율 ${debtRatioChange}%p 개선`);
    } else if (debtRatioChange > 10) {
      score -= 1;
      reasons.push(`부채비율 +${debtRatioChange}%p 악화`);
    }
  }

  return { score, reasons };
}

function verdictFromScore(score: number): string {
  if (score >= 3) return "재무 우량 신호";
  if (score <= -3) return "재무 우려 신호";
  return "중립";
}

export async function analyzeWatchlist(
  env: WatchlistEnv,
  watchlist: { code: string; name: string }[],
  year: string,
): Promise<WatchlistAnalysis> {
  const generatedAt = new Date().toISOString();
  const base = { ok: false as const, generatedAt, year, summary: "", stocks: [] };

  if (!env.TOSS_API_KEY || !env.TOSS_API_BASE_URL) {
    return { ...base, error: "TOSS_API_KEY / TOSS_API_BASE_URL 미설정 — 재무 데이터를 가져올 수 없어요." };
  }
  if (watchlist.length === 0) {
    return { ...base, error: "관심종목 리스트가 비어있어요. company.config.ts의 WATCHLIST를 채워주세요." };
  }

  const results = await Promise.all(watchlist.map((item) => getWatchlistFinancials(env, item.code, year)));

  const stocks: StockVerdict[] = results.map((r, i) => {
    const item = watchlist[i];
    if (!r.financial.ok) {
      return { code: item.code, name: item.name, verdict: "조회 실패", reason: "재무 데이터를 가져오지 못했어요.", score: 0 };
    }
    const { score, reasons } = scoreStock(r.financial.data, r.growth.ok ? r.growth.data : {});
    return {
      code: item.code,
      name: item.name,
      verdict: verdictFromScore(score),
      reason: reasons.slice(0, 4).join(" · ") || "판단할 데이터가 부족해요.",
      score,
    };
  });

  const good = stocks.filter((s) => s.verdict === "재무 우량 신호").map((s) => s.name);
  const bad = stocks.filter((s) => s.verdict === "재무 우려 신호").map((s) => s.name);
  const summaryParts: string[] = [];
  if (good.length) summaryParts.push(`${good.join(", ")} — 부채·이익률·성장성 지표가 대체로 양호해요.`);
  if (bad.length) summaryParts.push(`${bad.join(", ")} — 재무 지표에서 우려 신호가 있어요.`);
  if (!good.length && !bad.length) summaryParts.push("관심종목 대부분이 뚜렷한 강점·약점 없이 중립적인 재무 지표를 보이고 있어요.");
  summaryParts.push("이 판단은 DART 공시 재무 지표만으로 계산한 규칙 기반 결과이며, 주가·PER·PBR 같은 밸류에이션은 반영되지 않았습니다.");

  return { ok: true, generatedAt, year, summary: summaryParts.join(" "), stocks };
}
