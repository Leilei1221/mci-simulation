/* ============================================================
   大傷模擬技術考 — 共用遊戲引擎
   Shared game engine: HUD / timer / stage router / sortable /
   passcode gate / toast notifications
   ============================================================ */
(function () {
    'use strict';

    const state = {
        stage: 0,
        startTime: null,
        timerInterval: null,
        finalTime: '00:00',
        data: {}
    };

    let cfg = { name: '', sub: '', homeHref: '../', stages: [], onStage: null };

    function formatTime(ms) {
        const total = Math.max(0, Math.floor(ms / 1000));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function startTimer() {
        if (state.timerInterval) return;
        state.startTime = Date.now();
        state.timerInterval = setInterval(() => {
            const el = document.getElementById('hud-timer');
            if (el) el.textContent = formatTime(Date.now() - state.startTime);
        }, 1000);
    }

    function stopTimer() {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        if (state.startTime) state.finalTime = formatTime(Date.now() - state.startTime);
        return state.finalTime;
    }

    function headerHTML() {
        return `
        <header class="hud">
            <div class="hud-inner">
                <div class="hud-left">
                    <a class="hud-home" href="${cfg.homeHref}" title="回訓練平台" aria-label="回訓練平台">⌂</a>
                    <div class="hud-title">
                        <strong>${cfg.name}</strong>
                        <span>${cfg.sub}</span>
                    </div>
                </div>
                <div class="hud-timer" id="hud-timer">00:00</div>
            </div>
            <div class="hud-progress"><div id="hud-progress-bar"></div></div>
        </header>`;
    }

    function updateProgress() {
        const bar = document.getElementById('hud-progress-bar');
        if (!bar) return;
        const total = Math.max(1, cfg.stages.length - 1);
        bar.style.width = `${Math.min(100, (state.stage / total) * 100)}%`;
    }

    function render() {
        const app = document.getElementById('app');
        if (!app) return;
        const stageFn = cfg.stages[state.stage];
        if (!stageFn) return;
        const content = stageFn();
        app.classList.remove('fade-in');
        app.innerHTML = content.html;
        void app.offsetWidth; // restart animation
        app.classList.add('fade-in');
        updateProgress();
        if (typeof cfg.onStage === 'function') cfg.onStage(state.stage);
        if (typeof content.init === 'function') content.init();
        window.scrollTo({ top: 0 });
    }

    function goto(n) { state.stage = n; render(); }
    function next() { goto(state.stage + 1); }

    /* ---------- Toast ---------- */
    function toast(msg, type = 'error', duration = 4200) {
        let zone = document.getElementById('toast-zone');
        if (!zone) {
            zone = document.createElement('div');
            zone.id = 'toast-zone';
            document.body.appendChild(zone);
        }
        const t = document.createElement('div');
        t.className = `toast ${type}`;
        t.textContent = msg;
        zone.appendChild(t);
        setTimeout(() => {
            t.classList.add('out');
            setTimeout(() => t.remove(), 320);
        }, duration);
    }

    /* ---------- 密碼驗證 ---------- */
    function bindCode(btnId, inputId, codes, onSuccess, errMsg) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;
        const list = (Array.isArray(codes) ? codes : [codes]).map(c => String(c).trim().toLowerCase());
        const check = () => {
            const value = input.value.trim().toLowerCase();
            if (list.includes(value)) {
                onSuccess();
            } else {
                input.classList.add('error');
                toast(errMsg || '密碼錯誤，請重新輸入');
                setTimeout(() => input.classList.remove('error'), 500);
            }
        };
        btn.addEventListener('click', check);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    }

    /* ---------- 排序清單 (▲▼) ---------- */
    function sortable(containerId, items, rowHTML) {
        const box = document.getElementById(containerId);
        if (!box) return;
        function draw() {
            box.innerHTML = items.map((item, i) => `
                <div class="sort-item">
                    <div class="sort-body">${rowHTML(item, i)}</div>
                    <div class="sort-arrows">
                        <button type="button" class="arrow-btn" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''} aria-label="上移">▲</button>
                        <button type="button" class="arrow-btn" data-i="${i}" data-d="1" ${i === items.length - 1 ? 'disabled' : ''} aria-label="下移">▼</button>
                    </div>
                </div>`).join('');
        }
        box.onclick = (e) => {
            const btn = e.target.closest('.arrow-btn');
            if (!btn || btn.disabled) return;
            const i = Number(btn.dataset.i);
            const j = i + Number(btn.dataset.d);
            if (j < 0 || j >= items.length) return;
            [items[i], items[j]] = [items[j], items[i]];
            draw();
        };
        draw();
    }

    /* ---------- 複選選項 ---------- */
    function multiSelect(containerId, selectedSet) {
        const box = document.getElementById(containerId);
        if (!box) return;
        box.addEventListener('click', (e) => {
            const c = e.target.closest('.choice');
            if (!c || !c.dataset.id) return;
            const id = c.dataset.id;
            if (selectedSet.has(id)) selectedSet.delete(id);
            else selectedSet.add(id);
            c.classList.toggle('selected', selectedSet.has(id));
            let check = c.querySelector('.check');
            if (selectedSet.has(id) && !check) {
                check = document.createElement('span');
                check.className = 'check';
                check.textContent = '✔';
                c.appendChild(check);
            } else if (!selectedSet.has(id) && check) {
                check.remove();
            }
        });
    }

    /* ---------- 共用 HTML 片段 ---------- */
    const ui = {
        codeGate({ label = 'Security Clearance', placeholder = 'PASSCODE', btnText = '確認', inputId = 'codeInput', btnId = 'codeBtn' } = {}) {
            return `
            <span class="code-label">${label}</span>
            <div class="code-row" style="flex-direction:column">
                <input type="text" id="${inputId}" class="input-code" placeholder="${placeholder}" autocomplete="off" autocapitalize="off" spellcheck="false">
                <button type="button" id="${btnId}" class="btn btn-primary" style="margin-top:12px">${btnText}</button>
            </div>`;
        },
        card(title, bodyHTML, { tag = '', accentDot = true } = {}) {
            return `
            <section class="card">
                ${title ? `
                <div class="card-head">
                    ${accentDot ? '<span class="dot"></span>' : ''}
                    <h2>${title}</h2>
                    ${tag ? `<span class="tag">${tag}</span>` : ''}
                </div>` : ''}
                <div class="card-body">${bodyHTML}</div>
            </section>`;
        },
        finish({ subtitle, time, checklist, extraHTML = '' }) {
            return `
            <div class="finish-wrap">
                <div class="finish-medal">🏅</div>
                <h1 class="finish-title">Mission Accomplished</h1>
                <p class="finish-sub">${subtitle}</p>
                <div class="time-panel">
                    <div class="lbl">Total Operation Time</div>
                    <div class="val">${time}</div>
                </div>
                <div class="checklist">
                    <h4>撤收程序 Checklist</h4>
                    <ul>${checklist.map(item => `<li>${item}</li>`).join('')}</ul>
                </div>
                ${extraHTML}
                <p class="small-note">📸 請截圖保存此頁面成績，交由老師檢查</p>
                <button class="restart-link" onclick="location.reload()">Restart Simulation</button>
            </div>`;
        }
    };

    function mount(options) {
        cfg = Object.assign(cfg, options);
        document.body.insertAdjacentHTML('afterbegin', headerHTML());
        if (!document.getElementById('app')) {
            const main = document.createElement('main');
            main.className = 'stage-wrap';
            main.id = 'app';
            document.body.appendChild(main);
        }
        render();
    }

    window.Game = {
        mount, state, render, goto, next,
        startTimer, stopTimer, formatTime,
        toast, bindCode, sortable, multiSelect, ui
    };
})();
