export let setupMoves = [];
export let activeMoves = [];

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
    player.alg = getCurrentAlgString();
    
    document.getElementById('step-counter').textContent = step;
    document.getElementById('move-indicator').textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
    
    // ハッシュ表示の更新（簡易版）
    updateHashDisplay();
}

function updateHashDisplay() {
    const hash = document.getElementById('hash-display');
    if (hash && activeMoves.length > 0) {
        // 本来はbtoaなどでシリアライズしますが、今は形式のみ
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
    slider.max = activeMoves.length;
    slider.value = activeMoves.length;
    render();
}

export function handleScramble() {
    setupMoves = [];
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    activeMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    document.getElementById('command-box').value = activeMoves.join(" ");
    const slider = document.getElementById('move-slider');
    slider.max = activeMoves.length;
    slider.value = activeMoves.length;
    render();
}