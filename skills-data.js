// skills-data.js
// =======================================
// 正規化データ：キャラクタスキルデータ / スキルデータ
// ---------------------------------------
// ・UI非表示、内部参照専用
// ・buffは常に正の値（増減の方向は計算式で扱う）
// ・このファイルに自由に追記・編集OK
// =======================================

// =========================
// キャラクタスキルデータ
// =========================
export const CharacterSkills = [
// "攻撃力上昇" },
  { name: "ソユン", 
    skills: [
              { type: 2, detail: "攻撃力 +25%", buff: 25 }
            ] },

// "攻撃力低下" },
  { name: "リンセツ", 
    skills: [
              { type: 3, detail: "攻撃力 -20%", buff: 20 }
            ] },

// "防御力上昇" },

// "防御力低下" },

// "与ダメ上昇" },
  { name: "ジャセル", 
    skills: [
              { type: 6, detail: "与ダメ +25%", buff: 25 }
            ] },
  { name: "ジェシー", 
    skills: [
              { type: 6, detail: "与ダメ +25%", buff: 25 }
            ] },
  { name: "ジェロニモ", 
    skills: [
              { type: 6, detail: "与ダメ +25%", buff: 25 }
            ] },

// "与ダメ減少" },
  { name: "ボーガン", 
    skills: [
              { type: 7, detail: "与ダメ -20%", buff: 20 }
            ] },

// "被ダメ上昇" },

// "被ダメ減少" },
  { name: "バシティ", 
    skills: [
              { type: 9, detail: "被ダメ -20%", buff: 20 }
            ] },
  { name: "セルゲイ", 
    skills: [
              { type: 9, detail: "被ダメ -20%", buff: 20 }
            ] },

// "HP上昇" },
  { name: "パトリック", 
    skills: [
              { type: 10, detail: "HP +25%", buff: 25 }
            ] },
 
// "HP低下" },

// "殺傷力上昇" },

// "殺傷力低下" },

// 混合
  { name: "ジンマン", 
    skills: [
              { type: 4, detail: "防御力 +10%", buff: 10 },
              { type: 10, detail: "HP +10%", buff: 10 }
            ] },
  { name: "フレンダー", 
    skills: [
              { type: 2, detail: "攻撃力 +15%", buff: 15 },
              { type: 4, detail: "防御力 +10%", buff: 10 }
            ] },

// 確率
  { name: "ミア", 
    skills: [
              { type:  8, detail: "50%確率 被ダメ +50%", p: 0.5, L: 1, r: 0.5 }
            ] },

// ターン確率
  { name: "ローガン",
    skills: [
              { type: 6, detail: "20%確率 与ダメ +40% 3ターン", p: 0.2, L: 3, r: 0.4 }
            ] },    
  { name: "グレッグ", 
    skills: [
              { type: 6, detail: "20%確率 与ダメ +40% 3ターン", p: 0.2, L: 3, r: 0.4 }
            ] },
  { name: "フリント", 
    skills: [
              { type: 6, detail: "20%確率 与ダメ +40% 3ターン", p: 0.2, L: 3, r: 0.4 }
            ] },
      
// "なし[採取、体力消費、眩暈]" },
  { name: "スミス",   
    skills: [
              { type: 1, detail: "鉄鋼工場生産量 +25%", buff:0 }
            ] },
  { name: "クラリス", 
    skills: [
              { type: 1, detail: "家生産量 +25%", buff: 0 } 
            ] },
  { name: "チャーリー", 
    skills: [
              { type: 1, detail: "石炭工場生産量 +25%", buff: 0 }
            ] },
  { name: "ユージーン", 
    skills: [
              { type: 1, detail: "伐採場生産量 +25%", buff: 0 }
            ] },
  { name: "ジーナ", 
    skills: [
              { type: 1, detail: "体力消費 -20%", buff: 0 }
            ] },
  { name: "ジャスミン", 
    skills: [
              { type: 1, detail: "20%確率 眩暈 1ターン", buff: 0 }
            ] },
  { name: "ナタリア", 
    skills: [
              { type: 1, detail: "20%確率 眩暈 1ターン", buff: 0 }
            ] },
  { name: "アロンゾ", 
    skills: [
              { type: 1, detail: "20%確率 眩暈 1ターン", buff: 0 }
            ] },
];

