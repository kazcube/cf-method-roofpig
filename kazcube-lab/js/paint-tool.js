export let selectedColor = 'white';

export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // プロパティと属性の両方にセットして確実性を高める
    switch(type) {
        case 'gray': 
            player.stickering = "dim";
            player.setAttribute("stickering", "dim");
            break;
        case 'corner-center': 
            player.stickering = "centers-corners";
            player.setAttribute("stickering", "centers-corners");
            break;
        case 'corner-only': 
            player.stickering = "corners-only";
            player.setAttribute("stickering", "corners-only");
            break;
        case 'full': 
        default: 
            player.stickering = "full";
            player.setAttribute("stickering", "full");
            break;
    }
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-controls');
    const paintPanel = document.getElementById('paint-controls');

    if (isPaint) {
        rotatePanel.classList.add('hidden');
        paintPanel.classList.remove('hidden');
        // 少し時間を置いてから適用（レンダリング待ち）
        setTimeout(() => applyPreset('gray'), 50);
    } else {
        rotatePanel.classList.remove('hidden');
        paintPanel.classList.add('hidden');
        applyPreset('full');
    }
}