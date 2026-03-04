// js/cube-core.js
export let setupMoves = [];
export let activeMoves = [];

export function getCurrentAlgString() {
    const slider = document.getElementById('move-slider');
    const step = slider ? parseInt(slider.value) : 0;
    // セットアップ（逆手順）を先に実行し、その後に現在の手順を重ねる
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
}

// 【復活】ハッシュ解析とセットアップ適用ロジック
export function applySetup() {
    let val = document.getElementById('command-box').value.trim();
    if (!val) return;

    // ハッシュ記号があれば除去して解析
    const cleanVal = val.replace(/^#\s*/, "");
    const movesArr = cleanVal.split(/\s+/).filter(m => m.length > 0);

    // セットアップとして「逆手順」を生成（初期状態からその形にするため）
    setupMoves = [...movesArr].reverse().map(m => 
        m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'")
    );
    
    // 表示用のメイン手順としてもセット
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