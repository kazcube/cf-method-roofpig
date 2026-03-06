import * as Core from './cube-core.js?v=2.5.1';

let selectedColorIdx = 0;
const palette = [
    { name: "white", hex: "#ffffff" },
    { name: "yellow", hex: "#facc15" },
    { name: "red", hex: "#ef4444" },
    { name: "orange", hex: "#f97316" },
    { name: "blue", hex: "#3b82f6" },
    { name: "green", hex: "#22c55e" },
    { name: "gray", hex: "#4b5563" }
];

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.addEventListener('pointerdown', (e) => {
        const paintBtn = document.getElementById('mode-paint');
        if (!paintBtn.classList.contains('bg-emerald-500')) return;
        const idx = e.stickerIndex;
        if (idx !== undefined) {
            const isEraser = (palette[selectedColorIdx].name === 'gray');
            Core.updateStickerState(idx, isEraser ? 0 : 1);
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
    palette.forEach((color, idx) => {
        const btn = document.createElement('button');
        btn.className = `w-6 h-6 rounded-full border border-slate-700 opacity-60 transition-all swatch-item ${idx === selectedColorIdx ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 opacity-100 scale-110 shadow-lg' : ''}`;
        btn.style.backgroundColor = color.hex;
        btn.onclick = (e) => {
            e.stopPropagation();
            selectedColorIdx = idx;
            document.querySelectorAll('.swatch-item').forEach((sw, i) => {
                sw.classList.toggle('ring-2', i === idx);
                sw.classList.toggle('ring-emerald-500', i === idx);
                sw.classList.toggle('opacity-100', i === idx);
                sw.classList.toggle('scale-110', i === idx);
            });
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
        paintBtn.className = "px-5 py-2.5 bg-emerald-500 font-black text-[10px] rounded-lg text-white shadow-lg transition-all";
        rotateBtn.className = "px-5 py-2.5 text-slate-500 font-black text-[10px] rounded-lg hover:text-white transition-all";
        rotatePanel.classList.add('hidden');
        paintControls.classList.remove('hidden');
        paintControls.classList.add('flex');
    } else {
        rotateBtn.className = "px-5 py-2.5 bg-emerald-500 font-black text-[10px] rounded-lg text-white shadow-lg transition-all";
        paintBtn.className = "px-5 py-2.5 text-slate-500 font-black text-[10px] rounded-lg hover:text-white transition-all";
        rotatePanel.classList.remove('hidden');
        paintControls.classList.add('hidden');
        paintControls.classList.remove('flex');
    }
}