export let selectedColor = 'white';

export function applyPreset(type) {
    const player = document.getElementById('main-cube');
    if (!player) return;

    switch(type) {
        case 'gray': player.stickering = "dim"; break;
        case 'corner-center': player.stickering = "centers-corners"; break;
        case 'corner-only': player.stickering = "corners-only"; break;
        case 'full': player.stickering = "full"; break;
    }
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    document.getElementById('rotate-controls').classList.toggle('hidden', isPaint);
    document.getElementById('paint-controls').classList.toggle('hidden', !isPaint);
    applyPreset(isPaint ? 'gray' : 'full');
}