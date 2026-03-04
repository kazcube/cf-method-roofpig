export let selectedColor = 'white';

export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    let stickerValue = "full";
    switch(type) {
        case 'gray': stickerValue = "dim"; break;
        case 'corner-center': stickerValue = "centers-corners"; break;
        case 'corner-only': stickerValue = "corners-only"; break;
    }

    // 両方の手法で確実に適用させる
    player.stickering = stickerValue;
    player.setAttribute("stickering", stickerValue);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-controls');
    const paintPanel = document.getElementById('paint-controls');

    if (isPaint) {
        if (rotatePanel) rotatePanel.classList.add('hidden');
        if (paintPanel) paintPanel.classList.remove('hidden');
        // ブラウザのレンダリングを待ってからグレーアウトを適用
        setTimeout(() => applyPreset('gray'), 50);
    } else {
        if (rotatePanel) rotatePanel.classList.remove('hidden');
        if (paintPanel) paintPanel.classList.add('hidden');
        applyPreset('full');
    }
}