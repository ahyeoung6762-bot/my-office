// ============================================================
//  나의 AI 회사 설정 — 여기 한 파일만 고치면 됩니다
// ============================================================
//  회사 이름, 부서 이름, 직원 이름·성격·머리색까지 전부 여기 있어요.
//  다른 파일은 건드리지 않아도 됩니다.
//
//  ⚠️ 딱 2가지 규칙
//   1. 부서 id(research, brand, ...)는 절대 바꾸지 마세요. 시뮬레이션 엔진이
//      이 id로 움직입니다. 바꾸면 캐릭터가 길을 잃어요.
//      → 바꿔도 되는 건 name(부서 이름) · icon · short 입니다.
//   2. 부서는 12개를 유지하세요. 사무실 배치가 4열 3행 = 12칸 고정입니다.
//      안 쓰는 부서는 지우지 말고 이름만 바꿔서 쓰세요.
//
//  직원 수는 자유롭게 늘리고 줄여도 됩니다. 한 팀에 팀장(lead) 1명은 두세요.
// ============================================================

/** 회사 기본 정보 */
export const COMPANY = {
  /** 좌측 상단 헤더에 뜨는 회사 이름 */
  name: "나의 AI OFFICE",
  /** 헤더 로고 배지에 들어갈 글자 1개 (이모지도 됩니다) */
  logoLetter: "나",
  /** 화면 상단 큰 제목 (앞부분) */
  titlePrefix: "나의",
  /** 화면 상단 큰 제목 (강조되는 뒷부분) */
  titleAccent: "AI OFFICE",
  /** 브라우저 탭 제목 */
  pageTitle: "나의 AI OFFICE — 주식증권 애널리스트 오피스",
  /** 검색·공유될 때 뜨는 설명 */
  description: "12개 AI 애널리스트 팀이 시황조사·종목분석·리포트·성과평가까지 돌아가는 1인 애널리스트용 AI 오피스",
  /** 창 하단 파일명 느낌의 라벨 */
  windowLabel: "my_ai_office.exe — 대표실",
  /** 일일 브리핑 제목에 들어갈 이름 */
  reportName: "나의 AI OFFICE",
} as const;

/** 대표(나) — 사무실 대표실에 앉아 있는 캐릭터 */
export const CEO_PROFILE = {
  name: "대표",
  callsign: "대표님",
  role: "대표 · 최종 투자 의사결정",
  hair: "#42283a",
  shirt: "#ff8fc0",
  accent: "#fff3b0",
  skin: "#ffdcc4",
  thoughts: [
    "AI는 분석 비서, 최종 매수·매도 판단은 내가 해요.",
    "오늘 확인할 종목은 딱 3개만 추리자.",
    "근거 없는 숫자는 리포트에 올리지 않는다.",
  ],
};

/**
 * 부서 12개.
 * id = 고정(엔진용) / name·short·icon = 자유롭게 변경
 * task = 오늘 하는 일 / report = 팀장 한줄보고
 */
export const DEPARTMENTS = [
  {
    id: "research",
    name: "시황조사팀",
    short: "market.watch",
    icon: "🔎",
    task: "국내외 증시·거시 뉴스 수집",
    report: "출처를 검증하고 오늘의 주요 이슈를 정리해요.",
  },
  {
    id: "brand",
    name: "종목분석팀",
    short: "stock.lab",
    icon: "🧬",
    task: "관심 종목 펀더멘털 점검",
    report: "재무 데이터가 연동되면 수치까지 붙습니다.",
  },
  {
    id: "strategy1",
    name: "투자전략 1팀",
    short: "idea.desk",
    icon: "💡",
    task: "오늘의 투자 아이디어 10개",
    report: "리스크·기대수익 기준으로 TOP 3까지 좁혀요.",
  },
  {
    id: "qa",
    name: "리스크검수팀",
    short: "risk.check",
    icon: "🛡️",
    task: "근거·중복·과장 표현 검사",
    report: "기준에서 벗어난 리포트는 되돌려보내요.",
  },
  {
    id: "strategy2",
    name: "투자전략 2팀",
    short: "report.team",
    icon: "✍️",
    task: "승인된 아이디어 리포트 작성",
    report: "대표가 고른 종목만 글로 옮겨요.",
  },
  {
    id: "reels",
    name: "차트분석팀",
    short: "chart.view",
    icon: "📉",
    task: "기술적 지표·캔들 패턴 분석",
    report: "원본 데이터는 보존하고 해석만 새로 붙여요.",
  },
  {
    id: "carousel",
    name: "리포트디자인팀",
    short: "design.desk",
    icon: "🖼️",
    task: "차트·표 시각자료 제작",
    report: "필요한 자료만 만들고 결론으로 닫아요.",
  },
  {
    id: "partner",
    name: "IR커뮤니케이션팀",
    short: "ir.mail",
    icon: "💌",
    task: "기업 IR·문의 검토·답장 초안",
    report: "초안까지만 씁니다. 발송은 대표가 해요.",
  },
  {
    id: "finance",
    name: "재무분석팀",
    short: "finance.xls",
    icon: "🧾",
    task: "재무제표·실적 현황 정리",
    report: "현황 파일이 오면 바로 정리합니다.",
  },
  {
    id: "review",
    name: "성과평가팀",
    short: "review.data",
    icon: "📈",
    task: "투자 성과·매매 기록 리뷰",
    report: "잘된 판단을 패턴으로 남겨요.",
  },
  {
    id: "ops",
    name: "데이터운영팀",
    short: "automation.ops",
    icon: "⚙️",
    task: "데이터 연동·실패·재시도 관리",
    report: "실패하면 재시도하고 로그를 남겨요.",
  },
  {
    id: "secretary",
    name: "리서치센터장실",
    short: "research.hq",
    icon: "📋",
    task: "전사 한줄보고·최종 브리핑",
    report: "모든 팀 상태를 모아 결정할 것만 남겨드려요.",
  },
] as const;

