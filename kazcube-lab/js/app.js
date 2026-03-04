/**
 * KAZCUBE Lab Application Module
 * [v2.0.4] 2026-03-04
 * [Added] 言語切り替え (JP/EN) ロジック
 * [Added] ナビゲーションボタン (first/last/prev/next) のイベント登録
 * [Added] Copy Link ボタンのフィードバック処理
 */

import * as Core from './cube-core.js?v=2.0.4';
import { initPaintTool, setPaintMode } from './paint-tool.js?v=2.0.4';

const moveSets = {
    basic: ["U", "D", "L", "R", "F", "B"],
    wide: ["u", "d", "l", "r", "f", "b"],
    slice: ["E", "M", "S", "x", "y", "z"]
};

const i18n = {
    jp: { scramble: "スクランブル", setup: "セットアップ設定", reset: "全データリセット", placeholder: "手順を入力..." },
    en: { scramble: "SCRAMBLE", setup: "SET SETUP", reset: "RESET ALL DATA", placeholder: "Enter algorithm..." }
};

function setLanguage(lang) {
    const texts = i18n[lang];
    document.getElementById('scramble-btn').textContent = texts.scramble;
    document.getElementById('setup-btn').textContent = texts.setup;
    document.getElementById('reset-btn').textContent = texts.reset;
    document.getElementById('command-box').placeholder = texts.placeholder;
    const btnJp = document.getElementById('lang-jp'), btnEn = document.getElementById('lang-en');
    btnJp.className = `px-3 py-1 text-[10px] font-bold ${lang === 'jp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'} rounded-md transition`;
    btnEn.className = `px-3 py-1 text-[10px] font-bold ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'} rounded-md transition`;
}

function updateMoveGrid(tab = "basic") {
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    grid.innerHTML = "";
    moveSets[tab].forEach(m => {
        ["", "'", "2"].forEach(mod => {
            const move = m + mod;
            const btn = document.createElement('button');
            btn.textContent = move;
            btn.className = "bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-bold text-xs text-white transition active:scale-95";
            btn.onclick = () => { 
                Core.activeMoves.push(move); 
                const slider = document.getElementById('move-slider');
                if (slider) { slider.max = Core.activeMoves.length; slider.value = Core.activeMoves.length; }
                Core.render(); 
            };
            grid.appendChild(btn);
        });
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.className = isActive 
            ? "tab-btn px-4 py-2 text-[10px] font-black uppercase text-blue-500 border-b-2 border-blue-500"
            : "tab-btn px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition";
    });
}

window.onload = () => {
    Core.loadFromHash();
    initPaintTool();
    document.getElementById('lang-jp').onclick = () => setLanguage('jp');
    document.getElementById('lang-en').onclick = () => setLanguage('en');
    const slider = document.getElementById('move-slider');
    const updateAndRender = (val) => { if (slider) { slider.value = val; Core.render(); } };
    document.getElementById('nav-first').onclick = () => updateAndRender(0);
    document.getElementById('nav-last').onclick = () => updateAndRender(Core.activeMoves.length);
    document.getElementById('nav-prev').onclick = () => updateAndRender(Math.max(0, parseInt(slider.value) - 1));
    document.getElementById('nav-next').onclick = () => updateAndRender(Math.min(Core.activeMoves.length, parseInt(slider.value) + 1));
    document.getElementById('mode-rotate').onclick = () => setPaintMode('rotate');
    document.getElementById('mode-paint').onclick = () => setPaintMode('paint');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.onclick = () => updateMoveGrid(btn.dataset.tab));
    document.getElementById('scramble-btn').onclick = Core.handleScramble;
    document.getElementById('setup-btn').onclick = Core.applySetup;
    document.getElementById('reset-btn').onclick = () => {
        if (confirm("Reset all?")) { Core.resetAll(); window.location.hash = ""; window.location.reload(); }
    };
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "COPIED!";
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        };
    }
    if (slider) slider.oninput = () => Core.render();
    updateMoveGrid('basic');
    setLanguage('jp');
    setPaintMode(Core.stickerStates.includes(0) ? 'paint' : 'rotate');
    Core.render();
};