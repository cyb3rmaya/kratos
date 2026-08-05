/* ============================================================
   main.js — 렌더링 + 인터랙션

   화면 목업(썸네일·상세 스크린샷)은 전부 이 파일에서 SVG로 그립니다.
   외부 이미지 파일이 하나도 없습니다.
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* 분야별 식별 색 — UI 액센트(코발트)와 별개로 '분류'에만 씁니다 */
  const DOMAIN_COLOR = { web: "#4c6fff", macro: "#22d3a6", game: "#ffb020" };
  const DOMAIN_LABEL = { web: "웹 개발", macro: "매크로 · 자동화", game: "게임 개발" };

  /* ========================================================
     1. CONFIG 값 페이지에 주입
     ======================================================== */
  function applyConfig() {
    const year = new Date().getFullYear();
    const map = {
      brandEn: CONFIG.brandEn,
      brandKo: CONFIG.brandKo,
      owner: CONFIG.owner,
      phone: CONFIG.phone,
      email: CONFIG.email,
      address: CONFIG.address,
      bizNo: CONFIG.bizNo,
      mailOrderNo: CONFIG.mailOrderNo,
      hours: CONFIG.hours,
      years: year - CONFIG.founded,
      year: year,
    };
    $$("[data-cfg]").forEach((el) => {
      const k = el.dataset.cfg;
      if (map[k] !== undefined) el.textContent = map[k];
    });
    $$("[data-href-phone]").forEach((el) => (el.href = CONFIG.phoneHref));
    $$("[data-href-mail]").forEach((el) => (el.href = "mailto:" + CONFIG.email));
    $$("[data-href-kakao]").forEach((el) => (el.href = CONFIG.kakao));
    document.title = `${CONFIG.brandKo} — 웹 개발 · 매크로 자동화 · 게임 개발`;

    if (!CONFIG.sampleNotice) $$("[data-sample-notice]").forEach((el) => el.remove());
  }

  /* ========================================================
     2. 헤더 / 모바일 내비
     ======================================================== */
  function header() {
    const h = $(".header");
    const onScroll = () => h.classList.toggle("is-stuck", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = $(".burger");
    const menu = $(".mobile-nav");
    if (!burger) return;
    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
    $$("a", menu).forEach((a) =>
      a.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      })
    );
  }

  /* ========================================================
     3. 화면 목업 생성기 (SVG)
     ---------------------------------------------------------
     sceneSVG(kind, accent, seed) → SVG 문자열
     kind: shop-grid | web-list | web-detail | web-admin | blog-list
           mobile-app | macro-console | macro-flow | macro-report
           game-play | game-rank
     ======================================================== */
  const W = 640, H = 400;              // 목업 기준 크기
  const INK = "#14161a";               // 밝은 화면의 글자색
  const PAPER = "#ffffff";
  const LINE_L = "#e8eaf0";            // 밝은 화면 구분선
  const SOFT = "#f4f6fa";
  const MUTE = "#c9cfdb";

  /* 시드 기반 의사난수 — 같은 프로젝트는 항상 같은 그림 */
  const rnd = (seed) => (n) => (Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1 * 0.5 + 0.5;

  /* 창 크롬(상단 바) */
  function chrome(title, dark) {
    const bg = dark ? "#12151f" : "#f7f8fb";
    const bar = dark ? "#0b0d13" : "#ffffff";
    const dot = dark ? "#2f3546" : "#dfe3ec";
    const tx = dark ? "#5f6779" : "#a8b0c0";
    return `
      <rect x="0" y="0" width="${W}" height="34" fill="${bg}"/>
      <circle cx="20" cy="17" r="4.5" fill="${dot}"/>
      <circle cx="36" cy="17" r="4.5" fill="${dot}"/>
      <circle cx="52" cy="17" r="4.5" fill="${dot}"/>
      <rect x="70" y="8" width="240" height="18" rx="9" fill="${bar}"/>
      <text x="82" y="21" font-family="ui-monospace,monospace" font-size="10" fill="${tx}">${esc(title)}</text>`;
  }

  /* 막대(텍스트 자리표시) */
  const bar = (x, y, w, h, fill, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r == null ? h / 2 : r}" fill="${fill}"/>`;

  const SCENES = {
    /* ---------- 쇼핑몰: 상품 그리드 + 장바구니 ---------- */
    "shop-grid"(a, seed) {
      const r = rnd(seed);
      const cards = [0, 1, 2, 3, 4, 5].map((i) => {
        const x = 30 + (i % 3) * 196;
        const y = 118 + Math.floor(i / 3) * 130;
        const hue = [a, "#ffb877", "#7fd8a8", "#a894ff", "#ff9ec4", "#7aa8ff"][i];
        return `
          <rect x="${x}" y="${y}" width="172" height="112" rx="10" fill="${PAPER}" stroke="${LINE_L}"/>
          <rect x="${x + 1}" y="${y + 1}" width="170" height="58" rx="9" fill="${hue}" opacity="${0.28 + r(i) * 0.3}"/>
          ${i < 2 ? `<rect x="${x + 10}" y="${y + 10}" width="52" height="16" rx="4" fill="${a}"/>
                     <text x="${x + 17}" y="${y + 22}" font-size="9" font-family="sans-serif" fill="#fff" font-weight="700">예약판매</text>` : ""}
          ${bar(x + 12, y + 70, 78 + r(i) * 50, 7, "#cfd5e2")}
          ${bar(x + 12, y + 86, 56, 9, INK)}
          <rect x="${x + 118}" y="${y + 82}" width="42" height="18" rx="4" fill="${SOFT}"/>
          <text x="${x + 128}" y="${y + 95}" font-size="9" font-family="sans-serif" fill="#6b7385">담기</text>`;
      }).join("");
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="${PAPER}"/>
        <rect x="0" y="34" width="${W}" height="46" fill="${PAPER}"/>
        <line x1="0" y1="80" x2="${W}" y2="80" stroke="${LINE_L}"/>
        <text x="30" y="63" font-size="15" font-weight="800" font-family="sans-serif" fill="${INK}">제주감귤상회</text>
        ${["전체상품", "예약판매", "정기구독", "고객센터"].map((t, i) =>
          `<text x="${390 + i * 62}" y="${62}" font-size="10" font-family="sans-serif" fill="${i === 1 ? a : "#8b93a7"}" font-weight="${i === 1 ? 700 : 400}">${t}</text>`).join("")}
        <text x="30" y="105" font-size="11" font-family="sans-serif" fill="${a}" font-weight="700">11월 수확 예약판매 · 따는 날 바로 발송</text>
        ${cards}
        <rect x="0" y="${H - 46}" width="${W}" height="46" fill="${INK}"/>
        <text x="30" y="${H - 19}" font-size="12" font-family="sans-serif" fill="#fff" font-weight="700">장바구니 3개</text>
        <text x="126" y="${H - 19}" font-size="11" font-family="sans-serif" fill="#8b93a7">일반 2 · 예약 1 (출고일 분리)</text>
        <rect x="${W - 130}" y="${H - 34}" width="100" height="24" rx="5" fill="${a}"/>
        <text x="${W - 106}" y="${H - 18}" font-size="11" font-family="sans-serif" fill="#fff" font-weight="700">주문하기</text>`;
    },

    /* ---------- 목록형 페이지 ---------- */
    "web-list"(a, seed) {
      const r = rnd(seed);
      const rows = [0, 1, 2, 3].map((i) => {
        const y = 132 + i * 60;
        return `
          <rect x="30" y="${y}" width="${W - 60}" height="50" rx="8" fill="${PAPER}" stroke="${LINE_L}"/>
          <rect x="42" y="${y + 11}" width="28" height="28" rx="7" fill="${a}" opacity="${0.9 - i * 0.16}"/>
          ${bar(84, y + 14, 150 + r(i) * 90, 8, INK)}
          ${bar(84, y + 30, 110 + r(i + 3) * 120, 6, "#cfd5e2")}
          <rect x="${W - 108}" y="${y + 15}" width="66" height="20" rx="10" fill="${SOFT}"/>
          <text x="${W - 96}" y="${y + 29}" font-size="9" font-family="sans-serif" fill="#6b7385">자세히 →</text>`;
      }).join("");
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="${SOFT}"/>
        <rect x="0" y="34" width="${W}" height="46" fill="${PAPER}"/>
        <line x1="0" y1="80" x2="${W}" y2="80" stroke="${LINE_L}"/>
        ${bar(30, 52, 96, 11, INK)}
        ${[0, 1, 2, 3].map((i) => bar(400 + i * 56, 55, 40, 6, "#cfd5e2")).join("")}
        <text x="30" y="108" font-size="13" font-weight="800" font-family="sans-serif" fill="${INK}">업무분야</text>
        ${[0, 1, 2].map((i) => `<rect x="${330 + i * 96}" y="${94}" width="86" height="22" rx="11" fill="${i === 0 ? a : PAPER}" stroke="${i === 0 ? a : LINE_L}"/>`).join("")}
        ${rows}`;
    },

    /* ---------- 상세 페이지 ---------- */
    "web-detail"(a, seed) {
      const r = rnd(seed);
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="${PAPER}"/>
        <rect x="0" y="34" width="${W}" height="46" fill="${PAPER}"/>
        <line x1="0" y1="80" x2="${W}" y2="80" stroke="${LINE_L}"/>
        ${bar(30, 52, 88, 11, INK)}
        ${[0, 1, 2].map((i) => bar(430 + i * 58, 55, 42, 6, "#cfd5e2")).join("")}

        <rect x="0" y="80" width="${W}" height="130" fill="${SOFT}"/>
        <rect x="30" y="104" width="70" height="20" rx="4" fill="${a}"/>
        <text x="41" y="118" font-size="10" font-family="sans-serif" fill="#fff" font-weight="700">진행 중</text>
        ${bar(30, 136, 300, 16, INK, 4)}
        ${bar(30, 162, 230, 8, "#b9c0cf")}
        ${bar(30, 178, 180, 8, "#cfd5e2")}
        <rect x="${W - 220}" y="100" width="190" height="92" rx="10" fill="${PAPER}" stroke="${LINE_L}"/>
        <text x="${W - 204}" y="122" font-size="10" font-family="sans-serif" fill="#8b93a7">출고 예정일</text>
        <text x="${W - 204}" y="146" font-size="17" font-weight="800" font-family="sans-serif" fill="${INK}">11월 18일</text>
        <rect x="${W - 204}" y="158" width="158" height="22" rx="5" fill="${a}"/>
        <text x="${W - 168}" y="173" font-size="10" font-family="sans-serif" fill="#fff" font-weight="700">예약 주문하기</text>

        ${[0, 1, 2, 3, 4].map((i) => bar(30, 236 + i * 20, (i === 4 ? 220 : 380 + r(i) * 180), 8, i % 2 ? "#dde1ea" : "#cfd5e2")).join("")}
        ${[0, 1, 2].map((i) => `
          <rect x="${30 + i * 130}" y="${340}" width="118" height="42" rx="8" fill="${SOFT}"/>
          ${bar(42 + i * 130, 352, 44, 6, "#b9c0cf")}
          ${bar(42 + i * 130, 366, 66, 8, INK)}`).join("")}
        <rect x="${W - 200}" y="236" width="170" height="146" rx="10" fill="${a}" opacity=".1"/>
        <rect x="${W - 184}" y="252" width="36" height="36" rx="18" fill="${a}" opacity=".55"/>
        ${bar(W - 140, 262, 90, 8, "#b9c0cf")}
        ${bar(W - 140, 278, 60, 6, "#cfd5e2")}
        ${[0, 1, 2].map((i) => bar(W - 184, 306 + i * 18, 138 - i * 22, 6, "#cfd5e2")).join("")}`;
    },

    /* ---------- 관리자 / 대시보드 ---------- */
    "web-admin"(a, seed) {
      const r = rnd(seed);
      const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const h = 12 + r(i) * 58;
        return `<rect x="${316 + i * 25}" y="${196 - h}" width="14" height="${h}" rx="3" fill="${a}" opacity="${0.35 + r(i) * 0.6}"/>`;
      }).join("");
      const rows = [0, 1, 2, 3, 4].map((i) => {
        const y = 232 + i * 30;
        const st = [["처리 완료", "#22c55e"], ["대기", "#f59e0b"], ["처리 완료", "#22c55e"], ["실패", "#ef4444"], ["처리 완료", "#22c55e"]][i];
        return `
          <line x1="196" y1="${y + 24}" x2="${W - 24}" y2="${y + 24}" stroke="${LINE_L}"/>
          ${bar(212, y + 8, 60, 7, "#b9c0cf")}
          ${bar(300, y + 8, 96 + r(i) * 60, 7, INK)}
          ${bar(456, y + 8, 44, 7, "#cfd5e2")}
          <rect x="${W - 108}" y="${y + 2}" width="70" height="19" rx="9.5" fill="${st[1]}" opacity=".14"/>
          <text x="${W - 98}" y="${y + 15}" font-size="9" font-family="sans-serif" fill="${st[1]}" font-weight="700">${st[0]}</text>`;
      }).join("");
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="${SOFT}"/>
        <rect x="0" y="34" width="180" height="${H - 34}" fill="#12151f"/>
        <rect x="20" y="54" width="22" height="22" rx="6" fill="${a}"/>
        ${bar(50, 61, 70, 9, "#3a4257")}
        ${["대시보드", "주문 관리", "상품", "회원", "통계", "설정"].map((t, i) => `
          ${i === 1 ? `<rect x="12" y="${100 + i * 34 - 12}" width="156" height="30" rx="7" fill="${a}" opacity=".18"/>` : ""}
          <rect x="24" y="${100 + i * 34 - 5}" width="12" height="12" rx="3" fill="${i === 1 ? a : "#3a4257"}"/>
          <text x="46" y="${100 + i * 34 + 5}" font-size="11" font-family="sans-serif" fill="${i === 1 ? "#edeff5" : "#6b7385"}">${t}</text>`).join("")}

        ${[["오늘 주문", "184"], ["처리 대기", "12"], ["매출", "4,200만"]].map((c, i) => `
          <rect x="${196 + i * 148}" y="54" width="134" height="62" rx="9" fill="${PAPER}" stroke="${LINE_L}"/>
          <text x="${210 + i * 148}" y="76" font-size="9.5" font-family="sans-serif" fill="#8b93a7">${c[0]}</text>
          <text x="${210 + i * 148}" y="100" font-size="18" font-weight="800" font-family="sans-serif" fill="${INK}">${c[1]}</text>`).join("")}

        <rect x="196" y="128" width="${W - 220}" height="84" rx="9" fill="${PAPER}" stroke="${LINE_L}"/>
        <text x="212" y="150" font-size="10" font-family="sans-serif" fill="#8b93a7">최근 12일 처리량</text>
        ${bars}
        <rect x="196" y="224" width="${W - 220}" height="${H - 240}" rx="9" fill="${PAPER}" stroke="${LINE_L}"/>
        ${rows}`;
    },

    /* ---------- 블로그 리스트 ---------- */
    "blog-list"(a, seed) {
      const r = rnd(seed);
      const posts = [0, 1, 2, 3].map((i) => {
        const y = 140 + i * 62;
        const hue = [a, "#ff9ec4", "#7fd8a8", "#a894ff"][i];
        return `
          <line x1="30" y1="${y + 54}" x2="${W - 190}" y2="${y + 54}" stroke="${LINE_L}"/>
          <rect x="30" y="${y}" width="62" height="46" rx="7" fill="${hue}" opacity=".55"/>
          ${bar(106, y + 6, 230 + r(i) * 90, 9, INK)}
          ${bar(106, y + 24, 170 + r(i + 2) * 100, 6, "#cfd5e2")}
          ${bar(106, y + 38, 84, 5, "#dde1ea")}`;
      }).join("");
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="${PAPER}"/>
        <line x1="0" y1="80" x2="${W}" y2="80" stroke="${LINE_L}"/>
        <text x="30" y="63" font-size="15" font-weight="800" font-family="sans-serif" fill="${INK}">만드는 기록</text>
        <rect x="${W - 108}" y="46" width="78" height="22" rx="5" fill="${INK}"/>
        <text x="${W - 90}" y="61" font-size="10" font-family="sans-serif" fill="#fff" font-weight="700">구독하기</text>
        ${["전체", "개발", "회고", "일"].map((t, i) => `
          <rect x="${30 + i * 62}" y="102" width="54" height="24" rx="12" fill="${i === 0 ? INK : PAPER}" stroke="${i === 0 ? INK : LINE_L}"/>
          <text x="${44 + i * 62}" y="118" font-size="10" font-family="sans-serif" fill="${i === 0 ? "#fff" : "#6b7385"}">${t}</text>`).join("")}
        ${posts}
        <rect x="${W - 170}" y="102" width="140" height="${H - 130}" rx="9" fill="${SOFT}"/>
        <text x="${W - 154}" y="126" font-size="10" font-family="sans-serif" fill="#8b93a7">유료 멤버십</text>
        ${bar(W - 154, 138, 100, 9, INK)}
        ${[0, 1, 2].map((i) => bar(W - 154, 162 + i * 16, 108 - i * 18, 6, "#cfd5e2")).join("")}
        <rect x="${W - 154}" y="216" width="108" height="24" rx="5" fill="${a}"/>
        <text x="${W - 126}" y="232" font-size="10" font-family="sans-serif" fill="#fff" font-weight="700">가입하기</text>`;
    },

    /* ---------- 모바일 앱 ---------- */
    "mobile-app"(a, seed) {
      const r = rnd(seed);
      const px = W / 2 - 96;
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="#0f1219"/>
        <circle cx="${W / 2}" cy="${H / 2 + 10}" r="150" fill="${a}" opacity=".08"/>
        <rect x="${px}" y="52" width="192" height="330" rx="26" fill="#0b0d13" stroke="#2a3042" stroke-width="1.5"/>
        <rect x="${px + 8}" y="62" width="176" height="310" rx="20" fill="${PAPER}"/>
        <rect x="${px + 66}" y="66" width="60" height="10" rx="5" fill="#0b0d13"/>

        <text x="${px + 22}" y="106" font-size="11" font-family="sans-serif" fill="#8b93a7">오프라인 보상</text>
        <text x="${px + 22}" y="128" font-size="16" font-weight="800" font-family="sans-serif" fill="${INK}">7시간 22분</text>
        <rect x="${px + 22}" y="142" width="148" height="1" fill="${LINE_L}"/>
        ${[["채굴한 광석", "12,480"], ["획득 골드", "8,120"], ["레벨업", "3회"]].map((c, i) => `
          <text x="${px + 22}" y="${168 + i * 30}" font-size="10.5" font-family="sans-serif" fill="#6b7385">${c[0]}</text>
          <text x="${px + 170}" y="${168 + i * 30}" font-size="11" font-weight="700" font-family="sans-serif" text-anchor="end" fill="${INK}">${c[1]}</text>
          <rect x="${px + 22}" y="${176 + i * 30}" width="148" height="1" fill="#f0f2f6"/>`).join("")}
        <rect x="${px + 22}" y="258" width="148" height="40" rx="8" fill="${a}" opacity=".12"/>
        <text x="${px + 34}" y="274" font-size="9.5" font-family="sans-serif" fill="#6b7385">다음 목표</text>
        <text x="${px + 34}" y="290" font-size="11" font-weight="700" font-family="sans-serif" fill="${INK}">채굴기 4단계 승급</text>
        <rect x="${px + 22}" y="312" width="148" height="30" rx="7" fill="${INK}"/>
        <text x="${px + 66}" y="331" font-size="11" font-family="sans-serif" fill="#fff" font-weight="700">받기</text>
        ${[0, 1, 2, 3].map((i) => `<circle cx="${px + 36 + i * 40}" cy="360" r="6" fill="${i === 0 ? a : "#dde1ea"}"/>`).join("")}`;
    },

    /* ---------- 매크로: 실행 콘솔 (시그니처) ---------- */
    "macro-console"(a, seed) {
      const r = rnd(seed);
      const logs = [
        ["09:00:02", "스마트스토어 로그인", "ok"],
        ["09:00:11", "신규 주문 84건 수집", "ok"],
        ["09:00:19", "쿠팡 신규 주문 61건 수집", "ok"],
        ["09:00:24", "11번가 신규 주문 39건 수집", "ok"],
        ["09:00:31", "주소 정규화 184건 · 보정 7건", "ok"],
        ["09:00:38", "중복 주문 2건 병합", "warn"],
        ["09:00:46", "송장 양식 변환 완료", "ok"],
        ["09:00:52", "CJ대한통운 업로드 중…", "run"],
      ];
      const C = { ok: "#22d3a6", warn: "#ffb020", run: a, err: "#ef4444" };
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="#0b0d13"/>
        <rect x="0" y="34" width="${W}" height="52" fill="#12151f"/>
        <line x1="0" y1="86" x2="${W}" y2="86" stroke="#1e2331"/>
        <circle cx="30" cy="60" r="5" fill="${C.ok}"/>
        <text x="44" y="64" font-size="12" font-weight="700" font-family="sans-serif" fill="#edeff5">주문 수집 · 송장 등록</text>
        <text x="220" y="64" font-size="10" font-family="ui-monospace,monospace" fill="#5f6779">RUN #4,182</text>
        <rect x="${W - 150}" y="48" width="120" height="24" rx="5" fill="${C.ok}" opacity=".14"/>
        <circle cx="${W - 136}" cy="60" r="3.5" fill="${C.ok}"/>
        <text x="${W - 126}" y="64" font-size="10" font-family="ui-monospace,monospace" fill="${C.ok}">RUNNING</text>

        <text x="30" y="112" font-size="9.5" font-family="ui-monospace,monospace" fill="#5f6779">진행률</text>
        <text x="${W - 30}" y="112" font-size="9.5" font-family="ui-monospace,monospace" text-anchor="end" fill="#8b93a7">184 / 184 건 · 6단계 중 5</text>
        <rect x="30" y="120" width="${W - 60}" height="8" rx="4" fill="#1e2331"/>
        <rect x="30" y="120" width="${(W - 60) * 0.82}" height="8" rx="4" fill="${C.ok}"/>

        ${logs.map((l, i) => `
          <text x="30" y="${162 + i * 26}" font-size="10" font-family="ui-monospace,monospace" fill="#3f4658">${l[0]}</text>
          <circle cx="${106}" cy="${158 + i * 26}" r="3" fill="${C[l[2]]}"/>
          <text x="120" y="${162 + i * 26}" font-size="10.5" font-family="ui-monospace,monospace" fill="${l[2] === "run" ? "#edeff5" : "#8b93a7"}">${l[1]}</text>
          ${l[2] === "run"
            ? `<rect x="${W - 92}" y="${152 + i * 26}" width="62" height="16" rx="4" fill="${a}" opacity=".18"/>
               <text x="${W - 84}" y="${163 + i * 26}" font-size="9" font-family="ui-monospace,monospace" fill="${a}">진행 중</text>`
            : `<text x="${W - 30}" y="${162 + i * 26}" font-size="9.5" font-family="ui-monospace,monospace" text-anchor="end" fill="#3f4658">${(0.4 + r(i) * 6).toFixed(1)}s</text>`}`).join("")}`;
    },

    /* ---------- 매크로: 파이프라인 흐름도 ---------- */
    "macro-flow"(a, seed) {
      const nodes = [
        { x: 60, y: 120, t: "수집", s: "3개 판매처" },
        { x: 250, y: 120, t: "정제", s: "주소 · 중복" },
        { x: 440, y: 120, t: "변환", s: "택배사 양식" },
        { x: 250, y: 268, t: "업로드", s: "송장 등록" },
        { x: 440, y: 268, t: "알림", s: "알림톡 발송" },
      ];
      const link = (x1, y1, x2, y2, on) =>
        `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${on ? "#22d3a6" : "#2a3042"}" stroke-width="1.5" fill="none" stroke-dasharray="${on ? "0" : "4 4"}"/>`;
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="#0b0d13"/>
        <text x="30" y="66" font-size="12" font-weight="700" font-family="sans-serif" fill="#edeff5">처리 흐름</text>
        <text x="30" y="86" font-size="10" font-family="ui-monospace,monospace" fill="#5f6779">각 단계 완료 후 검증 → 실패 시 즉시 중단</text>
        ${link(180, 148, 250, 148, true)}
        ${link(370, 148, 440, 148, true)}
        ${link(500, 176, 500, 268, true)}
        ${link(440, 296, 370, 296, true)}
        ${link(250, 268, 130, 176, false)}
        ${nodes.map((n, i) => `
          <rect x="${n.x}" y="${n.y}" width="120" height="56" rx="10" fill="#12151f" stroke="${i === 3 ? "#22d3a6" : "#2a3042"}" stroke-width="${i === 3 ? 1.5 : 1}"/>
          ${i === 3 ? `<rect x="${n.x}" y="${n.y}" width="120" height="56" rx="10" fill="#22d3a6" opacity=".08"/>` : ""}
          <circle cx="${n.x + 18}" cy="${n.y + 20}" r="4" fill="${i === 3 ? "#22d3a6" : "#3f4658"}"/>
          <text x="${n.x + 32}" y="${n.y + 24}" font-size="12" font-weight="700" font-family="sans-serif" fill="#edeff5">${n.t}</text>
          <text x="${n.x + 16}" y="${n.y + 44}" font-size="9.5" font-family="ui-monospace,monospace" fill="#5f6779">${n.s}</text>`).join("")}
        <rect x="60" y="268" width="120" height="56" rx="10" fill="#12151f" stroke="#2a3042" stroke-dasharray="4 4"/>
        <text x="76" y="292" font-size="11" font-family="sans-serif" fill="#5f6779">실패 시</text>
        <text x="76" y="310" font-size="9.5" font-family="ui-monospace,monospace" fill="#ef4444">중단 · 캡처 · 알림</text>`;
    },

    /* ---------- 매크로: 절감 리포트 ---------- */
    "macro-report"(a, seed) {
      const r = rnd(seed);
      const pts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const path = pts.map((i) => {
        const x = 60 + i * 46;
        const y = 300 - (i < 3 ? 26 : 26 + (i - 2) * 18 + r(i) * 10);
        return `${i === 0 ? "M" : "L"} ${x} ${Math.max(y, 150)}`;
      }).join(" ");
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="#0b0d13"/>
        <text x="30" y="66" font-size="12" font-weight="700" font-family="sans-serif" fill="#edeff5">누적 절감 시간</text>
        <text x="30" y="88" font-size="22" font-weight="800" font-family="sans-serif" fill="#22d3a6">1,284<tspan font-size="12" fill="#5f6779"> 시간 / 14개월</tspan></text>
        ${[0, 1, 2, 3].map((i) => `<line x1="60" y1="${150 + i * 50}" x2="${W - 30}" y2="${150 + i * 50}" stroke="#1a1f2b"/>`).join("")}
        <path d="${path} L ${60 + 11 * 46} 300 L 60 300 Z" fill="#22d3a6" opacity=".1"/>
        <path d="${path}" stroke="#22d3a6" stroke-width="2" fill="none" stroke-linecap="round"/>
        ${pts.filter((i) => i % 3 === 0).map((i) => `<circle cx="${60 + i * 46}" cy="${Math.max(300 - (i < 3 ? 26 : 26 + (i - 2) * 18 + r(i) * 10), 150)}" r="3.5" fill="#0b0d13" stroke="#22d3a6" stroke-width="2"/>`).join("")}
        <line x1="60" y1="300" x2="${W - 30}" y2="300" stroke="#2a3042"/>
        ${[["도입 전", "주 21시간"], ["현재", "주 0.9시간"], ["성공률", "99.2%"]].map((c, i) => `
          <rect x="${30 + i * 196}" y="326" width="180" height="52" rx="9" fill="#12151f" stroke="#1e2331"/>
          <text x="${46 + i * 196}" y="346" font-size="9.5" font-family="ui-monospace,monospace" fill="#5f6779">${c[0]}</text>
          <text x="${46 + i * 196}" y="367" font-size="15" font-weight="800" font-family="sans-serif" fill="${i === 1 ? "#22d3a6" : "#edeff5"}">${c[1]}</text>`).join("")}`;
    },

    /* ---------- 게임: 플레이 화면 ---------- */
    "game-play"(a, seed) {
      const r = rnd(seed);
      const ground = 320;
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="#0b0d13"/>
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="url(#gsky${seed})"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${40 + i * 82 + r(i) * 30}" cy="${70 + r(i + 4) * 90}" r="${1 + r(i) * 1.6}" fill="#ffffff" opacity="${0.2 + r(i) * 0.5}"/>`).join("")}
        ${[0, 1, 2].map((i) => `<path d="M ${-40 + i * 240} ${ground} L ${80 + i * 240} ${212 + r(i) * 40} L ${200 + i * 240} ${ground} Z" fill="#151a26"/>`).join("")}
        <line x1="0" y1="${ground}" x2="${W}" y2="${ground}" stroke="#2a3042" stroke-width="2"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<rect x="${i * 56}" y="${ground + 8}" width="26" height="2" fill="#1e2331"/>`).join("")}
        ${[[190, 40], [300, 62], [430, 34], [520, 54]].map((o, i) => `<rect x="${o[0]}" y="${ground - o[1]}" width="20" height="${o[1]}" rx="3" fill="${a}" opacity="${0.55 + r(i) * 0.45}"/>`).join("")}
        <rect x="86" y="${ground - 74}" width="30" height="30" rx="5" fill="${a}"/>
        <rect x="94" y="${ground - 66}" width="5" height="5" fill="#0b0d13"/>
        <rect x="105" y="${ground - 66}" width="5" height="5" fill="#0b0d13"/>
        <path d="M 94 ${ground - 54} q 7 5 14 0" stroke="#0b0d13" stroke-width="2" fill="none" stroke-linecap="round"/>
        <ellipse cx="101" cy="${ground - 2}" rx="18" ry="4" fill="#000" opacity=".5"/>

        <rect x="24" y="52" width="132" height="34" rx="8" fill="#0b0d13" opacity=".8"/>
        <text x="38" y="68" font-size="9" font-family="ui-monospace,monospace" fill="#5f6779">SCORE</text>
        <text x="38" y="82" font-size="14" font-weight="700" font-family="ui-monospace,monospace" fill="${a}">${(1200 + Math.floor(r(1) * 7800)).toLocaleString()}</text>
        <rect x="${W - 156}" y="52" width="132" height="34" rx="8" fill="#0b0d13" opacity=".8"/>
        <text x="${W - 142}" y="68" font-size="9" font-family="ui-monospace,monospace" fill="#5f6779">COMBO</text>
        <text x="${W - 142}" y="82" font-size="14" font-weight="700" font-family="ui-monospace,monospace" fill="#22d3a6">×${2 + Math.floor(r(3) * 8)}</text>
        <text x="${W / 2}" y="${H - 22}" font-size="10" font-family="ui-monospace,monospace" text-anchor="middle" fill="#3f4658">TAP TO JUMP</text>
        <defs><linearGradient id="gsky${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#141a2b"/><stop offset="1" stop-color="#0b0d13"/></linearGradient></defs>`;
    },

    /* ---------- 게임: 랭킹 보드 ---------- */
    "game-rank"(a, seed) {
      const r = rnd(seed);
      const names = ["감귤도둑", "야근의신", "광부K", "프로점퍼", "밤샘장인", "무한리필", "일곱번째"];
      return `
        <rect x="0" y="34" width="${W}" height="${H - 34}" fill="#0b0d13"/>
        <rect x="0" y="34" width="${W}" height="66" fill="#12151f"/>
        <text x="30" y="66" font-size="14" font-weight="800" font-family="sans-serif" fill="#edeff5">주간 랭킹</text>
        <text x="30" y="86" font-size="10" font-family="ui-monospace,monospace" fill="#5f6779">시즌 종료까지 2일 14시간</text>
        <rect x="${W - 132}" y="52" width="102" height="26" rx="5" fill="${a}"/>
        <text x="${W - 108}" y="69" font-size="10.5" font-family="sans-serif" fill="#0b0d13" font-weight="700">보상 받기</text>
        ${names.map((n, i) => {
          const y = 116 + i * 38;
          const me = i === 3;
          const medal = ["#ffd24c", "#c9d2e2", "#d19a68"][i] || "#2a3042";
          return `
            <rect x="24" y="${y}" width="${W - 48}" height="32" rx="8" fill="${me ? a : "#12151f"}" opacity="${me ? 0.14 : 1}"/>
            ${me ? `<rect x="24" y="${y}" width="${W - 48}" height="32" rx="8" fill="none" stroke="${a}"/>` : ""}
            <circle cx="46" cy="${y + 16}" r="10" fill="${medal}" opacity="${i < 3 ? 1 : 0.5}"/>
            <text x="46" y="${y + 20}" font-size="10" font-weight="700" font-family="ui-monospace,monospace" text-anchor="middle" fill="${i < 3 ? "#0b0d13" : "#8b93a7"}">${i + 1}</text>
            <rect x="66" y="${y + 6}" width="20" height="20" rx="6" fill="${["#ff9ec4", "#7aa8ff", "#7fd8a8", a, "#a894ff", "#ffb877", "#8b93a7"][i]}" opacity=".8"/>
            <text x="96" y="${y + 21}" font-size="11.5" font-family="sans-serif" fill="${me ? "#edeff5" : "#8b93a7"}" font-weight="${me ? 700 : 400}">${n}</text>
            ${me ? `<text x="182" y="${y + 21}" font-size="9.5" font-family="ui-monospace,monospace" fill="${a}">ME</text>` : ""}
            <text x="${W - 40}" y="${y + 21}" font-size="12" font-weight="700" font-family="ui-monospace,monospace" text-anchor="end" fill="${me ? a : "#edeff5"}">${(48200 - i * 3400 - Math.floor(r(i) * 900)).toLocaleString()}</text>`;
        }).join("")}`;
    },
  };

  /* cat → 기본 화면 종류 */
  const CAT_SCENE = {
    shop: "shop-grid",
    site: "web-detail",
    blog: "blog-list",
    app: "web-admin",
    macro: "macro-console",
    game: "game-play",
  };

  const SCENE_URL = {
    "shop-grid": "shop.example.co.kr", "web-list": "example.co.kr/practice",
    "web-detail": "example.co.kr/product", "web-admin": "admin.example.co.kr",
    "blog-list": "blog.example.kr", "mobile-app": "app · iOS / Android",
    "macro-console": "run-console · 실행 로그", "macro-flow": "pipeline · 처리 흐름",
    "macro-report": "report · 절감 리포트", "game-play": "game · play",
    "game-rank": "game · ranking",
  };

  function sceneSVG(kind, accent, seed) {
    const fn = SCENES[kind] || SCENES["web-detail"];
    const dark = /macro|game|mobile/.test(kind);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
      <rect width="${W}" height="${H}" fill="${dark ? "#0b0d13" : "#eef0f5"}"/>
      ${chrome(SCENE_URL[kind] || "example.co.kr", dark)}
      ${fn(accent, seed)}
    </svg>`;
  }

  const sceneURI = (kind, accent, seed) =>
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(sceneSVG(kind, accent, seed));

  /* 프로젝트 → 화면 목록 (screens 미지정 시 cat 기준 기본값) */
  function screensOf(p) {
    if (p.screens && p.screens.length) return p.screens;
    const base = CAT_SCENE[p.cat] || "web-detail";
    if (p.domain === "macro") return [
      { kind: "macro-console", cap: "실행 콘솔" },
      { kind: "macro-flow", cap: "처리 흐름" },
      { kind: "macro-report", cap: "절감 리포트" },
    ];
    if (p.domain === "game") return [
      { kind: "game-play", cap: "플레이 화면" },
      { kind: "game-rank", cap: "랭킹" },
    ];
    return [{ kind: base, cap: "주요 화면" }, { kind: "web-admin", cap: "관리자" }];
  }

  /* ========================================================
     4. 3대 분야 (Pillars)
     ======================================================== */
  function pillars() {
    const el = $("[data-pillars]");
    if (!el) return;
    el.innerHTML = PILLARS.map((p) => `
      <article class="pillar reveal" style="--dc:${DOMAIN_COLOR[p.key]}">
        <header class="pillar-head">
          <span class="pillar-en">${esc(p.en)}</span>
          <span class="pillar-count">${p.count}건</span>
        </header>
        <h3>${esc(p.title)}</h3>
        <p class="pillar-desc">${esc(p.desc)}</p>
        <ul class="pillar-list">${p.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <div class="pillar-metric">
          <b>${esc(p.metric.v)}</b>
          <span>${esc(p.metric.l)}</span>
        </div>
        <button class="pillar-cta" data-jump="${p.key}">${esc(p.label)} 작업 보기 →</button>
      </article>`).join("");

    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-jump]");
      if (!b) return;
      const btn = $(`[data-filter="${b.dataset.jump}"]`);
      if (btn) btn.click();
      $("#work").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ========================================================
     5. 대표 작업 (Featured)
     ======================================================== */
  function featured() {
    const el = $("[data-featured]");
    if (!el) return;
    const list = PROJECTS.filter((p) => p.featured);

    el.innerHTML = list.map((p, i) => {
      const c = DOMAIN_COLOR[p.domain];
      const sc = screensOf(p)[0];
      return `
      <article class="case reveal" style="--dc:${c}">
        <div class="case-media">
          <img src="${sceneURI(sc.kind, c, i + 3)}" alt="${esc(p.title)} 화면 목업" loading="lazy" width="${W}" height="${H}">
          <span class="case-tagline">${esc(sc.cap)}</span>
        </div>
        <div class="case-body">
          <span class="case-domain"><i></i>${esc(DOMAIN_LABEL[p.domain])}</span>
          <h3>${esc(p.title)}</h3>
          <p class="case-desc">${esc(p.desc)}</p>
          <dl class="case-metrics">
            ${p.metrics.map((m) => `
              <div><dt>${esc(m.l)}</dt><dd>${esc(m.v)}<small>${esc(m.u)}</small></dd></div>`).join("")}
          </dl>
          <div class="case-actions">
            <button class="btn btn--primary btn--sm" data-open="${p.id}">케이스 스터디 →</button>
            ${p.demo ? `<a class="btn btn--ghost btn--sm" href="${p.demo}" target="_blank" rel="noopener">데모 실행 ↗</a>` : ""}
          </div>
        </div>
      </article>`;
    }).join("");
  }

  /* ========================================================
     6. 포트폴리오 그리드 + 필터
     ======================================================== */
  function work() {
    const grid = $("[data-work-grid]");
    if (!grid) return;

    grid.innerHTML = PROJECTS.map((p, i) => {
      const c = DOMAIN_COLOR[p.domain];
      const kind = screensOf(p)[0].kind;
      return `
      <button class="work reveal" data-open="${p.id}" data-domain="${p.domain}" style="--dc:${c}">
        <span class="work-thumb">
          <img src="${sceneURI(kind, c, i + 1)}" alt="${esc(p.title)} 화면 목업" loading="lazy" width="${W}" height="${H}">
          <span class="work-badge"><i></i>${esc(p.catLabel)}</span>
          ${p.demo ? `<span class="work-demo">LIVE DEMO</span>` : ""}
        </span>
        <span class="work-body">
          <span class="work-meta">${esc(p.code)}</span>
          <span class="work-h">${esc(p.title)}</span>
          <span class="work-p">${esc(p.desc)}</span>
          <span class="work-tags">${p.tags.slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</span>
          <span class="work-result">${esc(p.result)}</span>
        </span>
      </button>`;
    }).join("");

    /* 필터 버튼에 건수 표시 */
    $$("[data-filter]").forEach((btn) => {
      const f = btn.dataset.filter;
      const n = f === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.domain === f).length;
      const cnt = document.createElement("span");
      cnt.className = "filter-n";
      cnt.textContent = n;
      btn.appendChild(cnt);
      if (f !== "all") btn.style.setProperty("--dc", DOMAIN_COLOR[f]);

      btn.addEventListener("click", () => {
        $$("[data-filter]").forEach((b) => {
          b.classList.remove("is-on");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-on");
        btn.setAttribute("aria-pressed", "true");
        let shown = 0;
        $$(".work", grid).forEach((card) => {
          const on = f === "all" || card.dataset.domain === f;
          card.hidden = !on;
          if (on) {
            card.style.animation = "none";
            void card.offsetWidth;
            card.style.animation = `pop .34s var(--ease) ${Math.min(shown, 8) * 26}ms both`;
            shown++;
          }
        });
      });
    });
  }

  /* ========================================================
     7. 케이스 스터디 모달 (탭 구성)
     ======================================================== */
  function modal() {
    const m = $("[data-modal]");
    const box = $("[data-modal-body]");
    if (!m || !box) return;
    let lastFocus = null;

    const TABS = [
      { k: "overview", t: "개요" },
      { k: "screens", t: "화면" },
      { k: "features", t: "기능" },
      { k: "stack", t: "기술" },
      { k: "process", t: "과정" },
    ];

    function paras(txt) {
      return txt.split("\n\n").map((t) => `<p>${esc(t)}</p>`).join("");
    }

    function panel(k, p, c) {
      if (k === "overview") return `
        <div class="cs-block">
          <h4 class="cs-h"><span class="cs-h-tag" style="background:#ef444422;color:#f87171">문제</span></h4>
          <p>${esc(p.problem || p.desc)}</p>
        </div>
        <div class="cs-block">
          <h4 class="cs-h"><span class="cs-h-tag" style="background:${c}22;color:${c}">해결</span></h4>
          <p>${esc(p.solution || "")}</p>
        </div>
        <div class="cs-block cs-block--body">${paras(p.body || "")}</div>
        ${p.learned ? `
        <aside class="cs-learn">
          <span class="cs-learn-label">이 프로젝트에서 배운 것</span>
          <p>${esc(p.learned)}</p>
        </aside>` : ""}`;

      if (k === "screens") {
        const list = screensOf(p);
        return `
          <p class="cs-note">실제 납품 화면을 재구성한 목업입니다. 코드로 그려 외부 이미지 없이 표시됩니다.</p>
          <div class="cs-shots">
            ${list.map((s, i) => `
              <figure class="cs-shot">
                <div class="cs-shot-frame">${sceneSVG(s.kind, c, (p.id.charCodeAt(1) || 3) + i * 7)}</div>
                <figcaption>${esc(s.cap)}</figcaption>
              </figure>`).join("")}
          </div>`;
      }

      if (k === "features") return `
        <ul class="cs-feats">
          ${(p.features || []).map((f) => `
            <li>
              <span class="cs-feat-dot" style="background:${c}"></span>
              <div><b>${esc(f.t)}</b><span>${esc(f.d)}</span></div>
            </li>`).join("")}
        </ul>`;

      if (k === "stack") return `
        <div class="cs-stack">
          ${Object.entries(p.stack || {}).map(([g, items]) => `
            <div class="cs-stack-row">
              <span class="cs-stack-label">${esc(g)}</span>
              <span class="cs-stack-items">${items.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</span>
            </div>`).join("")}
        </div>
        <div class="cs-block">
          <h4 class="cs-h"><span class="cs-h-tag" style="background:${c}22;color:${c}">성과</span></h4>
          <dl class="cs-metrics">
            ${(p.metrics || []).map((mm) => `
              <div><dt>${esc(mm.l)}</dt><dd>${esc(mm.v)}<small>${esc(mm.u)}</small></dd></div>`).join("")}
          </dl>
        </div>`;

      if (k === "process") return `
        <ol class="cs-timeline">
          ${(p.timeline || []).map((s) => `
            <li>
              <span class="cs-tl-w">${esc(s.w)}</span>
              <div><b>${esc(s.t)}</b><span>${esc(s.d)}</span></div>
            </li>`).join("")}
        </ol>`;
      return "";
    }

    function open(id) {
      const p = PROJECTS.find((x) => x.id === id);
      if (!p) return;
      const c = DOMAIN_COLOR[p.domain];
      lastFocus = document.activeElement;

      box.innerHTML = `
        <div class="cs-head" style="--dc:${c}">
          <span class="cs-domain"><i></i>${esc(DOMAIN_LABEL[p.domain])} · ${esc(p.catLabel)}</span>
          <h3>${esc(p.title)}</h3>
          <p class="cs-lead">${esc(p.desc)}</p>
          <dl class="cs-facts">
            ${Object.entries(p.facts).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
          </dl>
        </div>
        <div class="cs-tabs" role="tablist" aria-label="케이스 스터디 항목">
          ${TABS.map((t, i) => `
            <button class="cs-tab${i === 0 ? " is-on" : ""}" role="tab" id="cst-${t.k}"
                    aria-selected="${i === 0}" aria-controls="csp-${t.k}" data-tab="${t.k}"
                    style="--dc:${c}">${t.t}</button>`).join("")}
        </div>
        <div class="cs-panels">
          ${TABS.map((t, i) => `
            <section class="cs-panel${i === 0 ? " is-on" : ""}" role="tabpanel"
                     id="csp-${t.k}" aria-labelledby="cst-${t.k}" ${i === 0 ? "" : "hidden"}>
              ${panel(t.k, p, c)}
            </section>`).join("")}
        </div>
        <footer class="cs-foot">
          <p class="cs-result" style="--dc:${c}">${esc(p.result)}</p>
          <div class="modal-actions">
            ${p.demo ? `<a class="btn btn--primary" href="${p.demo}" target="_blank" rel="noopener">데모 실행해 보기 ↗</a>` : ""}
            <a class="btn btn--ghost" href="#contact" data-modal-close>비슷한 프로젝트 문의하기</a>
          </div>
        </footer>`;

      /* 탭 전환 */
      const tabs = $$(".cs-tab", box);
      tabs.forEach((tb) => {
        tb.addEventListener("click", () => {
          tabs.forEach((x) => {
            x.classList.remove("is-on");
            x.setAttribute("aria-selected", "false");
          });
          tb.classList.add("is-on");
          tb.setAttribute("aria-selected", "true");
          $$(".cs-panel", box).forEach((pn) => {
            const on = pn.id === "csp-" + tb.dataset.tab;
            pn.classList.toggle("is-on", on);
            pn.hidden = !on;
          });
          $(".cs-panels", box).scrollIntoView({ block: "nearest" });
        });
        tb.addEventListener("keydown", (e) => {
          const i = tabs.indexOf(tb);
          let n = null;
          if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
          if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
          if (n !== null) { e.preventDefault(); tabs[n].focus(); tabs[n].click(); }
        });
      });

      m.classList.add("is-open");
      document.body.style.overflow = "hidden";
      $(".modal-box", m).scrollTop = 0;
      $(".modal-close", m).focus();
    }

    function close() {
      m.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open]");
      if (opener) { open(opener.dataset.open); return; }
    });
    m.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-close]") || e.target.classList.contains("modal-back")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && m.classList.contains("is-open")) close();
    });
  }

  /* ========================================================
     8. 기술 스택
     ======================================================== */
  function stack() {
    const el = $("[data-stack]");
    if (!el) return;
    el.innerHTML = STACK.map((s) => `
      <article class="stk reveal" style="--dc:${DOMAIN_COLOR[s.domain]}">
        <h3 class="stk-h"><i></i>${esc(s.label)}</h3>
        ${s.groups.map((g) => `
          <div class="stk-row">
            <span class="stk-label">${esc(g.t)}</span>
            <span class="stk-items">${g.items.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</span>
          </div>`).join("")}
      </article>`).join("");
  }

  /* ========================================================
     9. 요금 / 후기 / FAQ / 통계
     ======================================================== */
  function plans() {
    const el = $("[data-plans]");
    if (!el) return;
    el.innerHTML = PLANS.map((p) => `
      <div class="plan${p.hot ? " plan--hot" : ""} reveal" style="--dc:${DOMAIN_COLOR[p.domain] || "#4c6fff"}">
        <div class="plan-flag">${esc(p.flag)}</div>
        <h3>${esc(p.name)}</h3>
        <p class="plan-desc">${esc(p.desc)}</p>
        <div class="plan-price">${esc(p.price)}<small> ${esc(p.unit)}</small></div>
        <ul class="plan-feats">${p.feats.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        <a class="btn ${p.hot ? "btn--primary" : "btn--ghost"} btn--block" href="#contact">이 플랜으로 상담하기</a>
        <p class="plan-note">${esc(p.note)}</p>
      </div>`).join("");
  }

  function quotes() {
    const el = $("[data-quotes]");
    if (!el) return;
    el.innerHTML = QUOTES.map((q) => `
      <figure class="quote reveal">
        <div class="quote-stars" aria-label="별점 ${q.stars}점">${"★".repeat(q.stars)}</div>
        <blockquote><p>${esc(q.text)}</p></blockquote>
        <figcaption class="quote-by">
          <span class="avatar">${esc(q.initial)}</span>
          <span><b>${esc(q.name)}</b><span>${esc(q.org)}</span></span>
        </figcaption>
      </figure>`).join("");
  }

  function faq() {
    const el = $("[data-faq]");
    if (!el) return;
    el.innerHTML = FAQS.map((f, i) => `
      <div class="faq-item">
        <h3><button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}">${esc(f.q)}</button></h3>
        <div class="faq-a" id="faq-a-${i}"><div><p>${esc(f.a)}</p></div></div>
      </div>`).join("");

    el.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq-q");
      if (!btn) return;
      const item = btn.closest(".faq-item");
      const open = btn.getAttribute("aria-expanded") === "true";
      $$(".faq-item", el).forEach((it) => {
        it.classList.remove("is-open");
        $(".faq-q", it).setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  function stats() {
    const el = $("[data-stats]");
    if (!el) return;
    el.innerHTML = STATS.map((s) => `
      <div class="stat reveal">
        <div class="stat-num" data-count="${s.num}">0<span>${esc(s.suffix)}</span></div>
        <div class="stat-label">${esc(s.label)}</div>
      </div>`).join("");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const node = en.target;
        io.unobserve(node);
        const target = +node.dataset.count;
        const suffix = node.querySelector("span").outerHTML;
        if (reduce) { node.innerHTML = target + suffix; return; }
        const dur = 1100, t0 = performance.now();
        (function tick(now) {
          const k = Math.min((now - t0) / dur, 1);
          node.innerHTML = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    $$("[data-count]", el).forEach((n) => io.observe(n));
  }

  /* ========================================================
     10. 스크롤 리빌 / 폼
     ======================================================== */
  function reveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px" });
    $$(".reveal").forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(el);
    });
  }

  function form() {
    const f = $("[data-form]");
    if (!f) return;
    const status = $("[data-form-status]");

    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(f);
      for (const k of ["name", "contact", "message"]) {
        if (!String(d.get(k) || "").trim()) {
          status.textContent = "필수 항목을 모두 채워 주세요.";
          f.elements[k].focus();
          return;
        }
      }
      if (!f.elements.agree.checked) {
        status.textContent = "개인정보 수집·이용에 동의해 주세요.";
        return;
      }

      const body = [
        `[${CONFIG.brandKo} 프로젝트 문의]`, "",
        `이름/회사: ${d.get("name")}`,
        `연락처: ${d.get("contact")}`,
        `프로젝트 종류: ${d.getAll("kind").join(", ") || "미선택"}`,
        `예상 예산: ${d.get("budget") || "미정"}`,
        `희망 오픈 시기: ${d.get("due") || "미정"}`,
        "", "내용:", d.get("message"),
      ].join("\n");

      window.location.href =
        "mailto:" + CONFIG.email +
        "?subject=" + encodeURIComponent(`[프로젝트 문의] ${d.get("name")}`) +
        "&body=" + encodeURIComponent(body);
      status.textContent = "메일 앱을 열었습니다. 전송되지 않으면 " + CONFIG.email + " 로 보내주세요.";
    });
  }

  /* ========================================================
     실행
     ======================================================== */
  function boot() {
    applyConfig();
    header();
    pillars();
    featured();
    work();
    modal();
    stack();
    plans();
    quotes();
    faq();
    stats();
    form();
    reveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
