/**
 * KAZCUBE Lab Paint Tool Module
 * v2.2.0: Restored full color palette and fixed interaction.
 */

import * as Core from './cube-core.js?v=2.2.0';

let selectedColor = "white"; // Default draw color

const palette = [
    { name: "white", hex: "#ffffff" },
    { name: "yellow", hex: "#facc15" },
    { name: "red", hex: "#ef4444" },
    { name: "orange", hex: "#f97316" },
    { name: "blue", hex: "#3b82f6" },
    { name: "green", hex: "#22c55e" },
    { name: "gray", hex: "#4b5563" }, // For "erasing" stickers
];

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    
    player.addEventListener('pointerdown', (e) => {
        const isPaintMode = document.getElementById('mode-paint').classList.contains('bg-emerald-500');
        if (!isPaintMode) return;
        
        const idx = e.stickerIndex;
        if (idx !== undefined) {
            // NOTE: Using a hypothetical direct color update if the library supports it.
            // For now, we reuse the MASK logic (1 for colored, 0 for gray).
            // If you need actual color changing per sticker, we would need to use experimentalStickering.
            const maskValue = (selectedColor === "gray") ? 0 : 1;
            Core.updateStickerState(idx, maskValue);
            Core.render(true);
        }
    });

    document.getElementById('btn-gray').onclick = () => { Core.setAllStickers(0); Core.render(true); };
    document.getElementById('btn-full').onclick = () => { Core.setAllStickers(1); Core.render(true); };

    renderSwatches();
}

function renderSwatches() {
    const container = document.getElementById('swatch-container');
    if (!container) return;
    container.innerHTML = "";
    
    palette.forEach(color => {
        const btn = document.createElement('button');
        btn.className = `w-6 h-6 rounded-full border border-slate-700 transition-all swatch-item ${color.name === selectedColor ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`;
        btn.style.backgroundColor = color.hex;
        btn.title = color.name.toUpperCase();
        btn.onclick = (e) => {
            e.stopPropagation();
            selectedColor = color.name;
            document.querySelectorAll('.swatch-item').forEach(b => b.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'scale-110', 'shadow-lg', 'opacity-100'));
            btn.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'scale-110', 'shadow-lg');
            btn.classList.remove('opacity-60');
        };
        container.appendChild(btn);
    });
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotateBtn = document.getElementById('mode-rotate');
    const paintBtn = document.getElementById('mode-paint');
    const rotatePanel = document.getElementById('rotate-panel');
    const paintControls = document.getElementById('paint-controls');

    if (isPaint) {
        paintBtn.classList.add('bg-emerald-500', 'text-white', 'shadow-lg');
        paintBtn.classList.remove('text-slate-500');
        rotateBtn.classList.remove('bg-emerald-500', 'text-white', 'shadow-lg');
        rotateBtn.classList.add('text-slate-500');
        
        rotatePanel.classList.add('hidden');
        paintControls.classList.remove('hidden');
        paintControls.classList.add('flex');
    } else {
        rotateBtn.classList.add('bg-emerald-500', 'text-white', 'shadow-lg');
        rotateBtn.classList.remove('text-slate-500');
        paintBtn.classList.remove('bg-emerald-500', 'text-white', 'shadow-lg');
        paintBtn.classList.add('text-slate-500');
        
        rotatePanel.classList.remove('hidden');
        paintControls.classList.add('hidden');
        paintControls.classList.remove('flex');
    }
}