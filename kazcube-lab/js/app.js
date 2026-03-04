import * as Core from './cube-core.js';
import { initPaintTool, setPaintMode } from './paint-tool.js';

function init() {
    console.log(`KAZCUBE Lab: Initializing ${Core.JS_VERSION}...`);

    // 1. ハッシュから復元
    Core.loadFromHash();

    // 2. ペイントツール初期化
    initPaintTool();

    // 3. ボタン登録
    document.getElementById('mode-rotate').onclick = () => setPaintMode('rotate');
    document.getElementById('mode-paint').onclick = () => setPaintMode('paint');
    document.getElementById('scramble-btn').onclick = Core.handleScramble;
    document.getElementById('setup-btn').onclick = Core.applySetup;

    // 4. COPY LINK
    const copyBtn = document.querySelector('button.bg-indigo-600');
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            const old = copyBtn.textContent;
            copyBtn.textContent = "COPIED!";
            setTimeout(() => copyBtn.textContent = old, 2000);
        };
    }

    // 初期モード設定
    const hasMask = Core.stickerStates.includes(0);
    setPaintMode(hasMask ? 'paint' : 'rotate');

    Core.render();
}

window.onload = init;