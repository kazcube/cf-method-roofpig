// js/paint-tool.js
export let selectedColor = 'white';
export let currentMask = 'full'; 

export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) {
        console.error("[DEBUG-Paint] main-cube not found in DOM");
        return;
    }

    const maskMap = {
        'gray': 'dim',
        'corner-center': 'centers-corners',
        'corner-only': 'corners-only',
        'full': 'full'
    };

    currentMask = maskMap[type] || 'full';
    
    console.log(`[DEBUG-Paint] Attempting to set stickering to: ${currentMask}`);
    
    // プロパティと属性の両方を更新
    player.stickering = currentMask;
    player.setAttribute('stickering', currentMask);
    
    // 反映後の値を確認
    console.log(`[DEBUG-Paint] Current player.stickering is now: ${player.stickering}`);
}

export function setPaintMode(mode) {
    console.log(`[DEBUG-Paint] Mode changed to: ${mode}`);
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-controls');
    const paintPanel = document.getElementById('paint-controls');

    if (isPaint) {
        rotatePanel.classList.add('hidden');
        paintPanel.classList.remove('hidden');
        applyPreset('gray');
    } else {
        rotatePanel.classList.remove('hidden');
        paintPanel.classList.add('hidden');
        applyPreset('full');
    }
}