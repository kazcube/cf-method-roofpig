// js/paint-tool.js
export let selectedColor = 'white';

/**
 * 特定のパーツだけを浮かび上がらせるマスク（Stickering）を適用
 */
export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // 最新の仕様に基づき、属性(Attribute)とプロパティの両方を更新
    const maskMap = {
        'gray': 'dim',
        'corner-center': 'centers-corners',
        'corner-only': 'corners-only',
        'full': 'full'
    };

    const targetValue = maskMap[type] || 'full';

    // 1. プロパティにセット
    player.stickering = targetValue;
    // 2. HTML属性としてもセット（TwistyPlayerは属性の変化を監視しているため、こちらの方が確実）
    player.setAttribute('stickering', targetValue);

    console.log(`[PaintTool] Applied preset: ${type} (${targetValue})`);
}

/**
 * モード切替時のパネル表示制御と初期マスクの適用
 */
export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-controls');
    const paintPanel = document.getElementById('paint-controls');

    if (isPaint) {
        rotatePanel.classList.add('hidden');
        paintPanel.classList.remove('hidden');
        
        // 描画の競合を避けるため、少し長めの待機時間を設けて実行
        // もしこれでも変わらない場合は、player.connectedCallbackを待つ必要があります
        setTimeout(() => applyPreset('gray'), 150);
    } else {
        rotatePanel.classList.remove('hidden');
        paintPanel.classList.add('hidden');
        applyPreset('full');
    }
}