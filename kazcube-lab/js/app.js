import * as Core from './cube-core.js';
import { initPaintTool, setPaintMode } from './paint-tool.js';

// ... moveSets 等の定義

function init() {
    // 1. ハッシュからの復元を最初に行う
    Core.loadFromHash();

    initPaintTool();

    // 2. モード設定
    // ハッシュに塗り絵がある(0が含まれる)場合はPaintモード、そうでなければRotate
    const hasMask = Core.stickerStates.includes(0);
    setPaintMode(hasMask ? 'paint' : 'rotate');

    // 3. COPY LINK ボタンの実装
    const copyBtn = document.querySelector('button.bg-indigo-600'); // COPY LINK
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = "COPIED!";
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        };
    }

    // ... 残りのイベント登録 ...
    updateMoveGrid();
    Core.render();
}

window.onload = init;