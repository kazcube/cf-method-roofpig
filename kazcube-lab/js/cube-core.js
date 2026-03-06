import { syncHash } from './analyzer.js?v=2.5.1';

export let activeMoves = [];
export let stickerMask = Array(54).fill(1);
let isPlaying = false;

export function render(force = false) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    const algStr = activeMoves.join(" ");
    if (player.alg !== algStr) player.alg = algStr;

    const orbits = stickerMask.map(v => v === 1 ? "I" : "-").join("");
    player.experimentalStickeringMaskOrbits = `3x3x3:${orbits}`;

    const slider = document.getElementById('move-slider');
    const step = parseInt(slider.value) || 0;
    if (!isPlaying) player.experimentalCurrentMoveIndex = step;

    document.getElementById('step-counter').textContent = step;
    document.getElementById('move-indicator').textContent = isPlaying ? "PLAYING" : (step > 0 ? activeMoves[step-1] : "READY");

    // Analyzerでハッシュを更新
    syncHash();
}

export function addMove(m) {
    stopPlay();
    activeMoves.push(m);
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = activeMoves.length;
    render(true);
}

export function stopPlay() {
    const player = document.getElementById('main-cube');
    if(player) player.pause();
    isPlaying = false;
    document.getElementById('play-icon').classList.remove('hidden');
    document.getElementById('pause-icon').classList.add('hidden');
    render();
}

export function togglePlay() {
    const player = document.getElementById('main-cube');
    if (isPlaying) {
        stopPlay();
    } else {
        isPlaying = true;
        document.getElementById('play-icon').classList.add('hidden');
        document.getElementById('pause-icon').classList.remove('hidden');
        const slider = document.getElementById('move-slider');
        if (parseInt(slider.value) >= activeMoves.length) slider.value = 0;
        player.play();
        const sync = () => {
            if (!isPlaying) return;
            slider.value = player.experimentalCurrentMoveIndex;
            if (parseInt(slider.value) >= activeMoves.length) stopPlay();
            else requestAnimationFrame(sync);
        };
        requestAnimationFrame(sync);
    }
}

export function handleScramble() {
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    activeMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = 0;
    render(true);
}

export function applySetup() {
    const val = document.getElementById('command-box').value.trim();
    activeMoves = val ? val.split(/\s+/) : [];
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = 0;
    render(true);
}

export function resetAll() {
    activeMoves = [];
    stickerMask.fill(1);
    const slider = document.getElementById('move-slider');
    slider.max = 0;
    slider.value = 0;
    document.getElementById('command-box').value = "";
    stopPlay();
    render(true);
}

export function updateStickerState(idx, val) { stickerMask[idx] = val; }
export function setAllStickers(val) { stickerMask.fill(val); }

export function loadFromHash() {
    const hash = window.location.hash.substring(1);
    if (!hash.startsWith('v5:')) return;
    try {
        const decoded = JSON.parse(atob(hash.substring(3)));
        activeMoves = decoded.a || [];
        const slider = document.getElementById('move-slider');
        slider.max = activeMoves.length;
        slider.value = decoded.v || 0;
    } catch(e) { console.error("Hash load failed", e); }
}