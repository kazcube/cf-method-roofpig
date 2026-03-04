export const JS_VERSION = "v1.8.3";

export let setupMoves = [];
export let activeMoves = [];
export let visibleStickers = new Set(Array.from({length: 54}, (_, i) => i));

export function updateVisibleStickers(newSet) {
    visibleStickers = newSet;
}

export function getCurrentAlgString() {
    const slider = document.getElementById('move-slider');
    const step = slider ? parseInt(slider.value) : 0;
    return [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    const alg = getCurrentAlgString();
    
    // --- 重要修正箇所 ---
    // ステッカーが0枚の場合は "none" を、全枚数(54)の場合は "all" または空に。
    // それ以外はインデックスをカンマ区切りで渡す。
    let maskString = Array.from(visibleStickers).join(',');
    if (visibleStickers.size === 0) {
        maskString = "none";
    } else if (visibleStickers.size === 54) {
        maskString = ""; // 全表示
    }

    console.log(`[Render ${JS_VERSION}] Stickers: ${visibleStickers.size}, Mask: "${maskString}"`);

    // プロパティ反映
    player.experimentalStickeringMask = maskString;
    player.alg = alg;
    
    // UI更新
    const slider = document.getElementById('move-slider');
    const step = slider ? parseInt(slider.value) : 0;
    const counter = document.getElementById('step-counter');
    if (counter) counter.textContent = step;
    
    const indicator = document.getElementById('move-indicator');
    if (indicator) indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
}

// 以下、他の関数(updateHashDisplay, applySetup, handleScramble)は v1.8.2 と同じため維持
export function updateHashDisplay() {
    const hash = document.getElementById('hash-display');
    if (hash && activeMoves.length > 0) {
        hash.value = "v5:" + btoa(activeMoves.join(",")).substring(0, 20);
    }
}
export function applySetup() {
    let val = document.getElementById('command-box').value.trim();
    if (!val) return;
    const cleanVal = val.replace(/^#\s*/, "");
    const movesArr = cleanVal.split(/\s+/).filter(m => m.length > 0);
    setupMoves = [...movesArr].reverse().map(m => m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'"));
    activeMoves = movesArr;
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}
export function handleScramble() {
    setupMoves = [];
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    activeMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    const cmd = document.getElementById('command-box');
    if (cmd) cmd.value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}