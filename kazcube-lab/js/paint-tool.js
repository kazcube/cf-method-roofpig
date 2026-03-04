export let selectedColor = 'white';

export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // twisty-playerのAPI仕様に合わせた文字列指定
    switch(type) {
        case 'gray': player.stickering = "dim"; break;
        case 'corner-center': player.stickering = "centers-corners"; break;
        case 'corner-only': player.stickering = "corners-only"; break;
        case 'full': 
        default: player.stickering = "full"; break;
    }
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