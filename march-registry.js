export function initArmyRegistry() {
  if (window.__armyRegistryInitialized) return;
  window.__armyRegistryInitialized = true;

  const nameInput = document.getElementById("armyName");
  const travelInput = document.getElementById("armyTravel");
  const saveBtn = document.getElementById("armySaveBtn");
  const listBody = document.getElementById("armyList");
  const STORAGE_KEY = "marchRegistry";

  function loadData() {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    render(data);
  }

  function render(data) {
    listBody.innerHTML = "";
    data.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="checkbox" class="army-check" data-idx="${idx}" ${item.checked ? "checked" : ""}></td>
        <td><input type="text" value="${item.name}" data-idx="${idx}" class="edit-name"></td>
        <td><input type="number" value="${item.travel}" data-idx="${idx}" class="edit-travel"></td>
        <td><button data-idx="${idx}" class="deleteBtn">削除</button></td>
      `;
      listBody.appendChild(tr);
    });
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  saveBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const travel = parseInt(travelInput.value, 10) || 0;
    if (!name) return alert("行軍名を入力してください。");

    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const existing = data.find(d => d.name === name);
    if (existing) {
      existing.travel = travel;
    } else {
      data.push({ name, travel, checked: true }); // ✅ 新規はチェック付きで登録
    }
    saveData(data);
    loadData();
    nameInput.value = "";
    travelInput.value = "";
  });

  // 削除
  listBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("deleteBtn")) {
      const idx = e.target.dataset.idx;
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      data.splice(idx, 1);
      saveData(data);
      loadData();
    }
  });

  // 編集・チェック更新
  listBody.addEventListener("change", (e) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const idx = e.target.dataset.idx;

    if (e.target.classList.contains("edit-name")) {
      data[idx].name = e.target.value;
    } else if (e.target.classList.contains("edit-travel")) {
      data[idx].travel = parseInt(e.target.value, 10) || 0;
    } else if (e.target.classList.contains("army-check")) {
      data[idx].checked = e.target.checked;
    }
    saveData(data);
  });

  loadData();
}

// ===============================
// 🔰 HKZボタン（行軍登録データの読込）
// ===============================
function loadArmyRegistry() {
  const data = JSON.parse(localStorage.getItem("marchRegistry") || "[]");
  const filtered = data.filter(d => d.checked); // ✅ チェックされているものだけ反映
  if (!filtered.length) {
    alert("反映対象が選択されていません。");
    return [];
  }
  return filtered;
}

// プルダウン自動拡張ヘルパー
function ensureOption(select, n) {
  if (!select) return;
  const currentMax = parseInt(select.options[select.options.length - 1].value, 10);
  if (n > currentMax) {
    for (let i = currentMax + 1; i <= n; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = i;
      select.appendChild(opt);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {

  // ---- 集結くん ----
  document.getElementById("loadArmyBtn")?.addEventListener("click", () => {
    const registry = loadArmyRegistry();
    if (!registry.length) return;

    const countSel = document.getElementById("marchCount");
    ensureOption(countSel, registry.length); // 🔹上限拡張
    countSel.value = String(registry.length);

    // 既存ボタンで行再生成
    document.getElementById("applyCountBtn")?.click();

    const rows = document.querySelectorAll("#tbody tr");
    rows.forEach((row, i) => {
      const r = registry[i];
      if (!r) return;
      const nameInput = row.querySelector(".name");
      const travelInput = row.querySelector(".travel");
      if (nameInput) nameInput.value = r.name;
      if (travelInput) travelInput.value = r.travel;
    });

    alert(`登録済みデータ（${registry.length}件）を反映しました。`);
  });

  // ---- 差し込みさん ----
  document.getElementById("loadArmyBtnSasikomi")?.addEventListener("click", () => {
    const registry = loadArmyRegistry();
    if (!registry.length) return;

    const personSel = document.getElementById("personCount");
    ensureOption(personSel, registry.length); // 🔹上限拡張
    personSel.value = String(registry.length);

    // 既存ボタンで行再生成
    document.getElementById("applyPersonBtn")?.click();

    const rows = document.querySelectorAll("#sasikomiBody tr");
    rows.forEach((row, i) => {
      const r = registry[i];
      if (!r) return;
      const nameInput = row.querySelector(".s-name");
      const travelInput = row.querySelector(".s-travel") || row.querySelector("td:nth-child(3) input");
      if (nameInput) nameInput.value = r.name;
      if (travelInput) travelInput.value = r.travel;
    });

    alert(`登録済みデータ（${registry.length}件）を反映しました。`);
  });
});
