export const JS_VERSION = "v1.9.3";

export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1); 

export function updateStickerState(idx, state) {
    stickerStates[idx] = state;
}

export function setAllStickers(state) {
    stickerStates.fill(state);
}

// ハッシュから状態を復元する関数
export function loadFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("v5:")) return;
    
    try {
        const decoded = atob(hash.substring(3)); // "v5:" 以降をデコード
        const [mask, moves] = decoded.split("|");
        
        if (mask && mask.length === 54) {
            stickerStates = mask.split("").map(Number);
        }
        if (moves) {
            activeMoves = moves.split(",").filter(m => m !== "");
        }
    } catch (e) {
        console.error("Hash recovery failed", e);
    }
}

function generateOrbitMask() {
    const getMask = (indices) => indices.map(i => stickerStates[i] ? '-' : 'I').join('');
    const e = [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52].slice(0, 12);
    const c = [0,2,6,8,9,11,15,17,18,20,24,26,27,29,33,35,36,38,42,44,45,47,51,53].slice(0, 8);
    const ct = [4,13,22,31,40,49];
    return `EDGES:${getMask(e)},CORNERS:${getMask(c)},CENTERS:${getMask(ct)}`;
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    const step = parseInt(slider?.value || 0);
    player.alg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");

    // ハッシュの更新
    const maskStr = stickerStates.join("");
    const movesStr = activeMoves.join(",");
    const rawData = `v5:${maskStr}|${movesStr}`;
    const hashValue = btoa(rawData);
    
    const hashDisplay = document.getElementById('hash-display');
    if (hashDisplay) hashDisplay.value = `v5:${hashValue.substring(0, 16)}...`;
    
    // URLのハッシュを書き換え（履歴に残さない）
    window.history.replaceState(null, "", "#" + `v5:${hashValue}`);
}

// ... applySetup, handleScramble は維持