// =========================
// スキルデータ
// =========================
export const SkillData = [
  { type: 1, name: "なし[採取、体力消費、眩暈]" },
  { type: 2, name: "攻撃力上昇" },
  { type: 3, name: "攻撃力低下" },
  { type: 4, name: "防御力上昇" },
  { type: 5, name: "防御力低下" },
  { type: 6, name: "与ダメ上昇" },
  { type: 7, name: "与ダメ減少" },
  { type: 8, name: "被ダメ上昇" },
  { type: 9, name: "被ダメ減少" },
  { type: 10, name: "HP上昇" },
  { type: 11, name: "HP低下" },
  { type: 12, name: "殺傷力上昇" },
  { type: 13, name: "殺傷力低下" },

];

// =========================
// 参照ユーティリティ
// =========================
/**
 * DoTスキル平均バフ期待値を計算（非スタック・リフレッシュあり）
 * @param {number} p 発動確率
 * @param {number} L 持続ターン数
 * @param {number} r 効果倍率（例: 0.4）
 * @param {number} N 同一効果を持つ人数
 * @returns {number} 平均上昇率（小数）
 */
export function calcAvgBuff(p, L, r, N) {
  const p_comb = 1 - Math.pow(1 - p, N);
  const activeRate = 1 - Math.pow(1 - p_comb, L);
  return r * activeRate;
}

/**
 * 英雄選択リストから、指定タイプの平均上昇率を計算
 * @param {Array} selectedHeroes UIで選ばれた英雄の配列
 * @param {number} skillType スキルタイプ（例：6＝与ダメ上昇）
 */
export function calcBuffFromSelection(selectedHeroes, skillType) {
  // 該当スキルのみ抽出
  const group = selectedHeroes
    .flatMap(c => c.skills.map(s => ({ name: c.name, ...s })))
    .filter(s => s.type === skillType);

  const N = group.length;
  if (N === 0) return { buff: 0, N: 0 };

  const dotSkills = group.filter(s => s.p && s.L && s.r);
  const fixedSkills = group.filter(s => s.buff && !s.p);

  let totalBuff = 0;

  // --- 確率スキル（DoT計算） ---
  if (dotSkills.length > 0) {
    const { p, L, r } = dotSkills[0]; // 同一タイプ前提
    totalBuff += calcAvgBuff(p, L, r, dotSkills.length);
  }

  // --- 固定スキル ---
  if (fixedSkills.length > 0) {
    let totalFixed;

    // ✅ 攻撃／殺傷／防御／HP／与ダメ／被ダメ上昇系 → 加算式
    if ([2, 3, 4, 5, 6, 8, 10, 11, 12, 13].includes(skillType)) {
      totalFixed = fixedSkills.reduce((sum, s) => sum + s.buff, 0) / 100;
    } else {
      // その他（与ダメ減少／被ダメ減少など） → 平均式
      totalFixed =
        fixedSkills.reduce((sum, s) => sum + s.buff, 0) /
        fixedSkills.length /
        100;
    }

    totalBuff += totalFixed;
  }

  return { buff: totalBuff, N };
}

/**
 * 選択された英雄リストから全タイプのバフをまとめて取得
 */
export function collectBuffs(selectedHeroes) {
  const buffTypes = [
    { type: 2, name: "攻撃力上昇" },
    { type: 3, name: "攻撃力低下" },
    { type: 4, name: "防御力上昇" },
    { type: 5, name: "防御力低下" },
    { type: 6, name: "与ダメ上昇" },
    { type: 7, name: "与ダメ減少" },
    { type: 8, name: "被ダメ上昇" },
    { type: 9, name: "被ダメ減少" },
    { type: 10, name: "HP上昇" },
    { type: 11, name: "HP低下" },
    { type: 12, name: "殺傷力上昇" },
    { type: 13, name: "殺傷力低下" },
  ];

  const buffs = {};

  for (const { type, name } of buffTypes) {
    if (type === 7 || type === 9) {
      // 減少系は ∏(1 − x) でスタック
      const group = selectedHeroes
        .flatMap(c => c.skills)
        .filter(s => s.type === type && s.buff);

      let mult = 1;
      for (const s of group) mult *= (1 - s.buff / 100);

      buffs[type] = {
        name,
        value: mult,     
        count: group.length,
      };
    } else {
      // それ以外（加算 or 平均）は calcBuffFromSelection を使う
      const { buff, N } = calcBuffFromSelection(selectedHeroes, type);
      buffs[type] = {
        name,
        value: buff,          // ← 小数（例 0.4）
        count: N
      };
    }
  }

  return buffs;
}

// =========================
// 使用例（コメント）
// =========================
