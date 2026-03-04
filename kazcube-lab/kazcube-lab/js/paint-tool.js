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

    player.stickering = stickerValue;
    player.setAttribute("stickering", stickerValue);
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-controls');
    const paintPanel = document.getElementById('paint-controls');

    if (isPaint) {
        rotatePanel?.classList.add('hidden');
        paintPanel?.classList.remove('hidden');
        setTimeout(() => applyPreset('gray'), 50);
    } else {
        rotatePanel?.classList.remove('hidden');
        paintPanel?.classList.add('hidden');
        applyPreset('full');
    }
}