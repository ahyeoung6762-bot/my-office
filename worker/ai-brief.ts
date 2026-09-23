/**
 * Claude API로 오늘의 실제 증시 뉴스를 검색해 부서별 리서치 브리핑을 생성한다.
 *
 * 비밀값은 코드에 두지 않는다. 로컬은 `.dev.vars`, 배포는 `wrangler secret put`.
 *   ANTHROPIC_API_KEY   Anthropic 콘솔(console.anthropic.com)에서 발급한 API 키 (sk-ant-…)
 */

export type AiBriefEnv = { ANTHROPIC_API_KEY?: string };

export type AiBriefSection = { dept: string; title: string; body: string };

export type AiBriefResult = {
  ok: boolean;
  generatedAt: string;
  sections: AiBriefSection[];
  error?: string;
};

const ANTHROPIC_VERSION = "2023-06-01";
const MODEL = "claude-opus-5";

/** 실제 시황 데이터가 의미 있는 5개 팀만 대상으로 한다 */
const SECTIONS = [
  { dept: "research", label: "시황조사팀 — 오늘의 시황 요약 (코스피·코스닥·미국 증시)" },
  { dept: "brand", label: "종목분석팀 — 오늘 주목할 종목 1~2개와 이유" },
  { dept: "strategy1", label: "투자전략 1팀 — 오늘 시장에서 나온 투자 아이디어·워치리스트 관점" },
  { dept: "reels", label: "차트분석팀 — 주요 지수·업종의 기술적 관점 코멘트" },
  { dept: "review", label: "성과평가팀 — 오늘 시장에서 얻을 수 있는 교훈 한 줄" },
] as const;

function buildPrompt(): string {
  const sectionList = SECTIONS.map((s, i) => `${i + 1}. dept="${s.dept}" — ${s.label}`).join("\n");
  return [
    "당신은 한국 개인 투자자를 위한 증권 리서치 조직의 AI 애널리스트 팀입니다.",
    "웹 검색으로 오늘 실제로 있었던 국내외 증시 뉴스(코스피·코스닥 마감, 미국 증시, 주요 이슈)를 확인하고,",
    "아래 5개 팀의 관점으로 각각 3~5문장씩 한국어로 정리하세요.",
    "",
    sectionList,
    "",
    "규칙:",
    "- 웹 검색으로 확인되지 않은 수치나 출처 없는 단정은 쓰지 마세요.",
    "- 특정 종목의 매수·매도를 권유하는 표현은 쓰지 말고, 사실과 관찰 위주로 쓰세요.",
    "- 이 브리핑은 투자 자문이 아니라는 점을 전제로, 담백한 사실 요약 톤을 유지하세요.",
    "- 검색을 마친 뒤, 마지막 응답은 반드시 아래 형식의 JSON만 출력하세요. JSON 앞뒤에 다른 설명 문장을 절대 쓰지 마세요.",
    "",
    '<<<JSON>>>{"sections":[{"dept":"research","title":"...","body":"..."},{"dept":"brand","title":"...","body":"..."},{"dept":"strategy1","title":"...","body":"..."},{"dept":"reels","title":"...","body":"..."},{"dept":"review","title":"...","body":"..."}]}<<<END>>>',
  ].join("\n");
}

function extractSections(text: string): AiBriefSection[] | null {
  const match = text.match(/<<<JSON>>>([\s\S]*?)<<<END>>>/);
  const raw = (match ? match[1] : text).trim();
  try {
    const parsed = JSON.parse(raw) as { sections?: unknown };
    if (!Array.isArray(parsed.sections)) return null;
    const sections = parsed.sections.filter(
      (s): s is AiBriefSection =>
        Boolean(s) && typeof (s as AiBriefSection).dept === "string" && typeof (s as AiBriefSection).body === "string",
    );
    return sections.length > 0 ? sections : null;
  } catch {
    return null;
  }
}

export async function generateAiBrief(env: AiBriefEnv): Promise<AiBriefResult> {
  const generatedAt = new Date().toISOString();

  if (!env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      generatedAt,
      sections: [],
      error: "ANTHROPIC_API_KEY 미설정 — .dev.vars에 키를 추가하고 서버를 다시 시작하세요.",
    };
  }

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
        messages: [{ role: "user", content: buildPrompt() }],
      }),
    });
  } catch (error) {
    return { ok: false, generatedAt, sections: [], error: `Claude API 요청 실패: ${String(error)}` };
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    return {
      ok: false,
      generatedAt,
      sections: [],
      error: `Claude API 오류 (HTTP ${response.status}) ${detail.slice(0, 300)}`,
    };
  }

  const json = (await response.json()) as { content?: { type: string; text?: string }[] };
  const text = (json.content ?? [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text)
    .join("\n");

  const sections = extractSections(text);
  if (!sections) {
    return { ok: false, generatedAt, sections: [], error: "응답을 해석하지 못했어요. 잠시 후 다시 시도해주세요." };
  }

  return { ok: true, generatedAt, sections };
}