/**
 * 직원 명단.
 * dept = 위 부서 id / rank: "lead"(팀장) 또는 "member"(팀원)
 * colors = [머리색, 옷색, 포인트색]
 * thoughts = 자리를 비웠을 때 머리 위에 뜨는 혼잣말
 */
export type StaffEntry = {
  dept: string;
  rank: "lead" | "member";
  name: string;
  role: string;
  colors: [string, string, string];
  thoughts: string[];
  callsign?: string;
};

export const STAFF_LIST: StaffEntry[] = [
  // ① 시황조사팀
  { dept: "research", rank: "lead", name: "김서연", role: "시황조사 팀장", callsign: "김마켓",
    colors: ["#6b3d34", "#fff3b0", "#ff8fc0"],
    thoughts: ["이 뉴스, 1차 공시자료 확인했나?", "발표 후 7일 지난 이슈는 후보에서 빼자.", "원문 공시부터 다시 본다."] },
  { dept: "research", rank: "member", name: "오태윤", role: "매크로 리서처",
    colors: ["#2f2a3d", "#c9b8ff", "#b8f0dd"],
    thoughts: ["금리 발표 전엔 포지션 언급 자제.", "국내 증시에 영향 있는 이슈인지 체크."] },
  { dept: "research", rank: "member", name: "하은채", role: "섹터 동향 조사",
    colors: ["#8a4a3c", "#b8f0dd", "#ff8fc0"],
    thoughts: ["이번 주 수급 몰린 섹터가 어디지?", "재탕 기사는 원문으로 안 쳐요."] },

  // ② 종목분석팀
  { dept: "brand", rank: "lead", name: "박보라", role: "종목분석 팀장", callsign: "박밸류",
    colors: ["#372b4a", "#c9b8ff", "#c9b8ff"],
    thoughts: ["재무 데이터 연동 전엔 숫자를 지어내지 않아요.", "밸류에이션 벗어난 종목인지 본다."] },
  { dept: "brand", rank: "member", name: "신재원", role: "재무지표 분석",
    colors: ["#3c3a4f", "#ffe6f2", "#c9b8ff"],
    thoughts: ["영업이익률이 매출보다 중요해요.", "최근 4분기 흐름부터 그려보자."] },
  { dept: "brand", rank: "member", name: "임다혜", role: "펀더멘털 검증",
    colors: ["#5a3450", "#fff3b0", "#ff8fc0"],
    thoughts: ["우리가 걸러내기로 한 리스크 요인이에요.", "실적 가이던스 흐려지면 다시 잡아요."] },

  // ③ 투자전략 1팀
  { dept: "strategy1", rank: "lead", name: "최아름", role: "투자전략 1팀장", callsign: "최아이디어",
    colors: ["#c26e4b", "#ff8fc0", "#fff3b0"],
    thoughts: ["오늘도 정확히 10개, 예외 없어요.", "리스크 점수부터 채우고 시작.", "테마가 겹치면 관점을 바꾼다."] },
  { dept: "strategy1", rank: "member", name: "정유진", role: "종목 발굴",
    colors: ["#7b4a2f", "#b8f0dd", "#ff8fc0"],
    thoughts: ["진입 근거를 좀 더 구체적으로 바꿔볼까.", "목표가 없는 아이디어는 미완성이다."] },
  { dept: "strategy1", rank: "member", name: "배시현", role: "투자포인트 요약",
    colors: ["#2c2638", "#fff3b0", "#c9b8ff"],
    thoughts: ["한 줄 요약이 안 되면 다시 써요.", "단정형으로 닫자, 애매한 표현 금지."] },

  // ④ 리스크검수팀
  { dept: "qa", rank: "lead", name: "윤규아", role: "리스크검수 팀장", callsign: "윤리스크",
    colors: ["#2d4b46", "#b8f0dd", "#b8f0dd"],
    thoughts: ["과장 표현 스캔 돌립니다.", "근거 공시 없는 리포트는 반려예요."] },
  { dept: "qa", rank: "member", name: "강태오", role: "중복·근거 검사",
    colors: ["#463227", "#ffe6f2", "#b8f0dd"],
    thoughts: ["최근 7일 안에 40% 겹쳤네.", "실제 공시 확인됐는지부터 체크."] },
  { dept: "qa", rank: "member", name: "문세라", role: "표현 검수",
    colors: ["#6c3a55", "#c9b8ff", "#fff3b0"],
    thoughts: ["확정적 표현은 바로 빼요.", "리서치 톤 유지하는지 본다."] },

  // ⑤ 투자전략 2팀
  { dept: "strategy2", rank: "lead", name: "한도빈", role: "리포트 팀장", callsign: "한리포트",
    colors: ["#8b534a", "#fff3b0", "#ff8fc0"],
    thoughts: ["승인된 아이디어만 리포트로 씁니다.", "결론은 하나로 닫아야 해요."] },
  { dept: "strategy2", rank: "member", name: "조민서", role: "종목 리포트 작성",
    colors: ["#33304a", "#ff8fc0", "#b8f0dd"],
    thoughts: ["투자포인트부터 잡고 들어간다.", "한 페이지 안에 끝나야 해요."] },
  { dept: "strategy2", rank: "member", name: "백가온", role: "요약 리포트",
    colors: ["#5d3a2c", "#b8f0dd", "#c9b8ff"],
    thoughts: ["리스크 요인은 마지막에 다시 정리합니다.", "마지막 줄은 체크포인트로."] },

  // ⑥ 차트분석팀
  { dept: "reels", rank: "lead", name: "송리원", role: "차트분석 팀장", callsign: "송차트",
    colors: ["#2c2638", "#ff8fc0", "#ff8fc0"],
    thoughts: ["원본 데이터는 절대 안 건드려요.", "이평선 이탈부터 체크하고 시작."] },
  { dept: "reels", rank: "member", name: "권지호", role: "기술적 지표 분석",
    colors: ["#4a3a2a", "#fff3b0", "#b8f0dd"],
    thoughts: ["거래량 안 붙는 돌파는 의심.", "지지선 재확인은 대표가 직접 봐요."] },
  { dept: "reels", rank: "member", name: "유세아", role: "패턴·시그널 정리",
    colors: ["#7a3f58", "#c9b8ff", "#ff8fc0"],
    thoughts: ["패턴 후보 5개 뽑아둘게요.", "확정 안 된 신호는 표시 안 합니다."] },

  // ⑦ 리포트디자인팀
  { dept: "carousel", rank: "lead", name: "이가림", role: "리포트디자인 팀장", callsign: "이차트",
    colors: ["#d88d68", "#c9b8ff", "#c9b8ff"],
    thoughts: ["원본 템플릿은 복제만, 수정 금지.", "필요한 표·그래프만 뽑아요."] },
  { dept: "carousel", rank: "member", name: "남주하", role: "레이아웃",
    colors: ["#3a2f4d", "#ffe6f2", "#ff8fc0"],
    thoughts: ["수치 밀도 맞추는 중.", "표지 요약부터 만들자."] },
  { dept: "carousel", rank: "member", name: "표하늘", role: "데이터 시각화",
    colors: ["#274a44", "#fff3b0", "#b8f0dd"],
    thoughts: ["결론 그래프 빠지면 반려예요.", "복제본에만 손댑니다."] },

  // ⑧ IR커뮤니케이션팀
  { dept: "partner", rank: "lead", name: "정파랑", role: "IR팀장", callsign: "정아이알",
    colors: ["#563a32", "#b8f0dd", "#b8f0dd"],
    thoughts: ["메일 연동 전이라 아직 못 읽어요.", "실제 발송은 대표 손으로."] },
  { dept: "partner", rank: "member", name: "구예성", role: "기업 문의 검토",
    colors: ["#452d3f", "#c9b8ff", "#fff3b0"],
    thoughts: ["신뢰할 수 있는 채널 문의만 받습니다.", "답장 초안까지만 준비해둘게요."] },

  // ⑨ 재무분석팀
  { dept: "finance", rank: "lead", name: "오재민", role: "재무분석 팀장", callsign: "오재무",
    colors: ["#313b56", "#fff3b0", "#fff3b0"],
    thoughts: ["실적 파일이 오면 바로 정리합니다.", "컨센서스 대비 괴리부터 확인해요."] },
  { dept: "finance", rank: "member", name: "심우진", role: "재무제표 정리",
    colors: ["#4b3b2c", "#b8f0dd", "#c9b8ff"],
    thoughts: ["어닝쇼크 건은 따로 표시해둡니다.", "추정치는 자동으로 안 넣어요."] },

  // ⑩ 성과평가팀
  { dept: "review", rank: "lead", name: "강성아", role: "성과평가 팀장", callsign: "강퍼포먼스",
    colors: ["#9c5c72", "#ff8fc0", "#ff8fc0"],
    thoughts: ["맞은 판단을 패턴으로 남겨야 해요.", "수익률보다 근거가 진짜 지표입니다."] },
  { dept: "review", rank: "member", name: "마지훈", role: "수익률 집계",
    colors: ["#2e3a4a", "#ffe6f2", "#b8f0dd"],
    thoughts: ["종목별 수익률 다시 긁어옵니다.", "연동되면 자동화돼요."] },
  { dept: "review", rank: "member", name: "여름", role: "리뷰노트 정리",
    colors: ["#6b4a2f", "#c9b8ff", "#fff3b0"],
    thoughts: ["반복할 패턴 1개, 중단할 패턴 1개.", "다음 전략팀에 넘길 학습점 정리 중."] },

  // ⑪ 데이터운영팀
  { dept: "ops", rank: "lead", name: "안도현", role: "데이터운영 팀장", callsign: "안오토",
    colors: ["#3b3b49", "#b8f0dd", "#b8f0dd"],
    thoughts: ["시세 데이터 스케줄 정상입니다.", "실패하면 재시도하고 로그 남겨요."] },
  { dept: "ops", rank: "member", name: "천유나", role: "연동 모니터링",
    colors: ["#573049", "#fff3b0", "#ff8fc0"],
    thoughts: ["연결 안 된 데이터를 성공으로 안 씁니다.", "연동 대기 중이에요."] },

  // ⑫ 리서치센터장실
  { dept: "secretary", rank: "lead", name: "김세리", role: "비서실장", callsign: "김비서",
    colors: ["#7a453c", "#c9b8ff", "#c9b8ff"],
    thoughts: ["대표가 결정할 것만 추립니다.", "중복 설명은 다 지워요."] },
  { dept: "secretary", rank: "member", name: "홍보람", role: "브리핑 정리",
    colors: ["#334a3a", "#ffe6f2", "#fff3b0"],
    thoughts: ["팀별로 묶어서 올릴게요.", "막힌 건 먼저 보고해요."] },
];

