/* ============================================================
   build.mjs — 배포용 단일 HTML 파일 생성

     node build.mjs      →  dist/index.html

   index.html + CSS + JS + 폰트 + 데모 5종을 파일 하나로 묶습니다.
   외부 요청이 0건이라 CDN을 막는 환경(사내망, CSP가 엄격한 호스팅,
   Claude Artifact 등)에서도 그대로 동작합니다.

   ※ 일반 웹호스팅(Netlify·Vercel·가비아)에 올릴 때는 이 파일이
     필요 없습니다. site 폴더를 통째로 올리면 됩니다.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const p = (...s) => path.join(ROOT, ...s);
const read = (f) => fs.readFileSync(p(f), "utf8");
const b64 = (f) => fs.readFileSync(p(f)).toString("base64");

/* ---------- 1. 폰트를 data URI 로 ---------- */
const FONTS = [
  ["Paperlogy", "assets/fonts/Paperlogy-8ExtraBold.woff2", 800, "normal"],
  ["Paperlogy", "assets/fonts/Paperlogy-9Black.woff2", 900, "normal"],
  ["Pretendard", "assets/fonts/Pretendard-Regular.woff2", 400, "normal"],
  ["Pretendard", "assets/fonts/Pretendard-SemiBold.woff2", 600, "normal"],
  ["Pretendard", "assets/fonts/Pretendard-Bold.woff2", 700, "normal"],
  ["JetBrains Mono", "assets/fonts/jbmono-400.woff2", 400, "normal"],
  ["JetBrains Mono", "assets/fonts/jbmono-700.woff2", 700, "normal"],
];

const fontCSS = FONTS.map(
  ([fam, file, weight]) =>
    `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${b64(file)}) format("woff2");` +
    `font-weight:${weight};font-style:normal;font-display:swap}`
).join("\n");

/* ---------- 2. 스타일시트 ----------
   inlineFonts = true  → 폰트를 base64 로 내장 (외부 요청 0건)
   inlineFonts = false → 폰트를 CDN 에서 (파일이 10분의 1로 작아짐) */
function buildCSS(inlineFonts) {
  const raw = read("assets/css/style.css").replace(/@charset\s+"[^"]*";\s*/g, "");
  if (!inlineFonts) return raw; // @import·@font-face 를 그대로 둡니다
  return (
    fontCSS +
    "\n" +
    raw
      .replace(/@import\s+url\([^)]*\);\s*/g, "")
      // CDN 을 가리키던 기존 @font-face 블록 제거
      .replace(/@font-face\s*\{[^}]*\}/g, "")
      // 변수 폰트 이름(Pretendard Variable)은 내장본에 없으므로 정리
      .replace(/"Pretendard Variable",\s*/g, "")
  );
}

/* ---------- 3. 데모 5종을 iframe srcdoc 용으로 가공 ---------- */
const DEMOS = ["shop", "blog", "booking", "game", "macro", "admin", "quiz", "sync"];

/* 데모는 iframe 안에서 뜨므로 웹폰트 대신 시스템 폰트를 씁니다
   (본문 폰트를 데모마다 중복 내장하면 파일이 5배로 불어납니다) */
const demoCSS = read("demo/demo.css")
  .replace(/@charset\s+"[^"]*";\s*/g, "")
  .replace(/@import\s+url\([^)]*\);\s*/g, "")
  .replace(
    /--mono:[^;]+;/,
    `--mono: ui-monospace, SFMono-Regular, Consolas, "D2Coding", monospace;`
  )
  .replace(
    /--body:[^;]+;/,
    `--body: "Pretendard", -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif;`
  );

const demoHTML = {};
for (const d of DEMOS) {
  demoHTML[d] = read(`demo/${d}/index.html`)
    // 외부 스타일시트 링크를 내용으로 치환
    .replace(
      /<link[^>]+href="\.\.\/demo\.css"[^>]*>/,
      `<style>\n${demoCSS}\n</style>`
    )
    // '포트폴리오로 돌아가기'는 부모 창에 닫기 요청을 보내도록
    .replace(
      /<a class="kbar-back"[^>]*>([\s\S]*?)<\/a>/,
      `<button class="kbar-back" onclick="parent.postMessage('kratos:close-demo','*')">$1</button>`
    );
}

