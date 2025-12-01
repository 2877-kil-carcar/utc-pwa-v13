import { CharacterSkills, collectBuffs } from "./skills-data.js";

// =====================================================
// 共通ステータス
// =====================================================
const baseStats = {
  atk: 10000,  // 攻撃力
  def: 10000,  // 防御力
  leth: 10000, // 殺傷力
  hp: 100, // HP
  coef: 1.0 // 基礎係数
};

// =====================================================
// 英雄選択ユーティリティ
// =====================================================
function getSelectedHeroes(ids) {
  return ids
    .map(id => document.getElementById(id)?.value)
    .filter(v => v)
    .map(name => CharacterSkills.find(c => c.name === name))
    .filter(Boolean);
}

// =====================================================
// 減少バフ積算（type:7 与ダメ減少 / type:9 被ダメ減少）
// collectBuffs と完全に同じ期待値仕様
// =====================================================
function calcStackedReduction(heroes, type) {
  const group = heroes
    .flatMap(c => c.skills)
    .filter(s => s.type === type);

  // スキルなし → 軽減なし（0）
  if (group.length === 0) return 0;

  let mult = 1; // ∏(1 - rate)

  for (const s of group) {
    let rate = 0;

    // -----------------------------------------
    // ▼ 通常の固定スキル（例：セルゲイ 20%）
    // -----------------------------------------
    if (typeof s.buff === "number") {
      rate = s.buff / 100;
    }

    // -----------------------------------------
    // ▼ アクモスなど兵種別の軽減スキル
    //    shield/spear/bow を持つものに該当
    // -----------------------------------------
    else if (
      typeof s.shield === "number" ||
      typeof s.spear === "number" ||
      typeof s.bow === "number"
    ) {
      // 兵士割合（固定 6:2:2）
      const S = 6, P = 2, B = 2;

      // 兵種平均の軽減率（％）
      const avgPct =
        ((s.shield ?? 0) * S +
         (s.spear  ?? 0) * P +
         (s.bow    ?? 0) * B) /
        (S + P + B);

      const baseRate = avgPct / 100; // 兵種平均（例 54% → 0.54）

      // 発動確率（p）、持続ターン（L）
      const p = s.p ?? 1;
      const L = s.L ?? 1;

      // 有効発動率（例 0.25 * 2 = 0.5）
      const effectiveP = Math.min(1, p * L);

      // 期待値（例 0.54 × 0.5 = 0.27）
      rate = baseRate * effectiveP;
    }

    // -----------------------------------------
    // ▼ スタックは乗算
    // -----------------------------------------
    mult *= (1 - rate);
  }

  // 軽減率（0〜1）で返す
  return 1 - mult;
}

// =====================================================
// ダメージ計算（修正版：攻撃側バフ／防御側デバフ対応）
// =====================================================
function calcFinalDamage(atkBuffs, defBuffs, atkHeroes, defHeroes, base) {
  // ----------------------------
  // 攻撃側：攻撃力 × 殺傷力（相手のデバフ込み）
  // ----------------------------
  const atkPower =
    base.atk *
    (1 + atkBuffs[2].value - defBuffs[3].value) *      // 攻撃力上昇・低下
    (1 + atkBuffs[12].value - defBuffs[13].value) *    // 殺傷力上昇・低下
    (1 + atkBuffs[14].value);                          // レイナ 通常攻撃の与ダメ上昇

  // ----------------------------
  // 防御側：防御力 × HP（相手のデバフ込み）
  // ----------------------------
  const defPower =
    base.def *
    (1 + defBuffs[4].value - atkBuffs[5].value) *      // 防御力上昇・低下
    (1 + defBuffs[10].value - atkBuffs[11].value);     // HP上昇・低下

  // ----------------------------
  // 攻防比率
  // ----------------------------
  const ratio = atkPower / defPower;

  // ----------------------------
  // 与・被ダメ補正（スタック対応）
  // ----------------------------
  const dmgUp = atkBuffs[6].value;                     // 与ダメ上昇
  const dmgDown = calcStackedReduction(defHeroes, 7);  // 与ダメ減少
  const takenUp = atkBuffs[8].value;                   // 被ダメ上昇（攻撃側）
  const takenRed = 1 - calcStackedReduction(defHeroes, 9); // 被ダメ減少（防御側）

  // ----------------------------
  // クリティカル・特殊補正
  // ----------------------------
  const crit = 0;
  const specialCoef = 0;
  const critBonus = 1 + crit;
  const specialBonus = 1 + specialCoef;

  // ----------------------------
  // 最終ダメージ
  // ----------------------------
  const finalDamage =
    base.coef *
    ratio *
    (1 + dmgUp) *
    (1 - dmgDown) *
    (1 + takenUp) *
    takenRed *
    critBonus *
    specialBonus;

  return finalDamage;
}

