// js/paint-tool.js
export let selectedColor = 'white';
// 現在のマスク状態を保持
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
    
    // 属性を直接セット
    player.setAttribute('stickering', currentMask);
    console.log("Applied mask:", currentMask);
}

export function setPaintMode(mode) {
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