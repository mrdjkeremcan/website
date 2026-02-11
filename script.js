/* 
    MRDJKeremCan Website - Core Logic 
    v4.0 - Phase 2: Total Immersion (SFX, Boot, Launchpad)
*/

// --- 0. AUDIO ENGINE (Web Audio API) ---
const AudioEngine = {
    ctx: null,

    init: function () {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playTone: function (freq, type, duration, vol) {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    playKick: function () {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    },

    playSnare: function () {
        if (!this.ctx) this.init();
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1, this.ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start();
    },

    playHiHat: function () {
        if (!this.ctx) this.init();
        // Simple high freq tone for now, or noise
        this.playTone(8000, 'square', 0.05, 0.3);
    },

    playBassDrop: function () {
        if (!this.ctx) this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 2); // Slow drop

        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2); // Fade out

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 2);
    },

    playUIHover: function () {
        // High pitch chirp
        this.playTone(2000, 'sine', 0.05, 0.05);
    },

    playUIClick: function () {
        // Electric click
        this.playTone(800, 'sawtooth', 0.1, 0.1);
    }
};


// --- GLOBAL INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initBootSequence(); // New first step
    // Other inits happen after boot...
});

// --- 1. Boot Sequence ---
function initBootSequence() {
    // Only show boot screen once per session to not be annoying? 
    // For now, responsive to user request "her sayfada" but let's make it fast.

    const bootScreen = document.createElement('div');
    bootScreen.id = 'boot-screen';
    document.body.appendChild(bootScreen);

    const lines = [
        "SYSTEM_CHECK_INIT...",
        "CPU: OK",
        "RAM: OK",
        "LOADING_AUDIO_ENGINE...",
        "AUDIO_ENGINE: ONLINE",
        "CONNECTING_TO_CYBER_GRID...",
        "ACCESS_GRANTED."
    ];

    let delay = 0;
    lines.forEach((line, index) => {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'boot-line';
            p.innerText = `> ${line}`;
            bootScreen.appendChild(p);
            // Play boot sound (Safe)
            try {
                if (index < 3) AudioEngine.playTone(400 + (index * 100), 'square', 0.05, 0.1);
                if (index === lines.length - 1) AudioEngine.playTone(1000, 'sine', 0.5, 0.2);
            } catch (e) { }
        }, delay);
        delay += (Math.random() * 300) + 100;
    });

    setTimeout(() => {
        bootScreen.style.transition = 'opacity 0.5s';
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.remove();
            document.body.style.overflow = ''; // Restore scroll
            startMainSystems(); // Start everything else
        }, 500);
    }, delay + 500);
}

function startMainSystems() {
    initHomeEffects();
    initMatrixRain();
    initRetroChat();
    initEasterEgg();
    initCustomCursor();
    initLaunchpad();
    initUISounds();
}

// --- 2. Custom Cursor ---
function initCustomCursor() {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => cursor.classList.add('click'));
    document.addEventListener('mouseup', () => cursor.classList.remove('click'));

    // Hover effects
    const interactive = document.querySelectorAll('a, button, .logo, .music-card');
    interactive.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// --- 3. UI Sounds ---
function initUISounds() {
    // Resume context on first user interaction
    document.body.addEventListener('click', () => {
        if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
            AudioEngine.ctx.resume();
        }
    }, { once: true });

    const buttons = document.querySelectorAll('a, button, .cyber-btn, .lang-btn, .social-btn');
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    buttons.forEach(btn => {
        // Only play hover sound on non-touch devices
        if (!isTouch) {
            btn.addEventListener('mouseenter', () => AudioEngine.playUIHover());
        }
        btn.addEventListener('click', () => AudioEngine.playUIClick());
    });
}

