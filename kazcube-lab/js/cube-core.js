export const JS_VERSION = "v1.8.6";

export let setupMoves = [];
export let activeMoves = [];
// 54枚のステッカー状態 (1:表示, 0:非表示)
export let stickerStates = Array(54).fill(1); 

export function updateStickerState(idx, state) {
    stickerStates[idx] = state;
}

export function setAllStickers(state) {
    stickerStates.fill(state);
}

// v0.5.44ベースのMaskOrbits生成
function generateOrbitMask() {
    const getMask = (indices) => indices.map(i => stickerStates[i] ? '-' : 'I').join('');
    
    // パーツごとのインデックス（3x3x3の標準的な並び）
    const edges = [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52].slice(0, 12);
    const corners = [0,2,6,8,9,11,15,17,18,20,24,26,27,29,33,35,36,38,42,44,45,47,51,53].slice(0, 8);
    const centers = [4,13,22,31,40,49];

    return `EDGES:${getMask(edges)},CORNERS:${getMask(corners)},CENTERS:${getMask(centers)}`;
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // マスク適用
    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    // 手順の反映
    const step = parseInt(document.getElementById('move-slider')?.value || 0);
    player.alg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");

    // テキスト更新
    const counter = document.getElementById('step-counter');
    if (counter) counter.textContent = step;
    
    const indicator = document.getElementById('move-indicator');
    if (indicator) indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
}

// 他の関数は維持
export function applySetup() {
    let val = document.getElementById('command-box').value.trim().replace(/^#\s*/, "");
    if (!val) return;
    const movesArr = val.split(/\s+/).filter(m => m.length > 0);
    setupMoves = [...movesArr].reverse().map(m => m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'"));
    activeMoves = movesArr;
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}

export function handleScramble() {
    setupMoves = [];
    const faces=['U','D','L','R','F','B'], mods=['',"'",'2'];
    activeMoves = Array.from({length:20},()=>faces[Math.floor(Math.random()*6)]+mods[Math.floor(Math.random()*3)]);
    document.getElementById('command-box').value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = activeMoves.length; }
    render();
}