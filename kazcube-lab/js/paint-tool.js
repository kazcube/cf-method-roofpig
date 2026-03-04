// js/paint-tool.js

// v5.12 成功ロジックの定義をそのまま移植
export const masks = {
    // 全てを I (非表示/グレー) に
    gray: "EDGES:IIIIIIIIIIII,CORNERS:IIIIIIII,CENTERS:IIIIII",
    // コーナーとセンターを表示 (-) 、エッジを非表示 (I)
    'corner-center': "EDGES:IIIIIIIIIIII,CORNERS:--------,CENTERS:------",
    // コーナーのみ表示 (-)
    'corner-only': "EDGES:IIIIIIIIIIII,CORNERS:--------,CENTERS:IIIIII",
    // 全て表示 (-)
    full: "EDGES:------------,CORNERS:--------,CENTERS:------"
};

export let currentMask = 'full';

export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    currentMask = type;
    const maskString = masks[type] || masks.full;

    console.log(`[Paint] Applying Mask: ${type}`);
    
    // プロパティへ直接代入（属性ではなくプロパティが確実）
    player.experimentalStickeringMaskOrbits = maskString;

    // --- 成功コードにあった「再描画の念押し」ロジック ---
    const tmp = player.alg;
    player.alg = ""; 
    setTimeout(() => {
        player.alg = tmp;
    }, 10);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    
    // UI切り替え
    document.getElementById('rotate-controls').classList.toggle('hidden', isPaint);
    document.getElementById('paint-controls').classList.toggle('hidden', !isPaint);
    
    // モードに応じた初期マスク適用
    applyPreset(isPaint ? 'gray' : 'full');
}