/**
 * KAZCUBE Lab Core Module
 * v2.0.38: Final Stable Version
 * 解決策: 古いキャッシュ(v2.0.6)を破棄するため、クエリパラメータに依存しないクリーンな構造に変更。
 */

console.log("LOG: cube-core.js loaded. Version: v2.0.38");

export const JS_VERSION = "v2.0.38";
export let setupMoves = [];
export let activeMoves = [];
export let stickerStates = Array(54).fill(1);
export let isPlaying = false;

let currentDomAlg = "";
let currentDomSetup = "";

export function resetAll() {
    setupMoves = []; activeMoves = []; stickerStates.fill(1);
    currentDomAlg = null; currentDomSetup = null;
    stopPlay();
    const cb = document.getElementById('command-box');
    if (cb) cb.value = "";
    render();
}

export function updateStickerState(idx, state) { stickerStates[idx] = state; }
export function setAllStickers(state) { stickerStates.fill(state); }

export function loadFromHash(targetHash = null) {
    const hash = targetHash || window.location.hash.replace(/^#/, "");
    if (!hash || !hash.startsWith("v5:")) return;
    try {
        const decoded = atob(hash.substring(3));
        const [mask, setup, active] = decoded.split("|");
        if (mask && mask.length === 54) stickerStates = mask.split("").map(Number);
        setupMoves = (setup && setup !== "") ? setup.split(",") : [];
        activeMoves = (active && active !== "") ? active.split(",") : [];
        const cb = document.getElementById('command-box');
        if (cb) cb.value = activeMoves.join(" ");
        const slider = document.getElementById('move-slider');
        if (slider) { slider.max = activeMoves.length; slider.value = 0; }
        render();
    } catch (e) { console.error("Import Error", e); }
}

function generateOrbitMask() {
    const getMask = (indices) => indices.map(i => stickerStates[i] ? '-' : 'I').join('');
    const e = [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52].slice(0, 12);
    const c = [0,2,6,8,9,11,15,17,18,20,24,26,27,29,33,35,36,38,42,44,45,47,51,53].slice(0, 8);
    const ct = [4,13,22,31,40,49];
    return `EDGES:${getMask(e)},CORNERS:${getMask(c)},CENTERS:${getMask(ct)}`;
}

function updateSetupFromActive() {
    setupMoves = [...activeMoves].reverse().map(m => {
        if (m.endsWith("2")) return m;
        return m.endsWith("'") ? m.slice(0, -1) : m + "'";
    });
}

export function addMove(move) {
    stopPlay();
    activeMoves.push(move);
    updateSetupFromActive();
    const cb = document.getElementById('command-box');
    if (cb) cb.value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = 0; }
    render();
}

export function render() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    
    // スティッカーマスクの適用
    player.experimentalStickeringMaskOrbits = generateOrbitMask();
    
    const slider = document.getElementById('move-slider');
    const hashDisp = document.getElementById('hash-display');
    
    if (slider) {
        const step = parseInt(slider.value) || 0;
        const activeStr = activeMoves.join(" ");
        const setupStr = setupMoves.join(" ");
        
        // experimental APIを使用（古い.setupや.jumpToStepは使用しない）
        if (currentDomSetup !== setupStr) {
            player.experimentalSetupAlg = setupStr;
            currentDomSetup = setupStr;
        }
        if (currentDomAlg !== activeStr) {
            player.alg = activeStr;
            currentDomAlg = activeStr;
        }
        
        if (!isPlaying) {
            player.experimentalCurrentMoveIndex = step;
        }
        
        document.getElementById('step-counter').textContent = step;
        const indicator = document.getElementById('move-indicator');
        if (indicator) {
            const currentMove = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
            indicator.textContent = isPlaying ? `Playing...` : currentMove;
        }
    }
    
    const rawData = `${stickerStates.join("")}|${setupMoves.join(",")}|${activeMoves.join(",")}`;
    const hashValue = `v5:${btoa(rawData)}`;
    if (!isPlaying) {
        window.history.replaceState(null, "", "#" + hashValue);
        if (hashDisp) hashDisp.value = hashValue;
    }
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.textContent = isPlaying ? "||" : "▶";
}

export async function togglePlay() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;
    
    if (isPlaying) {
        stopPlay();
    } else {
        isPlaying = true;
        if (parseInt(slider.value) >= activeMoves.length) {
            slider.value = 0;
            player.experimentalCurrentMoveIndex = 0;
        }
        player.play();
        
        const syncLoop = () => {
            if (!isPlaying) return;
            const pIndex = player.experimentalCurrentMoveIndex;
            if (slider.value != pIndex) {
                slider.value = pIndex;
                document.getElementById('step-counter').textContent = pIndex;
            }
            if (pIndex >= activeMoves.length) {
                stopPlay();
            } else {
                requestAnimationFrame(syncLoop);
            }
        };
        requestAnimationFrame(syncLoop);
    }
}

export function stopPlay() {
    const player = document.getElementById('main-cube');
    if (player) { player.pause(); }
    isPlaying = false;
    render();
}

export function handleScramble() {
    stopPlay();
    const faces=['U','D','L','R','F','B'], mods=['',"'",'2'];
    activeMoves = Array.from({length:20},()=>faces[Math.floor(Math.random()*6)]+mods[Math.floor(Math.random()*3)]);
    updateSetupFromActive();
    const cb = document.getElementById('command-box');
    if (cb) cb.value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = 0; }
    currentDomAlg = "__RESET__";
    render();
}

export function applySetup() {
    stopPlay();
    const cb = document.getElementById('command-box');
    if (!cb) return;
    const val = cb.value.trim();
    if (!val) return;
    activeMoves = val.split(/\s+/).filter(m => m.length > 0);
    updateSetupFromActive();
    const slider = document.getElementById('move-slider');
    if (slider) { slider.max = activeMoves.length; slider.value = 0; }
    currentDomAlg = "__FORCE__";
    render();
}