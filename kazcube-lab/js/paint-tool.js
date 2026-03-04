// js/paint-tool.js
export let selectedColor = 'white';

/**
 * 命令を繰り返し送るヘルパー関数
 */
function applyWithRetry(player, value, retryCount = 0) {
    if (!player || retryCount > 10) return;

    // プロパティと属性の両方をセット
    player.stickering = value;
    player.setAttribute('stickering', value);

    // 100ms ごとにリトライして、レンダリング完了を待つ
    setTimeout(() => {
        // 反映が不十分な場合を想定して再送（ログは初回のみ）
        player.stickering = value;
        player.setAttribute('stickering', value);
        if(retryCount === 0) console.log(`[PaintTool] Applying mask: ${value}`);
        
        applyWithRetry(player, value, retryCount + 1);
    }, 100);
}

export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    const maskMap = {
        'gray': 'dim',
        'corner-center': 'centers-corners',
        'corner-only': 'corners-only',
        'full': 'full'
    };

    applyWithRetry(player, maskMap[type] || 'full');
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-controls');
    const paintPanel = document.getElementById('paint-controls');

    if (isPaint) {
        rotatePanel.classList.add('hidden');
        paintPanel.classList.remove('hidden');
        // PAINT切り替え時にグレーにする
        applyPreset('gray');
    } else {
        rotatePanel.classList.remove('hidden');
        paintPanel.classList.add('hidden');
        applyPreset('full');
    }
}