// --- 4. Launchpad ---
function initLaunchpad() {
    // Visual Hint
    const overlay = document.createElement('div');
    overlay.id = 'launchpad-overlay';
    overlay.innerHTML = `
        <div class="pad-key" id="key-a">A</div>
        <div class="pad-key" id="key-s">S</div>
        <div class="pad-key" id="key-d">D</div>
        <div class="pad-key" id="key-f">F</div>
    `;
    document.body.appendChild(overlay);

    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;

        const key = e.key.toLowerCase();
        let el = null;

        switch (key) {
            case 'a':
                AudioEngine.playKick();
                el = document.getElementById('key-a');
                break;
            case 's':
                AudioEngine.playSnare();
                el = document.getElementById('key-s');
                break;
            case 'd':
                AudioEngine.playHiHat();
                el = document.getElementById('key-d');
                break;
            case 'f':
                AudioEngine.playBassDrop();
                el = document.getElementById('key-f');
                break;
        }

        if (el) {
            el.classList.add('active');
            setTimeout(() => el.classList.remove('active'), 100);
        }
    });
}


// --- 5. Homepage Effects (Slide Down) ---
function initHomeEffects() {
    const logo = document.querySelector('.logo');
    const hero = document.querySelector('.hero-box');
    const photo = document.querySelector('.photo-circle');
    const quote = document.querySelector('.reveal-quote');

    if (logo && hero && photo) {
        logo.addEventListener('click', () => {
            const isDown = hero.classList.contains('slide-down');

            if (!isDown) {
                hero.classList.add('slide-down');
                photo.classList.add('slide-down');
                if (quote) quote.classList.add('visible');

                logo.innerText = "SYSTEM_CRITICAL // GRAVITY_LOSS";
                logo.style.color = '#fff';
                logo.style.textShadow = '0 0 20px #fff, 0 0 40px #ff003c';
            } else {
                hero.classList.remove('slide-down');
                photo.classList.remove('slide-down');
                if (quote) quote.classList.remove('visible');

                logo.innerText = "SYSTEM.OVRD // MRDJKeremCan";
                logo.style.color = 'var(--neon-red)';
                logo.style.textShadow = '0 0 10px var(--neon-red)';
            }
        });
    }

    // Default Bio Lang
    if (document.getElementById('bio-tr') && !document.querySelector('.bio-content.active')) {
        setLang('tr');
    }
}

