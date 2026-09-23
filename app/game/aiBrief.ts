// 실제 시황 검색 기반 AI 리서치 브리핑 → 서버(/api/ai-brief)에 요청한다
export type AiBriefSection = { dept: string; title: string; body: string };

export type AiBriefResult = {
  ok: boolean;
  generatedAt: string;
  sections: AiBriefSection[];
  error?: string;
};

export async function requestAiBrief(): Promise<AiBriefResult> {
  const response = await fetch("/api/ai-brief", { method: "POST" });
  const json = (await response.json().catch(() => null)) as AiBriefResult | null;
  if (!json) throw new Error(`브리핑 생성 실패 (HTTP ${response.status})`);
  return json;
}
