export const JS_VERSION = "v1.8.5";

export let setupMoves = [];
export let activeMoves = [];
// 各インデックスが「表示(1)」か「非表示(0)」かを保持する配列 (54要素)
export let stickerStates = Array(54).fill(1); 

export function updateStickerState(idx, state) {
    stickerStates[idx] = state;
}

export function setAllStickers(state) {
    stickerStates.fill(state);
}

// 5.44ベースのMaskOrbits形式に変換
function generateOrbitMask() {
    const getMask = (indices) => indices.map(i => stickerStates[i] ? '-' : 'I').join('');
    
    // インデックス定義
    const idx = {
        U: [0,1,2,3,4,5,6,7,8], R: [9,10,11,12,13,14,15,16,17],
        F: [18,19,20,21,22,23,24,25,26], D: [27,28,29,30,31,32,33,34,35],
        L: [36,37,38,39,40,41,42,43,44], B: [45,46,47,48,49,50,51,52,53]
    };

    // EDGES(12), CORNERS(8), CENTERS(6) の順
    // ※ 簡略化のため、すべてのパーツを個別の「-」か「I」で表現する
    return `EDGES:${getMask(Array.from({length:12}, (_,i)=>i))},CORNERS:${getMask(Array.from({length:8}, (_,i)=>i))},CENTERS:${getMask(Array.from({length:6}, (_,i)=>i))}`;
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // 5.44方式のMask適用
    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    // .alg 直接取得を避けるため、内部変数からセット
    const step = parseInt(document.getElementById('move-slider')?.value || 0);
    player.alg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");

    document.getElementById('step-counter').textContent = step;
    document.getElementById('move-indicator').textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
    
    updateHashDisplay();
}

// ...以下 updateHashDisplay, applySetup, handleScramble は維持
export function updateHashDisplay() {
    const hash = document.getElementById('hash-display');
    if (hash && activeMoves.length > 0) hash.value = "v5:" + btoa(activeMoves.join(",")).substring(0, 20);
}
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