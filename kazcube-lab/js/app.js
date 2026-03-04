// js/app.js (抜粋)
function updateMoveGrid() {
    const grid = document.getElementById('move-grid');
    const panel = document.querySelector('.tab-content-panel');
    if (!grid || !panel) return;
    
    grid.innerHTML = "";
    
    // デザイン調整：最初のタブ(Basic)がアクティブなら左上の角を直角にしてタブと繋げる
    if (currentTab === 'basic') {
        panel.style.borderRadius = "0 15px 15px 15px";
    } else {
        panel.style.borderRadius = "15px";
    }

    const faces = moveSets[currentTab];
    faces.forEach(f => {
        [f, f + "'", f + "2"].forEach(m => {
            const b = document.createElement('button');
            b.className = "bg-slate-800/50 py-2.5 rounded-lg font-mono text-[11px] font-bold hover:bg-slate-700 transition border border-slate-700/30";
            b.textContent = m;
            b.onclick = () => {
                Core.activeMoves.push(m);
                const slider = document.getElementById('move-slider');
                if (slider) {
                    slider.max = Core.activeMoves.length;
                    slider.value = Core.activeMoves.length;
                }
                Core.render();
            };
            grid.appendChild(b);
        });
    });
}