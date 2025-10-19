// ==============================
// 集結くん＋差し込みさん (PWA) - v0.7
// ==============================

// ====== ユーティリティ ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const pad2 = (n) => String(n).padStart(2, "0");
const normalize3600 = (sec) => ((sec % 3600) + 3600) % 3600;
function formatMinSec(totalSec) {
  const s = normalize3600(Math.floor(totalSec));
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${pad2(min)}:${pad2(sec)}`;
}
function nowUtcMinSecVals(){
  const d = new Date();
  return { m: d.getUTCMinutes(), s: d.getUTCSeconds() };
}
function fillZeroTo59(selectEl, selectedVal){
  selectEl.innerHTML = "";
  for (let i=0;i<=59;i++){
    const opt = document.createElement("option");
    opt.value = i.toString();
    opt.textContent = pad2(i);
    if (i === selectedVal) opt.selected = true;
    selectEl.appendChild(opt);
  }
}
function li(text){ const el=document.createElement("li"); el.textContent=text; return el; }

// ==============================
// DOM読み込み後にすべて初期化
// ==============================
document.addEventListener("DOMContentLoaded", () => {

  // ====== タブ切替 ======
  const tabs = document.querySelectorAll(".tab");
  const pages = document.querySelectorAll(".page");
  const subtitle = document.querySelector(".sub");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // タブのactive切替
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.target;

    // ページ切替
    pages.forEach(p => {
      p.classList.toggle("active", p.id === `page-${target}`);
      p.classList.toggle("hidden", p.id !== `page-${target}`);
    });

    // サブタイトル + 背景切替
    if (target === "rally") {
      subtitle.textContent =
        "1行軍集結時刻（UTC）を基準に、着弾間隔・集結時間・移動(秒)から各行軍の集/着を計算します";
      document.body.classList.add("mode-rally");
      document.body.classList.remove("mode-sasikomi");
    } else if (target === "sasikomi") {
      subtitle.textContent =
        "着弾をもとに駐屯行軍開始時間(差し込みタイミング)を計算します";
      document.body.classList.add("mode-sasikomi");
      document.body.classList.remove("mode-rally");
    }
  });
});

  // ====== 集結くん ======
  const tbody = $("#tbody");
  function gapOptionsHTML(defaultVal=0){
    let html = "";
    for (let i=0;i<=30;i++){
      html += `<option value="${i}" ${i===defaultVal?'selected':''}>${i}</option>`;
    }
    return html;
  }
  function assembleOptionsHTML(defaultVal=300){
    return `
      <option value="60" ${defaultVal===60?'selected':''}>1分</option>
      <option value="300" ${defaultVal===300?'selected':''}>5分</option>
    `;
  }
  function buildRows(n){
    tbody.innerHTML = "";
    const count = Math.max(1, Math.min(10, n||1));
    for (let i=1;i<=count;i++){
      const tr = document.createElement("tr");
      const gapCell = (i===1)?`<td>-</td>`:`<td><select class="gap">${gapOptionsHTML(0)}</select></td>`;
      tr.innerHTML = `
        <td>${i}</td>
        <td><input type="text" class="name" value="行軍${i}"></td>
        ${gapCell}
        <td><input type="number" class="travel" min="0" step="1" value="0"></td>
        <td><select class="assemble">${assembleOptionsHTML(300)}</select></td>
      `;
      tbody.appendChild(tr);
    }
  }

  // 初期化
  (function initRally() {
    const startMin = $("#startMin");
    const startSec = $("#startSec");
    const now = nowUtcMinSecVals();
    fillZeroTo59(startMin, now.m);
    fillZeroTo59(startSec, now.s);
    buildRows(2);
  })();

  $("#applyCountBtn")?.addEventListener("click", () => {
    const n = Math.max(1, Math.min(10, parseInt($("#marchCount").value, 10) || 1));
    buildRows(n);
  });

  $("#nowUtcBtn")?.addEventListener("click", () => {
    const now = nowUtcMinSecVals();
    $("#startMin").value = now.m.toString();
    $("#startSec").value = now.s.toString();
  });

  $("#calcBtn")?.addEventListener("click", () => {
    const result = $("#result");
    result.innerHTML = "";

    const m = parseInt($("#startMin").value, 10);
    const s = parseInt($("#startSec").value, 10);
    if (Number.isNaN(m) || Number.isNaN(s)) return;
    const base = m*60 + s;

    const names = $$("#tbody .name").map(x => (x.value || "").trim() || "行軍");
    const travels = $$("#tbody .travel").map(x => Math.max(0, parseInt(x.value, 10) || 0));
    const gaps = $$("#tbody tr").map((row, idx) => idx===0?0:Math.max(0, parseInt(row.querySelector(".gap")?.value||"0",10)||0));
    const assembles = $$("#tbody .assemble").map(x => Math.max(0, parseInt(x.value, 10) || 0));

    const desiredArrives = [];
    let depart = normalize3600(base);
    let arrive = normalize3600(depart + assembles[0] + travels[0]);
    result.appendChild(li(`${names[0]}: 集 ${formatMinSec(depart)} → 着 ${formatMinSec(arrive)}`));
    desiredArrives[0] = arrive;

    for (let i=1;i<names.length;i++){
      const desiredArrive = normalize3600(arrive + gaps[i]);
      desiredArrives[i] = desiredArrive;
      depart = normalize3600(desiredArrive - assembles[i] - travels[i]);
      arrive = normalize3600(depart + assembles[i] + travels[i]);
      result.appendChild(li(`${names[i]}: 集 ${formatMinSec(depart)} → 着 ${formatMinSec(arrive)}`)); 
    }
    // === リカバリ1分集結（旧版のロジックを復活） ===
    const RECOVER = 60;   // 1分
    const FIVE = 300;     // 5分
    let printedHeader = false;

    for (let i = 0; i < names.length; i++) {
      if (assembles[i] === FIVE) {
        const desiredArrive = desiredArrives[i];
        const recoverAssemble = normalize3600(desiredArrive - RECOVER - travels[i]);
        if (!printedHeader) {
          result.appendChild(li("リカバリ1分集結"));
          printedHeader = true;
        }
        result.appendChild(li(`${names[i]} 集 ${formatMinSec(recoverAssemble)}`));
      }
    }
  });

  $("#copyBtn")?.addEventListener("click", async () => {
    const lines = $$("#result li").map(el => el.textContent).join("\n");
    if (!lines) return;
    await navigator.clipboard.writeText(lines);
  });

  // ====== 差し込みさん ======
  const sasikomiBody = $("#sasikomiBody");
  function buildSasikomiRows(n=2){
    sasikomiBody.innerHTML = "";
    for (let i=1;i<=n;i++){
      const tr=document.createElement("tr");
      tr.innerHTML = `<td>${i}</td><td><input type="text" class="s-name" value="隊${i}"></td><td><input type="number" class="s-travel" min="0" step="1" value="0"></td>`;
      sasikomiBody.appendChild(tr);
    }
  }
  buildSasikomiRows(2);

  $("#applyPersonBtn")?.addEventListener("click",()=>{
    const n=parseInt($("#personCount").value,10)||1;
    buildSasikomiRows(n);
  });

  fillZeroTo59($("#enemyMin"),0);
  fillZeroTo59($("#enemySec"),0);

  $("#nowEnemyBtn")?.addEventListener("click",()=>{
    const now=nowUtcMinSecVals();
    $("#enemyMin").value=now.m;
    $("#enemySec").value=now.s;
  });

  $("#sasikomiCalcBtn")?.addEventListener("click",()=>{
    const result=$("#sasikomiResult");
    result.innerHTML="";
    const m=parseInt($("#enemyMin").value,10);
    const s=parseInt($("#enemySec").value,10);
    const after=parseInt($("#afterSec").value,10)||0;
    const base=m*60+s;
    const names=$$(".s-name").map(i=>i.value.trim()||"隊");
    const travels=$$(".s-travel").map(i=>parseInt(i.value,10)||0);
    names.forEach((name,i)=>{
      const depart=normalize3600(base+after-travels[i]);
      result.appendChild(li(`${name}: 出発 ${formatMinSec(depart)}`));
    });
  });

  $("#sasikomiCopyBtn")?.addEventListener("click",async()=>{
    const lines=$$("#sasikomiResult li").map(el=>el.textContent).join("\n");
    if (!lines) return;
    await navigator.clipboard.writeText(lines);
  });

  // ====== Service Worker ======
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").catch(console.warn);
  }

    document.body.classList.add("mode-rally");
});
