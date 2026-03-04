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

    // 複数の方法で命令を送り、確実に反映させる
    try {
        // 1. 標準プロパティ
        player.stickering = value;
        // 2. HTML属性（リアクティブな反映を期待）
        player.setAttribute('stickering', value);
        
        console.log(`[PaintTool] Preset requested: ${type} -> ${value}`);
    } catch (e) {
        console.warn("[PaintTool] Stickering update failed, retrying...", e);
    }
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
        // 少し長めに待ってから適用
        setTimeout(() => applyPreset('gray'), 200);
    } else {
        rotatePanel.classList.remove('hidden');
        paintPanel.classList.add('hidden');
        applyPreset('full');
    }
}