/* ---------- 4. 데모 오버레이 (배포본 전용) ---------- */
const overlayCSS = `
.demo-ov{position:fixed;inset:0;z-index:400;display:none;background:rgba(5,6,10,.9);
  backdrop-filter:blur(6px);padding:0}
.demo-ov.is-open{display:flex;flex-direction:column}
.demo-ov-bar{display:flex;align-items:center;gap:12px;padding:10px 16px;
  background:var(--bg-deep);border-bottom:1px solid var(--line);flex:none}
.demo-ov-bar b{font-family:var(--display);font-weight:800;font-size:14px;letter-spacing:-.02em}
.demo-ov-tag{font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:var(--amber);
  border:1px solid rgba(255,176,32,.4);padding:3px 7px;border-radius:4px}
.demo-ov-note{font-size:12.5px;color:var(--dim)}
.demo-ov-x{margin-left:auto;border:1px solid var(--line-strong);background:transparent;
  color:var(--text);border-radius:var(--r-chip);padding:8px 16px;font-size:13px;font-weight:600}
.demo-ov-x:hover{border-color:var(--cobalt);background:rgba(76,111,255,.1)}
.demo-ov iframe{flex:1;width:100%;border:0;background:#fff}
@media (max-width:700px){.demo-ov-note{display:none}}
`;

const overlayJS = `
/* 배포본은 파일이 하나뿐이라 데모를 iframe 으로 띄웁니다 */
(function(){
  var DEMOS = __DEMO_DATA__;
  var NAMES = {shop:"쇼핑몰",blog:"블로그",booking:"예약",game:"웹게임",macro:"업무 자동화",
               admin:"배차 관제",quiz:"실시간 퀴즈쇼",sync:"재고 동기화"};
  var ov = document.createElement("div");
  ov.className = "demo-ov";
  ov.innerHTML = '<div class="demo-ov-bar"><b>KRATOS</b>'
    + '<span class="demo-ov-tag">DEMO</span>'
    + '<span class="demo-ov-note" data-demo-name></span>'
    + '<button class="demo-ov-x" data-demo-close>닫기 ✕</button></div>'
    + '<iframe title="데모" sandbox="allow-scripts allow-same-origin"></iframe>';
  document.body.appendChild(ov);
  var frame = ov.querySelector("iframe");
  var nameEl = ov.querySelector("[data-demo-name]");
  var lastFocus = null;

  function open(key){
    if(!DEMOS[key]) return;
    lastFocus = document.activeElement;
    nameEl.textContent = (NAMES[key]||key) + " 데모 — 실제로 동작합니다";
    frame.srcdoc = DEMOS[key];
    ov.classList.add("is-open");
    document.body.style.overflow = "hidden";
    ov.querySelector("[data-demo-close]").focus();
  }
  function close(){
    ov.classList.remove("is-open");
    frame.srcdoc = "";
    document.body.style.overflow = "";
    if(lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", function(e){
    var a = e.target.closest('a[href^="demo/"]');
    if(a){
      e.preventDefault();
      var m = a.getAttribute("href").match(/^demo\\/([^/]+)/);
      if(m) open(m[1]);
      return;
    }
    if(e.target.closest("[data-demo-close]")) close();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && ov.classList.contains("is-open")) close();
  });
  window.addEventListener("message", function(e){
    if(e.data === "kratos:close-demo") close();
  });
})();
`.replace(
  "__DEMO_DATA__",
  // 데모 HTML 안에는 </script> 가 들어 있습니다. 그대로 인라인 스크립트에 넣으면
  // 그 지점에서 <script> 블록이 끝나 버리므로 '<' 를 유니코드 이스케이프로 바꿉니다.
  () => JSON.stringify(demoHTML).replace(/</g, "\\u003c")
);

