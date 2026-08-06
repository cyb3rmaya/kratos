/* ============================================================
   setup-dns.mjs — Cloudflare 에 DNS 를 자동으로 설정합니다

     node setup-dns.mjs

   토큰은 C:\site\.cf-token 파일에서 읽습니다 (git 에 올라가지 않습니다).
   환경변수 CF_API_TOKEN 으로 줘도 됩니다.

   하는 일
     1) 토큰 확인
     2) kratos1.cloud 존이 없으면 생성
     3) A 레코드 4개 + CNAME 1개 등록 (전부 proxied=false)
     4) 카페24 에 넣을 네임서버 2개를 출력

   ※ GitHub Pages 는 Cloudflare 프록시(주황 구름)를 켜면 인증서 발급에
     실패하므로, 이 스크립트는 모든 레코드를 DNS only 로 만듭니다.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DOMAIN = process.argv[2] || "kratos1.cloud";
const PAGES_HOST = "cyb3rmaya.github.io";
const PAGES_IP = ["185.199.108.153", "185.199.109.153", "185.199.110.153", "185.199.111.153"];

/* ---------- 토큰 ---------- */
const tokenFile = path.join(ROOT, ".cf-token");
let TOKEN = process.env.CF_API_TOKEN || "";
if (!TOKEN && fs.existsSync(tokenFile)) TOKEN = fs.readFileSync(tokenFile, "utf8").trim();
if (!TOKEN) {
  console.error(`
Cloudflare API 토큰이 없습니다.

  1) https://dash.cloudflare.com/profile/api-tokens 접속
  2) [Create Token] → [Create Custom Token] 선택
  3) 권한 2줄을 아래처럼 넣습니다

       Account | Account Settings | Read
       Zone    | DNS              | Edit

     그리고 Zone Resources 를 'All zones' 로 둡니다.
  4) 만들어진 토큰 문자열을 복사해 아래 파일로 저장하세요

       ${tokenFile}

  ※ 이 파일은 .gitignore 에 들어 있어 저장소에 올라가지 않습니다.
    설정이 끝나면 Cloudflare 에서 토큰을 삭제하셔도 됩니다.`);
  process.exit(1);
}

/* ---------- API ---------- */
const api = async (endpoint, init = {}) => {
  const r = await fetch("https://api.cloudflare.com/client/v4" + endpoint, {
    ...init,
    headers: {
      authorization: "Bearer " + TOKEN,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  const j = await r.json().catch(() => ({}));
  if (!j.success) {
    const msg = (j.errors || []).map((e) => `${e.code} ${e.message}`).join(" / ") || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return j;
};

/* ---------- 1. 토큰 확인 ---------- */
console.log("토큰 확인 중…");
await api("/user/tokens/verify");
console.log("  사용 가능 ✓\n");

/* ---------- 2. 존 확보 ---------- */
console.log(`존 확인 — ${DOMAIN}`);
let zone = (await api(`/zones?name=${DOMAIN}`)).result[0];

if (!zone) {
  console.log("  없어서 새로 만듭니다…");
  const accounts = (await api("/accounts")).result;
  if (!accounts.length) throw new Error("계정을 찾을 수 없습니다. 토큰 권한에 Account Settings:Read 가 있는지 확인하세요.");
  zone = (await api("/zones", {
    method: "POST",
    body: JSON.stringify({ name: DOMAIN, account: { id: accounts[0].id }, type: "full" }),
  })).result;
  console.log(`  생성됨 (${accounts[0].name})`);
} else {
  console.log(`  이미 있습니다 — 상태: ${zone.status}`);
}

/* ---------- 3. 레코드 ---------- */
const want = [
  ...PAGES_IP.map((ip) => ({ type: "A", name: DOMAIN, content: ip })),
  { type: "CNAME", name: "www." + DOMAIN, content: PAGES_HOST },
].map((r) => ({ ...r, ttl: 1, proxied: false }));

console.log("\n레코드 등록 (전부 DNS only — 프록시 끔)");
const existing = (await api(`/zones/${zone.id}/dns_records?per_page=100`)).result;

for (const rec of want) {
  const dup = existing.find(
    (e) => e.type === rec.type && e.name === rec.name && e.content.replace(/\.$/, "") === rec.content
  );
  const label = `${rec.type.padEnd(5)} ${rec.name.replace(DOMAIN, "@").padEnd(6)} → ${rec.content}`;

  if (dup) {
    if (dup.proxied) {
      await api(`/zones/${zone.id}/dns_records/${dup.id}`, {
        method: "PATCH",
        body: JSON.stringify({ proxied: false }),
      });
      console.log(`  수정  ${label}   (주황 구름 → 회색)`);
    } else {
      console.log(`  그대로 ${label}`);
    }
    continue;
  }
  await api(`/zones/${zone.id}/dns_records`, { method: "POST", body: JSON.stringify(rec) });
  console.log(`  추가  ${label}`);
}

/* 잘못 켜진 프록시가 남아 있으면 정리 */
const after = (await api(`/zones/${zone.id}/dns_records?per_page=100`)).result;
const stillProxied = after.filter((r) => r.proxied);
for (const r of stillProxied) {
  await api(`/zones/${zone.id}/dns_records/${r.id}`, {
    method: "PATCH", body: JSON.stringify({ proxied: false }),
  });
  console.log(`  수정  ${r.type} ${r.name} — 프록시 껐습니다`);
}

/* ---------- 4. 결과 ---------- */
console.log(`
${"─".repeat(64)}
레코드 설정이 끝났습니다.
`);

if (zone.status === "active") {
  console.log("이 도메인은 이미 Cloudflare 를 쓰고 있습니다. 바로 연결하면 됩니다:\n");
  console.log("  node set-domain.mjs " + DOMAIN);
} else {
  console.log("마지막 한 단계가 남았습니다 — 카페24에서 네임서버를 바꿔주세요.\n");
  console.log("  카페24 → 도메인관리 → 도메인 정보변경 → 네임서버 변경\n");
  (zone.name_servers || []).forEach((ns, i) => console.log(`    ${i + 1}차 네임서버   ${ns}`));
  console.log(`
  기존에 적힌 ns1.cafe24.com 등은 지우고 위 두 개로 바꾸시면 됩니다.
  반영에 30분~2시간 걸리며, 그동안 기존 사이트 주소는 그대로 열립니다.`);
}
