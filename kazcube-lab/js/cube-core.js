// js/cube-core.js
export let moves = [];

// 【修正】Paint側から現在のアルゴリズム文字列を安全に取得するための関数
export function getCurrentAlgString() {
    const slider = document.getElementById('move-slider');
    const step = slider ? parseInt(slider.value) : 0;
    return moves.slice(0, step).join(" ");
}

export function render() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;

    const step = parseInt(slider.value) || 0;
    // 直接値を代入するのみにする
    player.alg = getCurrentAlgString();
    
    document.getElementById('step-counter').textContent = step;
    document.getElementById('move-indicator').textContent = (step > 0) ? moves[step-1] : "---";
}

export function handleScramble() {
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    moves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.max = moves.length;
        slider.value = moves.length;
    }
    document.getElementById('command-box').value = moves.join(" ");
    render();
}