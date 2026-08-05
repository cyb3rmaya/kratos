# KRATOS — 웹 개발 · 매크로 자동화 · 게임 개발 스튜디오 홈페이지

빌드 도구 없는 정적 사이트입니다. 압축을 풀고 `index.html`을 열면 바로 확인할 수 있습니다.

**배포된 미리보기** — https://claude.ai/code/artifact/df9494f1-08d3-4baf-925e-587717b0031d

```
site/
├── index.html              메인 페이지
├── build.mjs               배포용 단일 파일 생성기 (선택)
├── assets/
│   ├── css/style.css       디자인 토큰 + 전체 스타일
│   ├── fonts/              *.woff2 — build.mjs 가 내장할 때만 씁니다
│   └── js/
│       ├── data.js         ★ 내용은 전부 여기서 수정
│       ├── live-screen.js  히어로 라이브 스크린 (시그니처)
│       └── main.js         렌더링 + 화면 목업 SVG 생성
├── demo/                   실제로 동작하는 데모 5종
│   ├── shop/               쇼핑몰 (옵션·장바구니·배송비·결제 흐름)
│   ├── blog/               블로그 (검색·태그·상세·구독·다크모드)
│   ├── booking/            예약 (달력·시간대·3단계 폼·확정)
│   ├── game/               웹게임 (캔버스·랭킹·쿠폰 발급)
│   └── macro/              업무 자동화 콘솔 (실행 로그·진행률·실패 처리)
└── dist/                   build.mjs 실행 시 생성 (git 에 올릴 필요 없음)
```

현재 담긴 내용: 작업물 **21건**(웹 10 · 매크로 6 · 게임 5), 기능 항목 105개, 주차별 진행 단계 99개.

---

## 1. 가장 먼저 할 일

`assets/js/data.js` 맨 위 `CONFIG` 블록만 채우면 로고·연락처·푸터가 한 번에 바뀝니다.

```js
const CONFIG = {
  brandEn: "KRATOS",
  brandKo: "크라토스",
  owner: "OOO",              // 대표자명
  phone: "010-0000-0000",
  phoneHref: "tel:01000000000",
  email: "hello@example.com",
  kakao: "https://pf.kakao.com/_xxxxxx",
  address: "서울특별시 OO구 OO로 00, 0층",
  bizNo: "000-00-00000",
  mailOrderNo: "제0000-서울OO-0000호",
  hours: "평일 10:00 – 19:00 (주말·공휴일 휴무)",
  founded: 2019,             // 히어로의 'N년차'가 자동 계산됩니다
  sampleNotice: true,        // ★ 아래 설명 참고
};
```

### `sampleNotice` 를 반드시 확인하세요

지금 들어있는 작업물·수치·후기는 **화면 확인용 예시 데이터**입니다.
`true` 인 동안 작업 목록 위에 노란 안내 박스가 뜹니다.

실제 프로젝트로 전부 교체한 뒤 `false` 로 바꾸면 안내가 사라집니다.
**교체 전에 공개하지 마세요.** 근거 없는 실적·후기 표기는 표시광고법상 문제가 될 수 있습니다.

같은 파일에서 이어서 수정할 항목:

| 상수 | 내용 |
|---|---|
| `PILLARS` | 3대 분야 카드 (웹 / 매크로 / 게임). `count` 는 실제 작업 건수와 맞추세요 |
| `STATS` | 통계 카운터 4개 |
| `PROJECTS` | 포트폴리오 ★ |
| `STACK` | 기술 스택 섹션 |
| `PLANS` | 요금제 4종 |
| `QUOTES` | 고객 후기 |
| `FAQS` | 자주 묻는 질문 |

---

## 2. 포트폴리오 추가하기

`PROJECTS` 배열에 객체를 하나 넣으면 카드와 케이스 스터디가 자동으로 생깁니다.

```js
{
  id: "w11",                 // 겹치지 않는 값
  domain: "web",             // web | macro | game   → 분야 색·필터가 결정됩니다
  cat: "shop",               // shop | site | blog | app | macro | game  → 썸네일 그림
  catLabel: "쇼핑몰",         // 카드에 표시될 분류명
  code: "2026-01 / SHOP",
  featured: false,           // true 면 상단 '대표 작업'에 크게 노출 (분야당 1건 권장)
  title: "프로젝트 이름",
  desc: "한 줄 설명",
  tags: ["Next.js", "결제연동"],
  result: "성과 한 줄",
  demo: "demo/shop/",        // 데모 경로 또는 null
  facts: { 기간: "6주", 역할: "기획·개발", 규모: "1인", 상태: "운영 중" },

  // ↓ 케이스 스터디 5개 탭의 내용
  problem:  "무엇이 문제였는지",                     // [개요] 탭
  solution: "어떻게 풀었는지",                       // [개요] 탭
  body:     "상세 설명.\n\n문단은 빈 줄 두 개로 나눕니다.",
  learned:  "이 프로젝트에서 배운 것",

  screens: [                                        // [화면] 탭 — 생략하면 cat 기준 자동
    { kind: "web-list",  cap: "상품 목록" },
    { kind: "web-admin", cap: "관리자" },
  ],
  features: [                                       // [기능] 탭
    { t: "기능 이름", d: "한 줄 설명" },
  ],
  stack: {                                          // [기술] 탭
    "프론트엔드": ["Next.js", "TypeScript"],
    "백엔드": ["Node.js"],
  },
  metrics: [                                        // [기술] 탭 하단 + 대표 작업 카드
    { v: "4,200", u: "만 원", l: "월 거래액" },      // featured 는 정확히 3개
  ],
  timeline: [                                       // [과정] 탭
    { w: "1주차", t: "기획", d: "무엇을 했는지" },
  ],
}
```

