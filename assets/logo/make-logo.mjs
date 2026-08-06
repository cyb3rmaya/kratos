/* ============================================================
   make-logo.mjs — KRATOS 로고 SVG · PNG 생성

     node assets/logo/make-logo.mjs

   SVG 를 먼저 쓰고, 헤드리스 크롬으로 PNG 를 렌더합니다.
   사이트와 같은 Pretendard 를 심어 글자 모양이 정확히 일치합니다.
   ============================================================ */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.join(HERE, "..", "fonts");
const TMP = path.join(HERE, ".tmp");

const BLUE = "#4c6fff";
const MINT = "#22d3a6";
const INK = "#f2f4f9";
const DIM = "#8b93a7";
const DARK = "#0e1017";

const CHROME = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((p) => fs.existsSync(p));
if (!CHROME) { console.error("크롬/엣지를 찾지 못했습니다."); process.exit(1); }

/* ---------- 심볼 (48 높이 기준) ---------- */
const symbol = (x = 4, w = 5) => `
    <rect x="${x}" y="8" width="${w}" height="32" rx="${w / 2}" fill="${BLUE}"/>
    <path d="M${x + w} 24 L${x + w + 19} 9" stroke="${BLUE}" stroke-width="${w}" stroke-linecap="round" fill="none"/>
    <path d="M${x + w} 24 L${x + w + 19} 39" stroke="${MINT}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;

const FF = `Pretendard, system-ui, -apple-system, 'Segoe UI', sans-serif`;

/* ---------- SVG 정의 ---------- */
const SVGS = {
  "kratos-logo": {
    w: 196, h: 48, desc: "헤더 로고 (심볼 + 워드마크)",
    body: `${symbol()}
    <text x="40" y="34" font-family="${FF}" font-size="29" font-weight="800" letter-spacing="-0.6" fill="${INK}">KRATOS</text>`,
  },
  "kratos-symbol": {
    w: 48, h: 48, desc: "심볼 (파비콘 · 앱 아이콘)",
    body: symbol(14, 5),
  },
  "kratos-wordmark": {
    w: 156, h: 48, desc: "워드마크 (글자만)",
    body: `<text x="0" y="34" font-family="${FF}" font-size="29" font-weight="800" letter-spacing="-0.6" fill="${INK}">KRATOS</text>`,
  },
  "kratos-full": {
    w: 246, h: 92, desc: "풀 로고 (태그라인 포함)",
    body: `<g transform="translate(4, 12) scale(1.3)">${symbol(0, 5)}</g>
    <text x="50" y="50" font-family="${FF}" font-size="38" font-weight="800" letter-spacing="-0.9" fill="${INK}">KRATOS</text>
    <text x="52" y="72" font-family="${FF}" font-size="13.5" font-weight="500" letter-spacing="0.1" fill="${DIM}">코드로 되는 건 다 만듭니다</text>`,
  },
};

/* ---------- SVG 파일 쓰기 ---------- */
fs.mkdirSync(TMP, { recursive: true });
for (const [name, s] of Object.entries(SVGS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.w} ${s.h}" width="${s.w}" height="${s.h}" role="img" aria-label="KRATOS">
  <title>KRATOS — ${s.desc}</title>${s.body}
</svg>
`;
  fs.writeFileSync(path.join(HERE, name + ".svg"), svg, "utf8");
}
console.log(`SVG ${Object.keys(SVGS).length}개 생성`);

/* ---------- PNG 렌더 ---------- */
const fontFaces = fs.existsSync(FONTS)
  ? fs.readdirSync(FONTS).filter((f) => f.endsWith(".woff2")).map((f) => {
      const m = f.match(/-(\d{3})\./);
      const b64 = fs.readFileSync(path.join(FONTS, f)).toString("base64");
      return `@font-face{font-family:Pretendard;font-weight:${m ? m[1] : 400};font-display:block;` +
             `src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
    }).join("\n")
  : "";

function png(name, s, scale, bg, suffix = "") {
  const W = Math.round(s.w * scale), H = Math.round(s.h * scale);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${fontFaces}
*{margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${bg || "transparent"}}
svg{display:block;width:${W}px;height:${H}px}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s.w} ${s.h}">${s.body}</svg>
</body></html>`;

  const hf = path.join(TMP, `${name}${suffix}.html`);
  fs.writeFileSync(hf, html, "utf8");
  const out = path.join(HERE, `${name}${suffix}.png`);

  const args = ["--headless=new", "--disable-gpu", "--hide-scrollbars"];
  // 투명 배경일 때만 지정합니다. 빈 값으로 넘기면 크롬이 렌더를 건너뜁니다.
  if (!bg) args.push("--default-background-color=00000000");
  args.push(
    `--window-size=${W},${H}`,
    `--screenshot=${out}`,
    "file:///" + hf.replace(/\\/g, "/"),
  );
  execFileSync(CHROME, args, { stdio: ["ignore", "pipe", "pipe"], timeout: 60000 });

  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`  ${path.basename(out).padEnd(30)} ${String(W).padStart(4)}×${String(H).padEnd(4)}  ${kb.padStart(4)} KB`);
}

console.log("\nPNG 렌더 중 (투명 배경)");
for (const [name, s] of Object.entries(SVGS)) {
  png(name, s, 2, null, "@2x");
  png(name, s, 4, null, "@4x");
}

console.log("\nPNG 렌더 중 (어두운 배경 — 발표자료·SNS용)");
for (const name of ["kratos-logo", "kratos-full"]) {
  png(name, SVGS[name], 4, DARK, "-dark");
}

/* 파비콘용 정사각 */
console.log("\n파비콘");
for (const size of [512, 256, 64]) {
  png("kratos-symbol", SVGS["kratos-symbol"], size / 48, null, `-${size}`);
}

/* SNS 공유 카드 — 카카오톡·슬랙 등에서 링크를 펼칠 때 보이는 그림 */
console.log("\nSNS 공유 카드");
png("kratos-og", {
  w: 600, h: 315,
  body: `<rect width="600" height="315" fill="${DARK}"/>
  <rect x="0" y="0" width="600" height="3" fill="${BLUE}"/>
  <g transform="translate(56, 88) scale(1.5)">${symbol(0, 5)}</g>
  <text x="126" y="152" font-family="${FF}" font-size="52" font-weight="800" letter-spacing="-1.4" fill="${INK}">KRATOS</text>
  <text x="129" y="182" font-family="${FF}" font-size="17" font-weight="500" fill="${DIM}">코드로 되는 건 다 만듭니다</text>
  <text x="57" y="240" font-family="${FF}" font-size="16" font-weight="700">
    <tspan fill="${BLUE}">웹 개발</tspan><tspan fill="${DIM}" dx="13" font-weight="400">·</tspan><tspan fill="${MINT}" dx="13">매크로 자동화</tspan><tspan fill="${DIM}" dx="13" font-weight="400">·</tspan><tspan fill="#ffb020" dx="13">게임 개발</tspan>
  </text>
  <text x="57" y="272" font-family="${FF}" font-size="14" font-weight="500" fill="${DIM}">작업물 21건 · 눌러보는 데모 8종</text>`,
}, 2, DARK, "");

fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n완료 — ${HERE}`);
