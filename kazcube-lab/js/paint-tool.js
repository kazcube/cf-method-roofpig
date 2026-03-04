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
    
    // 両方の可能性のある属性名にセット
    player.setAttribute('stickering', currentMask);
    player.setAttribute('sticker-mask', currentMask);
    
    // hint-stickeringが有効なバージョンへの対応
    if (currentMask === 'dim') {
        player.setAttribute('hint-stickering', 'dim');
    } else {
        player.removeAttribute('hint-stickering');
    }
    
    console.log("[Paint] Applied:", currentMask);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    document.getElementById('rotate-controls').classList.toggle('hidden', isPaint);
    document.getElementById('paint-controls').classList.toggle('hidden', !isPaint);
    applyPreset(isPaint ? 'gray' : 'full');
}