### 화면 목업(`screens[].kind`) 종류

썸네일과 케이스 스터디의 화면 이미지는 **코드로 그리는 SVG**입니다. 이미지 파일이 하나도 없습니다.

| kind | 그려지는 화면 |
|---|---|
| `shop-grid` | 상품 그리드 + 장바구니 바 |
| `web-list` | 목록·필터형 페이지 |
| `web-detail` | 상세 페이지 (히어로 + 사이드 카드) |
| `web-admin` | 관리자 (사이드바 + 지표 + 차트 + 표) |
| `blog-list` | 블로그 목록 + 멤버십 사이드 |
| `mobile-app` | 모바일 앱 화면 (폰 프레임) |
| `macro-console` | 자동화 실행 콘솔 (로그 + 진행률) |
| `macro-flow` | 처리 흐름 다이어그램 |
| `macro-report` | 절감 리포트 (그래프) |
| `game-play` | 게임 플레이 화면 |
| `game-rank` | 랭킹 보드 |

실제 스크린샷을 쓰고 싶으면 `main.js`의 `sceneURI()` 호출 부분을 이미지 경로로 바꾸면 됩니다.

---

## 3. 데이터가 맞는지 확인하기

필드 하나만 빠져도 케이스 스터디가 깨집니다. 수정 후 검증하세요.

```bash
node build.mjs      # 빌드가 되면 데이터 구조에 큰 문제는 없습니다
```

브라우저 개발자 도구 콘솔에 오류가 없는지도 확인하세요.
`featured: true` 인 프로젝트는 `metrics` 가 **정확히 3개**여야 레이아웃이 맞습니다.

---

## 4. 문의 폼 연결

기본값은 방문자의 메일 앱을 여는 방식입니다. 서버 없이 바로 받고 싶다면:

1. [Formspree](https://formspree.io) 무료 가입 → 폼 엔드포인트 발급
2. `main.js`의 `form()` 함수에서 `window.location.href = ...` 부분을 아래로 교체

```js
await fetch("https://formspree.io/f/발급받은코드", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(Object.fromEntries(d)),
});
status.textContent = "문의가 접수되었습니다. 24시간 안에 답변드리겠습니다.";
f.reset();
```

---

## 5. 배포

### 일반 웹호스팅 — `site` 폴더를 그대로 올립니다

| 방법 | 절차 |
|---|---|
| **Netlify** (가장 쉬움) | app.netlify.com 접속 → `site` 폴더를 드래그앤드롭 |
| **Vercel** | GitHub에 올린 뒤 import, 빌드 설정 없이 그대로 배포 |
| **GitHub Pages** | 저장소 push → Settings → Pages → 브랜치 지정 |
| **가비아·카페24 웹호스팅** | FTP로 폴더 전체 업로드 |

`dist/` 와 `assets/fonts/` 는 올리지 않아도 됩니다. 도메인은 가비아·후이즈에서
구입 후 DNS만 연결하면 되고, Netlify·Vercel은 SSL이 자동입니다.

### 단일 파일이 필요할 때 — `node build.mjs`

```
dist/index.html      어디서든 열리는 완전 독립 파일 (3.8MB)
dist/artifact.html   Claude Artifact 업로드용 (골격 태그 제외)
```

CSS·JS·폰트 7종·데모 5종이 전부 한 파일에 들어가며 **외부 요청이 0건**입니다.
CDN이 막힌 사내망, CSP가 엄격한 호스팅, 이메일 첨부나 USB 전달에 쓰세요.
데모는 링크 대신 화면 안에서 오버레이로 열립니다.

---

## 6. 디자인 토큰

색과 폰트를 바꾸려면 `style.css` 맨 위 `:root` 블록만 수정하세요.

```css
--bg: #0e1017;        /* 페이지 배경 */
--surface: #161a24;   /* 카드 면 */
--cobalt: #4c6fff;    /* 주 액센트 (CTA·링크) — UI 액센트는 이 색 하나뿐 */
--amber: #ffb020;     /* 숫자 강조 */
```

### 분야 식별 색

UI 액센트(코발트)와 **별개로 분류 표시에만** 쓰는 색입니다.
`main.js` 상단 `DOMAIN_COLOR` 에서 바꿉니다.

| 분야 | 색 | 쓰이는 곳 |
|---|---|---|
| 웹 개발 | `#4c6fff` 코발트 | 카드 테두리·지표 숫자·필터 |
| 매크로 · 자동화 | `#22d3a6` 민트 | 〃 |
| 게임 개발 | `#ffb020` 앰버 | 〃 |

폰트는 Paperlogy(제목) + Pretendard(본문) + JetBrains Mono(숫자·코드) 조합이며
평소에는 CDN에서 불러옵니다. `assets/fonts/`의 파일은 `build.mjs`가 단일 파일을
만들 때만 사용합니다.

---

## 7. 확인된 사항

- 반응형: 1440 / 1080 / 900 / 620 / 375px 대응
- 키보드 포커스 표시, 스킵 링크, ARIA 속성, 탭 방향키 이동
- `prefers-reduced-motion` 존중 (애니메이션·로그 스트리밍 자동 비활성)
- 외부 이미지 파일 0개 — 썸네일·화면 목업·아이콘은 전부 코드로 생성
- 다크 단일 테마 (스튜디오 브랜드 톤에 맞춘 의도적 선택)