// =====================================================
// シミュレーション実行
// =====================================================
function simulateBattle(atkBuffs, defBuffs, atkHeroes, defHeroes) {
  const atkDamage = calcFinalDamage(atkBuffs, defBuffs, atkHeroes, defHeroes, baseStats);
  const defDamage = calcFinalDamage(defBuffs, atkBuffs, defHeroes, atkHeroes, baseStats);

  const atkRemain = baseStats.hp * (1 + atkBuffs[10].value) - defDamage;
  const defRemain = baseStats.hp * (1 + defBuffs[10].value) - atkDamage;

  const winner =
//    atkRemain > defRemain
    atkDamage > defDamage
      ? "⚔ 攻撃側 WIN"
      : defRemain > atkRemain
      ? "🛡 防御側 WIN"
      : "🤝 DRAW";

  return { atkDamage, defDamage, atkRemain, defRemain, winner };
}

// =====================================================
// 初期化関数（index.htmlから呼び出し）
// =====================================================
export function initSimulator() {
  console.log("🟢 initSimulator() 実行開始");

  const page = document.getElementById("page-simulator");
  if (!page) {
    console.warn("page-simulator が見つかりません。");
    return;
  }

  const idsAtk = ["atk1", "atk2", "atk3", "atk4"];
  const idsDef = ["def1", "def2", "def3", "def4"];

  // プルダウン初期化
  const heroNames = CharacterSkills.map(c => c.name);
  [...idsAtk, ...idsDef].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel || sel.dataset.init === "true") return;
    sel.dataset.init = "true";

    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "（未選択）";
    sel.appendChild(blank);

    heroNames.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  });

  // 計算ボタン
  const btn = document.getElementById("simCalcBtn");
  if (!btn) {
    console.error("simCalcBtn が見つかりません");
    return;
  }

  btn.addEventListener("click", () => {
    console.log("🟢 計算ボタン押下イベント発火");

    const atkHeroes = getSelectedHeroes(idsAtk);
    const defHeroes = getSelectedHeroes(idsDef);

    if (atkHeroes.length === 0 && defHeroes.length === 0) {
      alert("英雄を選択してください");
      return;
    }

    const atkBuffs = collectBuffs(atkHeroes);
    const defBuffs = collectBuffs(defHeroes);

    const result = simulateBattle(atkBuffs, defBuffs, atkHeroes, defHeroes);

    const outputElem = document.getElementById("output");
    if (outputElem) {
      // バフ一覧を整形
      const formatBuffs = (label, buffs) => {
        let lines = [`${label}バフ一覧`];
        const maxIndex = Math.max(...Object.keys(buffs).map(Number));
        for (let i = 2; i <= maxIndex; i++) {
          const name = buffs[i].name;
          const val = buffs[i].value;

          let displayValue;
          if (i === 7 || i === 9) {
            // 与ダメ減少／被ダメ減少 → (1 - value)
            displayValue = (1 - val) * 100;
          } else {
            // その他はそのまま
            displayValue = val * 100;
          }

          const text = `${displayValue.toFixed(1)}%`;
          lines.push(`${name}: ${text}`);
        }
        return lines.join("\n");
      };

      const atkBuffText = formatBuffs("⚔ 攻撃側", atkBuffs);
      const defBuffText = formatBuffs("🛡 防御側", defBuffs);

      // 出力テキスト生成
      outputElem.textContent =
        `${atkBuffText}\n\n` +
        `${defBuffText}\n\n` +
        `⚔ 攻撃側ダメージ: ${result.atkDamage.toFixed(1)}\n` +
        `🛡 防御側ダメージ: ${result.defDamage.toFixed(1)}\n` +
// ⚠️ HP上昇バフを最終ダメージ式に含めると、
//    攻撃側・防御側の基礎ステータス（ATK/DEF/HP）が同じ条件でも、
//    HP上昇スキル持ち（例：パトリック）を設定しただけで
//    HP差が極端に大きくなってしまう。
//    これはバランスを大きく崩すため、現状ではHP上昇補正を無効化（コメントアウト）している。        
//        `❤️ 攻撃側残HP: ${result.atkRemain.toFixed(1)}\n` +
//        `💙 防御側残HP: ${result.defRemain.toFixed(1)}\n` +
        `結果: ${result.winner}`;
    }

    console.group("👑 英雄どれにしよちゃん 結果");
    console.log("攻撃側:", atkHeroes.map(h => h.name));
    console.log("防御側:", defHeroes.map(h => h.name));
    console.log(result);
    console.groupEnd();
  });
}
