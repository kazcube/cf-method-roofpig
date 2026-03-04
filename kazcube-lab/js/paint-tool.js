// js/paint-tool.js
export let selectedColor = 'white';

/**
 * グレーアウト(dim)や各種マスクを適用する
 */
export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    const maskMap = {
        'gray': 'dim',
        'corner-center': 'centers-corners',
        'corner-only': 'corners-only',
        'full': 'full'
    };

    const value = maskMap[type] || 'full';

    // 1. プロパティと属性をセット
    player.stickering = value;
    player.setAttribute('stickering', value);

    // 2. 【重要】強制再描画のトリガー
    // puzzle属性を一旦上書きして戻す、または小さな描画更新をかける
    const currentPuzzle = player.puzzle;
    player.puzzle = currentPuzzle; 

    console.log(`[PaintTool] Preset applied: ${value}`);
}

/**
 * モード切替
 */
export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-controls');
    const paintPanel = document.getElementById('paint-controls');

    if (isPaint) {
        rotatePanel.classList.add('hidden');
        paintPanel.classList.remove('hidden');
        
        // 切替直後は描画が不安定なため、2段階で命令を送る
        applyPreset('gray');
        setTimeout(() => applyPreset('gray'), 100);
    } else {
        rotatePanel.classList.remove('hidden');
        paintPanel.classList.add('hidden');
        applyPreset('full');
    }
}