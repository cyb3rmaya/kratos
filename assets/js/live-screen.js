/* ============================================================
   live-screen.js
   시그니처 요소 — 히어로 디바이스 안에서 실제로 동작하는 미니 UI 4종.
   이미지가 아니라 진짜 DOM이라 클릭·조작이 됩니다.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 공통 스타일 (스크린 내부 전용, 페이지 CSS와 격리) ---------- */
  const SCREEN_CSS = `
  .ls { position:absolute; inset:0; background:#fff; color:#14161a;
        font-family:"Pretendard Variable",Pretendard,sans-serif; font-size:11px;
        line-height:1.5; overflow:hidden; letter-spacing:-0.01em; }
  .ls *, .ls *::before, .ls *::after { box-sizing:border-box; }
  .ls button { font:inherit; color:inherit; cursor:pointer; border:0; background:none; }
  .ls-top { height:32px; display:flex; align-items:center; gap:10px; padding:0 14px;
            border-bottom:1px solid #eceef2; flex:none; }
  .ls-logo { font-weight:800; font-size:12px; letter-spacing:-0.03em; }
  .ls-nav { display:flex; gap:10px; margin-left:auto; color:#8b93a7; font-size:10px; }
  .ls-body { position:absolute; inset:32px 0 0 0; overflow:hidden; }

  /* 쇼핑몰 */
  .lss-hero { padding:12px 14px 10px; }
  .lss-kicker { font-size:9px; letter-spacing:.12em; color:#4c6fff; font-weight:700; }
  .lss-h { font-size:16px; font-weight:800; letter-spacing:-0.03em; margin-top:3px; }
  .lss-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:0 14px; }
  .lss-card { border:1px solid #eceef2; border-radius:8px; overflow:hidden; }
  .lss-img { height:44px; }
  .lss-info { padding:6px 7px 7px; }
  .lss-name { font-size:9.5px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .lss-price { font-size:10px; font-weight:800; margin-top:2px; }
  .lss-add { width:100%; margin-top:5px; height:20px; border-radius:5px; background:#14161a;
             color:#fff; font-size:9px; font-weight:700; transition:background .15s; }
  .lss-add:hover { background:#4c6fff; }
  .lss-add.done { background:#4c6fff; }
  .lss-cart { position:absolute; left:14px; right:14px; bottom:10px; height:34px; border-radius:8px;
              background:#14161a; color:#fff; display:flex; align-items:center; padding:0 12px; gap:8px; }
  .lss-cart b { font-size:11px; }
  .lss-count { margin-left:auto; font-size:10px; color:#9aa3b8; }
  .lss-pay { background:#4c6fff; height:22px; padding:0 10px; border-radius:6px; font-size:9.5px; font-weight:700; color:#fff; }

  /* 블로그 */
  .lsb { padding:12px 14px; }
  .lsb-tags { display:flex; gap:5px; margin-bottom:9px; flex-wrap:wrap; }
  .lsb-tag { font-size:9px; padding:3px 8px; border-radius:20px; border:1px solid #e4e7ee; color:#6b7385; }
  .lsb-tag.on { background:#14161a; color:#fff; border-color:#14161a; }
  .lsb-post { display:flex; gap:9px; padding:8px 0; border-bottom:1px solid #f0f2f5; }
  .lsb-thumb { width:42px; height:34px; border-radius:5px; flex:none; }
  .lsb-t { font-size:10.5px; font-weight:700; letter-spacing:-0.02em; }
  .lsb-d { font-size:9px; color:#8b93a7; margin-top:2px; }
  .lsb-meta { font-size:8.5px; color:#b0b7c6; margin-top:3px; }

  /* 예약 */
  .lsr { padding:11px 14px; }
  .lsr-h { font-size:12px; font-weight:800; letter-spacing:-0.02em; }
  .lsr-sub { font-size:9px; color:#8b93a7; margin-top:2px; }
  .lsr-cal { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; margin-top:9px; }
  .lsr-dow { font-size:8px; color:#b0b7c6; text-align:center; padding-bottom:2px; }
  .lsr-day { aspect-ratio:1; border-radius:5px; font-size:9.5px; display:grid; place-items:center;
             border:1px solid #eceef2; color:#14161a; transition:.14s; }
  .lsr-day:hover { border-color:#4c6fff; }
  .lsr-day.off { color:#d3d7e0; border-color:#f4f5f8; cursor:default; }
  .lsr-day.on { background:#4c6fff; border-color:#4c6fff; color:#fff; font-weight:700; }
  .lsr-slots { display:flex; gap:5px; margin-top:10px; flex-wrap:wrap; }
  .lsr-slot { font-size:9px; padding:5px 9px; border-radius:5px; border:1px solid #eceef2; transition:.14s; }
  .lsr-slot:hover { border-color:#4c6fff; }
  .lsr-slot.on { background:#14161a; color:#fff; border-color:#14161a; }
  .lsr-slot.full { color:#d3d7e0; text-decoration:line-through; cursor:default; }
  .lsr-confirm { position:absolute; left:14px; right:14px; bottom:10px; height:30px; border-radius:7px;
                 background:#4c6fff; color:#fff; font-size:10px; font-weight:700; display:grid; place-items:center; }
  .lsr-confirm.idle { background:#eceef2; color:#a8b0c0; }

  /* 자동화 콘솔 */
  .lsm { position:absolute; inset:32px 0 0 0; background:#0b0d13; color:#8b93a7;
         font-family:"JetBrains Mono",ui-monospace,monospace; padding:11px 14px; }
  .lsm-top { display:flex; align-items:center; gap:7px; }
  .lsm-dot { width:6px; height:6px; border-radius:50%; background:#22d3a6; flex:none;
             animation:lsmPulse 1.6s ease-in-out infinite; }
  .lsm-name { font-family:"Pretendard Variable",Pretendard,sans-serif; font-size:11px;
              font-weight:700; color:#edeff5; letter-spacing:-0.02em; }
  .lsm-run { margin-left:auto; font-size:8.5px; letter-spacing:.1em; color:#22d3a6;
             border:1px solid rgba(34,211,166,.35); border-radius:3px; padding:2px 6px; }
  .lsm-run.done { color:#5f6779; border-color:rgba(255,255,255,.14); }
  .lsm-meter { margin-top:9px; height:5px; border-radius:3px; background:#1a1f2b; overflow:hidden; }
  .lsm-fill { height:100%; width:0; background:#22d3a6; border-radius:3px; transition:width .35s linear; }
  .lsm-pct { display:flex; justify-content:space-between; font-size:8px; color:#3f4658; margin-top:5px; }
  .lsm-log { margin-top:7px; height:118px; overflow:hidden; display:flex; flex-direction:column; gap:4px; }
  .lsm-line { display:flex; gap:7px; align-items:baseline; font-size:8.5px; line-height:1.4;
              animation:lsmIn .28s ease both; }
  .lsm-t { color:#333a4a; flex:none; }
  .lsm-s { flex:none; width:5px; height:5px; border-radius:50%; margin-top:1px; }
  .lsm-m { color:#8b93a7; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .lsm-line.on .lsm-m { color:#edeff5; }
  .lsm-foot { position:absolute; left:14px; right:14px; bottom:10px; display:flex;
              align-items:center; gap:8px; }
  .lsm-sum { font-size:8.5px; color:#5f6779; }
  .lsm-sum b { color:#22d3a6; }
  .lsm-btn { margin-left:auto; font-size:9px; font-weight:700; color:#0b0d13; background:#22d3a6;
             border-radius:4px; padding:5px 11px; font-family:"Pretendard Variable",Pretendard,sans-serif; }
  .lsm-btn:hover { background:#3ee0b8; }
  @keyframes lsmPulse { 0%,100%{opacity:1} 50%{opacity:.25} }
  @keyframes lsmIn { from{opacity:0; transform:translateY(4px)} to{opacity:1; transform:none} }

  /* 게임 */
  .lsg { position:absolute; inset:32px 0 0 0; background:#0e1017; }
  .lsg canvas { width:100%; height:100%; display:block; }
  .lsg-hud { position:absolute; top:8px; left:12px; right:12px; display:flex; gap:8px;
             font-family:"JetBrains Mono",monospace; font-size:9px; color:#8b93a7; }
  .lsg-hud b { color:#ffb020; }
  .lsg-tip { position:absolute; bottom:8px; left:0; right:0; text-align:center;
             font-family:"JetBrains Mono",monospace; font-size:9px; color:#5f6779; }
  `;

  function injectCSS() {
    if (document.getElementById("ls-style")) return;
    const s = document.createElement("style");
    s.id = "ls-style";
    s.textContent = SCREEN_CSS;
    document.head.appendChild(s);
  }

  /* 상품/썸네일용 그라디언트 (이미지 파일 없이 색면으로 처리) */
  const GRADS = [
    "linear-gradient(135deg,#ffd9a0,#ff9d6c)",
    "linear-gradient(135deg,#c3e0ff,#7aa8ff)",
    "linear-gradient(135deg,#d6f5e3,#7fd8a8)",
    "linear-gradient(135deg,#ffd6e7,#ff9ec4)",
    "linear-gradient(135deg,#e3dcff,#a894ff)",
    "linear-gradient(135deg,#fff0b8,#ffd24c)",
  ];

  /* ========================================================
     1) 쇼핑몰
     ======================================================== */
  function buildShop(root) {
    const items = [
      { n: "노지 감귤 5kg", p: "24,900" },
      { n: "한라봉 3kg", p: "32,000" },
      { n: "감귤 주스 12병", p: "19,800" },
    ];
    root.innerHTML = `
      <div class="ls">
        <div class="ls-top">
          <div class="ls-logo">제주감귤상회</div>
          <nav class="ls-nav"><span>전체상품</span><span>예약판매</span><span>정기구독</span></nav>
        </div>
        <div class="ls-body">
          <div class="lss-hero">
            <div class="lss-kicker">11월 수확 예약판매</div>
            <div class="lss-h">따는 날 바로 보냅니다</div>
          </div>
          <div class="lss-grid">
            ${items
              .map(
                (it, i) => `
              <div class="lss-card">
                <div class="lss-img" style="background:${GRADS[i]}"></div>
                <div class="lss-info">
                  <div class="lss-name">${it.n}</div>
                  <div class="lss-price">${it.p}원</div>
                  <button class="lss-add" data-add="1">담기</button>
                </div>
              </div>`
              )
              .join("")}
          </div>
          <div class="lss-cart">
            <b>장바구니</b>
            <span class="lss-count"><span data-cart>0</span>개 담김</span>
            <button class="lss-pay">주문하기</button>
          </div>
        </div>
      </div>`;

    let n = 0;
    const out = root.querySelector("[data-cart]");
    root.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", () => {
        n += 1;
        out.textContent = n;
        btn.textContent = "담김 ✓";
        btn.classList.add("done");
        setTimeout(() => {
          btn.textContent = "담기";
          btn.classList.remove("done");
        }, 900);
      });
    });
  }

  /* ========================================================
     2) 블로그
     ======================================================== */
  function buildBlog(root) {
    const posts = [
      { t: "쇼핑몰 이탈률을 40% 줄인 장바구니 개편기", d: "결제까지 세 걸음을 줄였습니다", m: "2025.06.14 · 8분", tag: "회고" },
      { t: "한국어 검색은 왜 형태소 분석이 필요한가", d: "'연차'로 '휴가'를 찾게 만들기", m: "2025.05.28 · 12분", tag: "개발" },
      { t: "1인 개발자의 유지보수 계약서 쓰는 법", d: "범위를 문장으로 못 박아 두기", m: "2025.05.02 · 6분", tag: "일" },
      { t: "캔버스 게임에서 60fps를 지키는 방법", d: "고정 타임스텝과 오브젝트 풀", m: "2025.04.19 · 10분", tag: "개발" },
    ];
    const tags = ["전체", "개발", "회고", "일"];
    root.innerHTML = `
      <div class="ls">
        <div class="ls-top">
          <div class="ls-logo">만드는 기록</div>
          <nav class="ls-nav"><span>글</span><span>소개</span><span>구독</span></nav>
        </div>
        <div class="ls-body">
          <div class="lsb">
            <div class="lsb-tags">
              ${tags.map((t, i) => `<button class="lsb-tag${i === 0 ? " on" : ""}" data-tag="${t}">${t}</button>`).join("")}
            </div>
            <div data-list>
              ${posts
                .map(
                  (p, i) => `
                <div class="lsb-post" data-cat="${p.tag}">
                  <div class="lsb-thumb" style="background:${GRADS[(i + 1) % GRADS.length]}"></div>
                  <div>
                    <div class="lsb-t">${p.t}</div>
                    <div class="lsb-d">${p.d}</div>
                    <div class="lsb-meta">${p.m}</div>
                  </div>
                </div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>`;

    root.querySelectorAll("[data-tag]").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll("[data-tag]").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        const t = btn.dataset.tag;
        root.querySelectorAll("[data-cat]").forEach((el) => {
          el.style.display = t === "전체" || el.dataset.cat === t ? "" : "none";
        });
      });
    });
  }

  /* ========================================================
     3) 예약
     ======================================================== */
  function buildBooking(root) {
    const dow = ["일", "월", "화", "수", "목", "금", "토"];
    const days = [];
    for (let i = 0; i < 3; i++) days.push({ n: "", off: true });
    for (let d = 1; d <= 25; d++) days.push({ n: d, off: d < 8 });
    const slots = [
      { t: "10:00", full: false },
      { t: "11:30", full: true },
      { t: "14:00", full: false },
      { t: "15:30", full: false },
      { t: "17:00", full: true },
    ];
    root.innerHTML = `
      <div class="ls">
        <div class="ls-top">
          <div class="ls-logo">서울바른치과</div>
          <nav class="ls-nav"><span>진료안내</span><span>오시는길</span><span>예약</span></nav>
        </div>
        <div class="ls-body">
          <div class="lsr">
            <div class="lsr-h">진료 예약</div>
            <div class="lsr-sub">원하시는 날짜와 시간을 선택하세요</div>
            <div class="lsr-cal">
              ${dow.map((d) => `<div class="lsr-dow">${d}</div>`).join("")}
              ${days
                .map((d) =>
                  d.off
                    ? `<div class="lsr-day off">${d.n}</div>`
                    : `<button class="lsr-day" data-day="${d.n}">${d.n}</button>`
                )
                .join("")}
            </div>
            <div class="lsr-slots">
              ${slots
                .map((s) =>
                  s.full
                    ? `<div class="lsr-slot full">${s.t}</div>`
                    : `<button class="lsr-slot" data-slot="${s.t}">${s.t}</button>`
                )
                .join("")}
            </div>
          </div>
          <div class="lsr-confirm idle" data-confirm>날짜와 시간을 선택해 주세요</div>
        </div>
      </div>`;

    let day = null,
      slot = null;
    const bar = root.querySelector("[data-confirm]");
    const sync = () => {
      if (day && slot) {
        bar.classList.remove("idle");
        bar.textContent = `11월 ${day}일 ${slot} 예약 확정하기`;
      } else {
        bar.classList.add("idle");
        bar.textContent = "날짜와 시간을 선택해 주세요";
      }
    };
    root.querySelectorAll("[data-day]").forEach((b) =>
      b.addEventListener("click", () => {
        root.querySelectorAll("[data-day]").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        day = b.dataset.day;
        sync();
      })
    );
    root.querySelectorAll("[data-slot]").forEach((b) =>
      b.addEventListener("click", () => {
        root.querySelectorAll("[data-slot]").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        slot = b.dataset.slot;
        sync();
      })
    );
  }

  /* ========================================================
     4) 자동화 콘솔 — 실제로 로그가 흐르는 실행 화면
     ======================================================== */
  function buildMacro(root) {
    const STEPS = [
      { t: "스마트스토어 로그인", s: "ok", d: 620 },
      { t: "신규 주문 84건 수집", s: "ok", d: 900 },
      { t: "쿠팡 신규 주문 61건 수집", s: "ok", d: 820 },
      { t: "11번가 신규 주문 39건 수집", s: "ok", d: 760 },
      { t: "주소 정규화 184건 · 보정 7건", s: "ok", d: 880 },
      { t: "중복 주문 2건 병합", s: "warn", d: 640 },
      { t: "송장 양식 변환", s: "ok", d: 700 },
      { t: "CJ대한통운 업로드 184건", s: "ok", d: 980 },
      { t: "알림톡 발송 · 처리 완료", s: "ok", d: 560 },
    ];
    const COLOR = { ok: "#22d3a6", warn: "#ffb020", err: "#ef4444" };

    root.innerHTML = `
      <div class="ls">
        <div class="ls-top">
          <div class="ls-logo">주문 자동화</div>
          <nav class="ls-nav"><span>실행 이력</span><span>스케줄</span><span>설정</span></nav>
        </div>
        <div class="lsm">
          <div class="lsm-top">
            <span class="lsm-dot" data-dot></span>
            <span class="lsm-name">오픈마켓 주문 · 송장 등록</span>
            <span class="lsm-run" data-badge>RUNNING</span>
          </div>
          <div class="lsm-meter"><div class="lsm-fill" data-fill></div></div>
          <div class="lsm-pct"><span data-step>1 / ${STEPS.length} 단계</span><span data-pct>0%</span></div>
          <div class="lsm-log" data-log></div>
          <div class="lsm-foot">
            <span class="lsm-sum" data-sum>매일 09:00 · 14:00 · 18:00 자동 실행</span>
            <button class="lsm-btn" data-again hidden>다시 실행</button>
          </div>
        </div>
      </div>`;

    const log = root.querySelector("[data-log]");
    const fill = root.querySelector("[data-fill]");
    const pct = root.querySelector("[data-pct]");
    const stepEl = root.querySelector("[data-step]");
    const badge = root.querySelector("[data-badge]");
    const dot = root.querySelector("[data-dot]");
    const sum = root.querySelector("[data-sum]");
    const again = root.querySelector("[data-again]");

    let timer = null;
    let i = 0;
    const t0 = new Date(2026, 0, 1, 9, 0, 2);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function stamp(n) {
      const d = new Date(t0.getTime() + n * 6400);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    }

    function line(n, cur) {
      const s = STEPS[n];
      const el = document.createElement("div");
      el.className = "lsm-line" + (cur ? " on" : "");
      el.innerHTML = `<span class="lsm-t">${stamp(n)}</span>
        <span class="lsm-s" style="background:${COLOR[s.s]}"></span>
        <span class="lsm-m">${s.t}</span>`;
      return el;
    }

    function finish() {
      badge.textContent = "COMPLETE";
      badge.classList.add("done");
      dot.style.animation = "none";
      dot.style.background = "#5f6779";
      sum.innerHTML = `184건 처리 · <b>7분 12초 절감</b>`;
      again.hidden = false;
    }

    function tick() {
      if (i >= STEPS.length) { finish(); return; }
      log.appendChild(line(i, true));
      Array.from(log.children).forEach((c, n) => {
        if (n !== log.children.length - 1) c.classList.remove("on");
      });
      while (log.children.length > 6) log.removeChild(log.firstChild);

      i += 1;
      const p = Math.round((i / STEPS.length) * 100);
      fill.style.width = p + "%";
      pct.textContent = p + "%";
      stepEl.textContent = `${Math.min(i + 1, STEPS.length)} / ${STEPS.length} 단계`;
      timer = setTimeout(tick, STEPS[i - 1].d);
    }

    function start() {
      clearTimeout(timer);
      i = 0;
      log.innerHTML = "";
      fill.style.width = "0";
      pct.textContent = "0%";
      badge.textContent = "RUNNING";
      badge.classList.remove("done");
      dot.style.animation = "";
      dot.style.background = "#22d3a6";
      sum.textContent = "매일 09:00 · 14:00 · 18:00 자동 실행";
      again.hidden = true;

      if (reduce) {
        STEPS.forEach((_, n) => log.appendChild(line(n, false)));
        while (log.children.length > 6) log.removeChild(log.firstChild);
        fill.style.width = "100%";
        pct.textContent = "100%";
        stepEl.textContent = `${STEPS.length} / ${STEPS.length} 단계`;
        finish();
        return;
      }
      tick();
    }

    again.addEventListener("click", start);
    start();

    /* 탭이 가려지면 타이머 정지 */
    root._stop = () => clearTimeout(timer);
    root._play = start;
  }

  /* ========================================================
     5) 게임 — 캔버스 러너
     ======================================================== */
  function buildGame(root) {
    root.innerHTML = `
      <div class="ls">
        <div class="ls-top">
          <div class="ls-logo">점프업</div>
          <nav class="ls-nav"><span>랭킹</span><span>쿠폰</span></nav>
        </div>
        <div class="lsg">
          <canvas></canvas>
          <div class="lsg-hud"><span>SCORE <b data-score>0</b></span><span data-state>클릭해서 시작</span></div>
          <div class="lsg-tip">클릭 또는 스페이스바로 점프</div>
        </div>
      </div>`;

    const cv = root.querySelector("canvas");
    const ctx = cv.getContext("2d");
    const scoreEl = root.querySelector("[data-score]");
    const stateEl = root.querySelector("[data-state]");
    let W = 0,
      H = 0,
      dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const r = cv.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    let running = false,
      score = 0,
      y = 0,
      vy = 0,
      obs = [],
      t = 0,
      speed = 2.2,
      raf = null;
    const GROUND = () => H - 22;
    const SIZE = 14;

    function reset() {
      score = 0;
      y = 0;
      vy = 0;
      obs = [];
      t = 0;
      speed = 2.2;
      scoreEl.textContent = "0";
    }

    function jump() {
      if (!running) {
        reset();
        running = true;
        stateEl.textContent = "진행 중";
        loop();
        return;
      }
      if (y <= 0.5) vy = 5.6;
    }

    function loop() {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      t += 1;

      vy -= 0.32;
      y += vy;
      if (y < 0) { y = 0; vy = 0; }

      if (t % Math.max(58 - Math.floor(speed * 6), 32) === 0) {
        obs.push({ x: W + 10, h: 12 + Math.random() * 12, w: 8 + Math.random() * 6 });
      }
      speed = Math.min(2.2 + t / 900, 5.2);
      obs.forEach((o) => (o.x -= speed));
      obs = obs.filter((o) => o.x + o.w > -10);

      const px = 34;
      for (const o of obs) {
        if (px + SIZE > o.x && px < o.x + o.w && y < o.h) {
          running = false;
          stateEl.textContent = "충돌! 클릭해서 다시";
          cancelAnimationFrame(raf);
          break;
        }
      }
      if (running) {
        score += 1;
        scoreEl.textContent = Math.floor(score / 3);
      }
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // 바닥선
      ctx.strokeStyle = "rgba(255,255,255,.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND() + SIZE + 0.5);
      ctx.lineTo(W, GROUND() + SIZE + 0.5);
      ctx.stroke();
      // 스크롤 눈금
      ctx.fillStyle = "rgba(255,255,255,.07)";
      for (let i = 0; i < W / 26 + 2; i++) {
        const x = ((i * 26 - ((t * speed) % 26)) + W) % (W + 26) - 13;
        ctx.fillRect(x, GROUND() + SIZE + 4, 10, 1);
      }
      // 장애물
      ctx.fillStyle = "#4c6fff";
      obs.forEach((o) => ctx.fillRect(o.x, GROUND() + SIZE - o.h, o.w, o.h));
      // 플레이어
      ctx.fillStyle = "#ffb020";
      ctx.fillRect(34, GROUND() - y, SIZE, SIZE);
    }

    root.addEventListener("click", jump);
    root.addEventListener("keydown", (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        jump();
      }
    });
    root.setAttribute("tabindex", "0");

    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(cv);
    setTimeout(() => { resize(); draw(); }, 60);

    // 패널이 숨겨질 때 루프 정지 (배터리 절약)
    root._stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      stateEl.textContent = "클릭해서 시작";
    };
  }

  /* ========================================================
     컨트롤러 — 탭 순환 / 호버 시 정지
     ======================================================== */
  const BUILDERS = { shop: buildShop, macro: buildMacro, blog: buildBlog, booking: buildBooking, game: buildGame };
  const URLS = {
    shop: "jeju-mandarin.co.kr / 예약판매",
    macro: "order-bot · 실행 콘솔",
    blog: "making-notes.kr / 글 목록",
    booking: "seoul-barun.dental / 예약",
    game: "jumpup.event / play",
  };

  function init() {
    injectCSS();
    const screen = document.querySelector("[data-live-screen]");
    if (!screen) return;
    const tabs = Array.from(document.querySelectorAll("[data-live-tab]"));
    const urlEl = document.querySelector("[data-live-url]");
    const panes = {};

    tabs.forEach((tab) => {
      const key = tab.dataset.liveTab;
      const pane = document.createElement("div");
      pane.className = "pane";
      pane.setAttribute("role", "tabpanel");
      screen.appendChild(pane);
      BUILDERS[key](pane);
      panes[key] = pane;
    });

    let idx = 0;
    let timer = null;
    const order = tabs.map((t) => t.dataset.liveTab);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function show(i) {
      idx = (i + order.length) % order.length;
      order.forEach((k, n) => {
        const on = n === idx;
        panes[k].classList.toggle("is-active", on);
        tabs[n].setAttribute("aria-selected", on ? "true" : "false");
        if (!on && panes[k]._stop) panes[k]._stop();
        if (on && panes[k]._play) panes[k]._play();
      });
      if (urlEl) urlEl.textContent = URLS[order[idx]];
      // 진행바 애니메이션 재시작
      const fill = tabs[idx].querySelector(".fill");
      if (fill) {
        fill.style.animation = "none";
        void fill.offsetWidth;
        fill.style.animation = "";
      }
    }

    function play() {
      stop();
      if (reduce) return;
      timer = setInterval(() => show(idx + 1), 4600);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    tabs.forEach((tab, n) =>
      tab.addEventListener("click", () => {
        show(n);
        stop();
      })
    );

    const frame = document.querySelector("[data-live-frame]");
    if (frame) {
      frame.addEventListener("mouseenter", stop);
      frame.addEventListener("mouseleave", play);
      frame.addEventListener("focusin", stop);
    }

    show(0);
    play();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