/**
 * 외부 연동을 아직 안 붙인 팀 → 화면에 "연동 대기"로 표시됩니다.
 * 연동을 다 붙였거나, 그냥 전부 초록불로 보고 싶으면 빈 배열 []로 두세요.
 */
export const PENDING_INTEGRATIONS: Record<string, string> = {
  brand: "종목 재무데이터 연동",
  partner: "IR 메일 연동",
  finance: "재무제표 현황 파일",
};

/**
 * 결과 보관함 링크 (Notion 등). 비워두면 화면에서 링크 버튼이 숨겨집니다.
 * 예: "https://www.notion.so/내페이지주소"
 */
export const STORAGE_LINK = "";

/**
 * 대표님이 직접 정한 관심종목 리스트.
 * "관심종목 분석" 버튼을 누르면 이 종목들만 모아 실제 재무 데이터를 확인하고,
 * 저평가 신호가 있는지·요즘 뜨는 테마와 관련 있는지 Claude가 분석해서 요약해줍니다.
 *
 * ⚠️ 5~15개 정도가 적당해요. 너무 많으면 DART 조회가 오래 걸리고 Claude API 비용도 늘어납니다.
 * 종목코드는 6자리 숫자 (네이버·다음 금융에서 종목명 검색하면 확인 가능).
 */
export const WATCHLIST: { code: string; name: string }[] = [
  { code: "005930", name: "삼성전자" },
  { code: "000660", name: "SK하이닉스" },
  { code: "035420", name: "NAVER" },
];