/* ---------- 5. 조립 ---------- */
/* 소스 어디든 닫는 script 태그가 그대로 들어 있으면 (주석·문자열 포함)
   인라인 <script> 블록이 그 지점에서 끝나 버려 문법 오류가 납니다.
   자바스크립트에서 <\/script 는 </script 와 뜻이 같으므로 안전하게 바꿔 둡니다. */
const guardScriptTag = (src) => src.replace(/<\/(script)/gi, "<\\/$1");

const js = ["assets/js/data.js", "assets/js/live-screen.js", "assets/js/main.js"]
  .map(read)
  .map(guardScriptTag)
  .join("\n;\n");

function assemble(inlineFonts) {
  let out = read("index.html")
    .replace(/<link rel="stylesheet" href="assets\/css\/style\.css">/, "<style>\n__CSS__\n</style>")
    .replace(/\s*<script src="assets\/js\/[^"]+"><\/script>/g, "")
    .replace(/<\/body>/, "<script>\n__JS__\n</script>\n</body>")
    // 배포본에서는 README 대신 안내 문구
    .replace(
      /실제 프로젝트로 교체한 뒤 공개하세요\. 교체 방법은 <code>README\.md<\/code>에 있습니다\./,
      "실제 프로젝트로 교체한 뒤 공개하세요. 교체는 <code>assets/js/data.js</code> 한 파일에서 끝납니다."
    );
  /* $ 를 포함한 치환 문자열이 특수문자로 해석되지 않도록 함수 형태로 넣습니다 */
  return out
    .replace("__CSS__", () => buildCSS(inlineFonts) + "\n" + overlayCSS)
    .replace("__JS__", () => js + "\n" + overlayJS);
}

const html = assemble(true);    // 완전 자립형 — 외부 요청 0건
const hosted = assemble(false); // 웹 호스팅용 — 폰트만 CDN

fs.mkdirSync(p("dist"), { recursive: true });
fs.writeFileSync(p("dist/index.html"), html, "utf8");
fs.writeFileSync(p("dist/hosted.html"), hosted, "utf8");

/* ---------- 6. Artifact 용 조각 파일 ----------
   Claude Artifact 는 <!doctype>/<html>/<head>/<body> 골격을 스스로 씌웁니다.
   그래서 문서 전체가 아니라 '본문 + 스타일 + 스크립트' 만 담은 판을 따로 만듭니다. */
const bodyInner = html.slice(
  html.indexOf("<body>") + "<body>".length,
  html.lastIndexOf("</body>")
);
const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [, "크라토스"])[1];
/* <style> 는 <head> 안에 있으므로 본문과 따로 꺼내 붙입니다 */
const headStyle = html.slice(
  html.indexOf("<style>"),
  html.indexOf("</style>") + "</style>".length
);

const fragment = `<title>${title}</title>\n` + headStyle + "\n" + bodyInner.trim() + "\n";

if (!/@font-face/.test(headStyle)) throw new Error("조각 파일에 스타일이 빠졌습니다");
if (!/data-work-grid/.test(bodyInner)) throw new Error("조각 파일에 본문이 빠졌습니다");

fs.writeFileSync(p("dist/artifact.html"), fragment, "utf8");

const kb = (n) => (n / 1024).toFixed(0).padStart(5) + " KB";
console.log("빌드 완료");
console.log("  dist/index.html     " + kb(Buffer.byteLength(html)) + "  자립형 (폰트 내장, 외부 요청 0건)");
console.log("  dist/hosted.html    " + kb(Buffer.byteLength(hosted)) + "  웹 호스팅용 (폰트만 CDN)");
console.log("  dist/artifact.html  " + kb(Buffer.byteLength(fragment)) + "  Claude Artifact 업로드용");
console.log("  내장 폰트           " + FONTS.length + "종");
console.log("  내장 데모           " + DEMOS.length + "종 (" + DEMOS.join(", ") + ")");
