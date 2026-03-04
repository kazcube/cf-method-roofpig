// js/paint-tool.js
export let selectedColor = 'white';
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
    
    console.log(`[DEBUG-Paint] Setting stickering: ${currentMask}`);
    
    // 属性の直接セット
    player.setAttribute('stickering', currentMask);
    
    // hint-stickeringを連動（グレーアウトの鍵）
    if (currentMask === 'dim') {
        player.setAttribute('hint-stickering', 'dim');
    } else {
        player.setAttribute('hint-stickering', 'none');
    }
}

export function setPaintMode(mode) {
    console.log(`[DEBUG-Paint] Mode Switch: ${mode}`);
    const isPaint = (mode === 'paint');
    
    document.getElementById('rotate-controls').classList.toggle('hidden', isPaint);
    document.getElementById('paint-controls').classList.toggle('hidden', !isPaint);
    
    applyPreset(isPaint ? 'gray' : 'full');
}