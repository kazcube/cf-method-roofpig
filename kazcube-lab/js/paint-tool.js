// js/paint-tool.js
export let currentMask = 'full';

export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    const maskMap = {
        'gray': 'dim',
        'corner-center': 'centers-corners',
        'corner-only': 'corners-only',
        'full': 'full'
    };

    currentMask = maskMap[type] || 'full';
    
    // 強制適用
    player.setAttribute('stickering', currentMask);
    // 3D visualizationにおいてグレーアウトを確実にする属性
    player.setAttribute('hint-stickering', (currentMask === 'dim' ? 'dim' : 'none'));
    
    console.log(`[Paint] Forced mask: ${currentMask}`);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    document.getElementById('rotate-controls').classList.toggle('hidden', isPaint);
    document.getElementById('paint-controls').classList.toggle('hidden', !isPaint);
    
    applyPreset(isPaint ? 'gray' : 'full');
}