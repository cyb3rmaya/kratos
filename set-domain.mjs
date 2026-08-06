/* ============================================================
   set-domain.mjs — 내 도메인을 사이트에 연결합니다

     node set-domain.mjs kratos1.cloud

   하는 일
     1) 도메인이 GitHub Pages 를 가리키도록 DNS 가 설정됐는지 먼저 확인
     2) CNAME 파일 생성 후 커밋·푸시
     3) GitHub Pages 에 커스텀 도메인 등록 + HTTPS 강제

   ※ 도메인 구입과 DNS 등록을 끝낸 뒤에 실행하세요.
     DNS 없이 실행하면 기존 주소가 404 가 되므로, 이 스크립트는
     DNS 가 확인되지 않으면 중단합니다.
   ============================================================ */
import { execFileSync } from "node:child_process";
import { promises as dns } from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = "cyb3rmaya/cyb3rmaya.github.io";
const PAGES_IP = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"];
const PAGES_HOST = "cyb3rmaya.github.io";

const domain = (process.argv[2] || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
  console.error("사용법: node set-domain.mjs kratos1.cloud");
  process.exit(1);
}

const sh = (cmd, args) =>
  execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

/* ---------- 1. DNS 확인 ---------- */
console.log(`DNS 확인 중 — ${domain}`);
let dnsOk = false;
try {
  if (domain.split(".").length > 2) {
    // www 처럼 서브도메인이면 CNAME 이 github.io 를 가리켜야 합니다
    const c = await dns.resolveCname(domain).catch(() => []);
    dnsOk = c.some((v) => v.replace(/\.$/, "").toLowerCase() === PAGES_HOST);
    console.log(`  CNAME → ${c.length ? c.join(", ") : "(없음)"}`);
  }
  if (!dnsOk) {
    const a = await dns.resolve4(domain).catch(() => []);
    dnsOk = a.some((v) => PAGES_IP.includes(v));
    console.log(`  A     → ${a.length ? a.join(", ") : "(없음)"}`);
  }
} catch (e) {
  console.log("  조회 실패: " + e.message);
}

if (!dnsOk) {
  console.error(`
DNS 가 아직 GitHub Pages 를 가리키지 않습니다. 먼저 도메인 구입처의
DNS 관리 화면에서 아래를 등록하고, 10분~1시간 뒤 다시 실행하세요.

  A     @     185.199.108.153
  A     @     185.199.109.153
  A     @     185.199.110.153
  A     @     185.199.111.153
  CNAME www   ${PAGES_HOST}.

(등록 직후에는 전파가 안 되어 실패할 수 있습니다. 조급해하지 않으셔도 됩니다.)`);
  process.exit(1);
}
console.log("  확인됨 ✓\n");

/* ---------- 2. CNAME 커밋 ---------- */
fs.writeFileSync(path.join(ROOT, "CNAME"), domain + "\n", "utf8");
console.log(`CNAME 파일 생성 — ${domain}`);
try {
  sh("git", ["add", "CNAME"]);
  sh("git", ["commit", "-m", `커스텀 도메인 ${domain} 연결`]);
  sh("git", ["push", "origin", "main"]);
  console.log("  커밋·푸시 완료 ✓");
} catch (e) {
  const msg = String(e.stdout || "") + String(e.stderr || "");
  if (/nothing to commit/.test(msg)) console.log("  이미 반영되어 있습니다");
  else { console.error("  git 실패:\n" + msg); process.exit(1); }
}

/* ---------- 3. Pages 설정 ---------- */
const tmp = path.join(ROOT, ".domain.tmp.json");
try {
  fs.writeFileSync(tmp, JSON.stringify({ cname: domain, https_enforced: true }), "utf8");
  sh("gh", ["api", "-X", "PUT", `repos/${REPO}/pages`, "--input", tmp]);
  console.log(`GitHub Pages 커스텀 도메인 등록 완료 ✓`);
} catch (e) {
  console.error("Pages 설정 실패:\n" + (e.stdout || "") + (e.stderr || ""));
  console.error("저장소 Settings → Pages → Custom domain 에서 직접 입력해도 됩니다.");
} finally {
  fs.rmSync(tmp, { force: true });
}

console.log(`
완료했습니다.

  https://${domain}/

인증서 발급에 10~30분 걸립니다. 그 전까지는 보안 경고가 뜰 수 있는데 정상입니다.
발급이 끝나면 저장소 Settings → Pages 에서 'Enforce HTTPS' 가 켜졌는지 확인하세요.
기존 주소(https://${PAGES_HOST}/)는 새 주소로 자동 연결됩니다.`);
