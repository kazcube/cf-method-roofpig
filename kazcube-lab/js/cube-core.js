export let setupMoves = [];
export let activeMoves = [];

export const setSetupMoves = (m) => setupMoves = m;
export const setActiveMoves = (m) => activeMoves = m;

export function updateView() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    const step = parseInt(slider.value) || 0;
    
    // 手順の最大値を常に同期
    slider.max = activeMoves.length;

    const fullAlg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
    if (player) player.alg = fullAlg;
    
    // UI表示の更新
    const indicator = document.getElementById('move-indicator');
    if (indicator) indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";

    window.dispatchEvent(new CustomEvent('cubeUpdate', { detail: { step } }));
}

// 他の関数（applyReverseSetup, handleScramble, renderMoves）は前回と同じ