// --- 6. Matrix Rain Effect ---
function initMatrixRain() {
    const existing = document.getElementById('matrix-canvas');
    if (existing) return; // Prevent doubles

    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    const fontSize = 14;
    const columns = width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function draw() {
        ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            if (Math.random() > 0.98) ctx.fillStyle = '#F00';
            else ctx.fillStyle = '#0F0';

            ctx.fillText(text, x, y);

            if (y > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 50);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// --- 7. Retro Chat Widget (INTELLIGENT BOT) ---
function initRetroChat() {
    const existing = document.getElementById('chat-widget');
    if (existing) return;

    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
        <div id="chat-header">
            <span>IRC :: GLOBAL_CHAT</span>
            <span id="chat-toggle" style="font-size:1.2rem;">_</span>
        </div>
        <div id="chat-body">
            <div class="chat-msg system">> CONNECTION ESTABLISHED...</div>
            <div class="chat-msg system">> WELCOME GUEST_USER</div>
        </div>
        <div id="chat-input-area">
            <input type="text" id="chat-input" placeholder="Type message...">
            <button id="chat-send">></button>
        </div>
    `;
    document.body.appendChild(widget);

    const header = document.getElementById('chat-header');
    const body = document.getElementById('chat-body');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    let isOpen = true;

    // Toggle Logic
    header.addEventListener('click', () => {
        if (isOpen) {
            widget.style.bottom = '-320px';
            header.style.background = '#333';
        } else {
            widget.style.bottom = '20px';
            header.style.background = 'var(--neon-red)';
        }
        isOpen = !isOpen;
    });

    // --- CHAT INTELLIGENCE ---
    const botResponses = {
        'hello': ["USER_99: Yo!", "SYSTEM: Welcome to the server.", "GUEST_404: Hi there."],
        'selam': ["GUEST_TR: Aleyküm selam!", "SYSTEM: Selamlar, hoş geldin.", "MRDJKeremCan: Selam!"],
        'music': ["USER_01: The bass is heavy today.", "SYSTEM: Check the Spotify tab for new tracks.", "GUEST_X: Ritual of Us is playing now."],
        'dj': ["GUEST_FAN: Kerem is the best!", "SYSTEM: Resident DJ Status: ONLINE.", "USER_23: When is the next set?"],
        'kick': ["SYSTEM: Live stream is offline currently.", "GUEST_STREAM: Kick link is in Contact page.", "USER_MOD: Follow the channel!"],
        'hack': ["SYSTEM: ⚠️ ILLEGAL OPERATION DETECTED.", "ADMIN: Don't try that here.", "GUEST_HACKER: *smirks*"],
        'password': ["SYSTEM: **********", "ADMIN: Nice try.", "GUEST_1: Hunter2"],
        'mrdj': ["SYSTEM: Subject identified: Kerem Can.", "GUEST_FAN: King of Afro House!", "USER_77: Respect."],
        'event': ["SYSTEM: Check MISSION_LOGS for dates.", "USER_PARTY: Tonight we rave!", "GUEST_90: Antalya events looking fire."],
        'default': ["SYSTEM: Acknowledged.", "GUEST_X: ...", "USER_? : Interesting.", "SYSTEM: Data packet received.", "GUEST_RND: Anyone else hearing this?"]
    };

    function getBotResponse(msg) {
        const lowerMsg = msg.toLowerCase();
        const key = Object.keys(botResponses).find(k => lowerMsg.includes(k));
        const possibleResponses = key ? botResponses[key] : botResponses['default'];
        return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
    }

    function addMessage(type, text) {
        const msg = document.createElement('div');
        msg.className = 'chat-msg ' + type;
        msg.innerText = text;
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
    }

    function sendMessage() {
        const txt = input.value.trim();
        if (!txt) return;

        addMessage('user', 'YOU: ' + txt);
        input.value = '';
        AudioEngine.playUIClick(); // Sound effect

        const delay = 500 + Math.random() * 1000;

        setTimeout(() => {
            const response = getBotResponse(txt);
            let type = 'guest';
            if (response.startsWith('SYSTEM:')) type = 'system';
            if (response.startsWith('ADMIN:') || response.startsWith('MRDJKeremCan:')) type = 'system';

            addMessage(type, response);
            AudioEngine.playUIHover(); // Sound effect for incoming msg
        }, delay);
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// --- 8. Konami Code Easter Egg ---
function initEasterEgg() {
    const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let inputSequence = [];

    // Create Modal HTML if not exists
    if (!document.getElementById('hack-modal')) {
        const modal = document.createElement('div');
        modal.id = 'hack-modal';
        modal.innerHTML = `
            <div class="hack-text">SYSTEM HACKED</div>
            <p style="color:#fff; margin-bottom:20px;">ACCESS LEVEL: ROOT_ADMIN</p>
            <p style="color:var(--neon-green);">UNLOCKED: SECRET_SET_001.mp3</p>
            <button class="cyber-btn" onclick="document.getElementById('hack-modal').style.display='none'" style="margin-top:20px;">CLOSE</button>
        `;
        document.body.appendChild(modal);

        const overlay = document.createElement('div');
        overlay.className = 'overlay-scan';
        document.body.appendChild(overlay);
    }

    window.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;

        inputSequence.push(e.key);

        if (inputSequence.length > secretCode.length) {
            inputSequence.shift();
        }

        if (JSON.stringify(inputSequence) === JSON.stringify(secretCode)) {
            triggerHack();
        }
    });

    function triggerHack() {
        const modal = document.getElementById('hack-modal');
        const overlay = document.querySelector('.overlay-scan');
        if (modal) modal.style.display = 'block';
        if (overlay) overlay.style.display = 'block';

        AudioEngine.playBassDrop(); // Sound effect
        document.body.style.filter = 'invert(1)';
        setTimeout(() => {
            document.body.style.filter = 'none';
        }, 200);
    }
}

// --- Sidebar Navigation ---
function openNav() {
    if (window.innerWidth <= 768) {
        document.getElementById("mySidenav").style.width = "100%";
    } else {
        document.getElementById("mySidenav").style.width = "250px";
    }
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

// --- Biography Language Toggle ---
function setLang(lang) {
    const bioTexts = document.querySelectorAll('.bio-content');
    const langBtns = document.querySelectorAll('.lang-btn');

    if (bioTexts.length === 0) return;

    bioTexts.forEach(el => el.classList.remove('active'));
    document.getElementById('bio-' + lang).classList.add('active');

    langBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(langBtns).find(btn => btn.innerText.toLowerCase() === lang);
    if (activeBtn) activeBtn.classList.add('active');
}
