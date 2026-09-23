/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { integrationStatus, publishReport, type DayReport, type PublishEnv } from "./report";
import { generateAiBrief, type AiBriefEnv } from "./ai-brief";
import { getStockBrief, type TossEnv } from "./toss";
import { analyzeWatchlist } from "./watchlist";
import { WATCHLIST } from "../company.config";

interface Env extends PublishEnv, AiBriefEnv, TossEnv {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 연동 설정 여부만 알려준다 (값은 절대 내보내지 않는다)
    if (url.pathname === "/api/integrations") {
      return Response.json(integrationStatus(env));
    }

    // 완료 보고를 Notion + Discord로 동시 발행
    if (url.pathname === "/api/report") {
      if (request.method !== "POST") return new Response("POST only", { status: 405 });
      try {
        const report = (await request.json()) as DayReport;
        const result = await publishReport(report, env);
        return Response.json(result);
      } catch (error) {
        return Response.json({ error: String(error) }, { status: 400 });
      }
    }

    // 실제 웹 검색 기반 오늘의 AI 리서치 브리핑 생성 (Claude API)
    if (url.pathname === "/api/ai-brief") {
      if (request.method !== "POST") return new Response("POST only", { status: 405 });
      const result = await generateAiBrief(env);
      return Response.json(result, { status: result.ok ? 200 : 502 });
    }

    // 종목 리포트 조회 — 토스증권·DART 프록시(SGS Connector)를 직접 호출한다 (LLM 비용 없음)
    if (url.pathname === "/api/stock-brief") {
      const symbol = url.searchParams.get("symbol") ?? "";
      const year = url.searchParams.get("year") ?? String(new Date().getFullYear() - 1);
      if (!/^[0-9]{6}$/.test(symbol)) {
        return Response.json({ error: "종목코드는 숫자 6자리여야 해요 (예: 005930)" }, { status: 400 });
      }
      if (!/^[0-9]{4}$/.test(year)) {
        return Response.json({ error: "사업연도는 숫자 4자리여야 해요 (예: 2025)" }, { status: 400 });
      }
      const result = await getStockBrief(env, symbol, year);
      return Response.json(result);
    }

    // 관심종목 분석 — 실제 재무 데이터 + Claude 웹 검색으로 저평가·테마 종합 결론 (버튼 눌렀을 때만)
    if (url.pathname === "/api/watchlist-analysis") {
      if (request.method !== "POST") return new Response("POST only", { status: 405 });
      const year = url.searchParams.get("year") ?? String(new Date().getFullYear() - 1);
      if (!/^[0-9]{4}$/.test(year)) {
        return Response.json({ error: "사업연도는 숫자 4자리여야 해요 (예: 2025)" }, { status: 400 });
      }
      const result = await analyzeWatchlist(env, WATCHLIST, year);
      return Response.json(result, { status: result.ok ? 200 : 502 });
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
