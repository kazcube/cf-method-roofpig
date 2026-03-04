export const JS_VERSION = "v1.8.2";

export let setupMoves = [];
export let activeMoves = [];
// 表示するステッカーのインデックス
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
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;

    const step = parseInt(slider.value) || 0;
    const alg = getCurrentAlgString();
    
    // デバッグログ: 現在の状態を出力
    const maskString = Array.from(visibleStickers).join(',');
    console.log(`[Render] Step: ${step}, Visible Stickers: ${visibleStickers.size}`);
    console.log(`[Mask] "${maskString.substring(0, 50)}${maskString.length > 50 ? '...' : ''}"`);

    // 再描画を確実にするため、一旦プロパティを更新
    player.experimentalStickeringMask = maskString;
    player.alg = alg;
    
    const counter = document.getElementById('step-counter');
    if (counter) counter.textContent = step;
    
    const indicator = document.getElementById('move-indicator');
    if (indicator) indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
    
    updateHashDisplay();
}

function updateHashDisplay() {
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
    setupMoves = [...movesArr].reverse().map(m => 
        m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'")
    );
    activeMoves = movesArr;
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.max = activeMoves.length;
        slider.value = activeMoves.length;
    }
    render();
}

export function handleScramble() {
    setupMoves = [];
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    activeMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    const cmd = document.getElementById('command-box');
    if (cmd) cmd.value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.max = activeMoves.length;
        slider.value = activeMoves.length;
    }
    render();
}