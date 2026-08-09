/* ============================================================
   سوبر جري - Super Run
   لعبة منصّات على طراز ماريو، بتقنية Canvas، تعمل باللمس والكيبورد.
   رسم عالي الدقة + كوينات متموّجة + كوين يطلع من الصناديق.
   ============================================================ */
(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // أبعاد العالم المنطقية (الكاميرا) — الرسم كله بهذه الوحدات
  const VW = 480;
  const VH = 360;

  // ============ إعدادات فيزياء اللعبة ============
  const GRAVITY = 0.6;
  const MOVE_SPEED = 2.9;
  const JUMP_VELOCITY = -12.6; // قفزة أعلى: توصل ~4.3 خانات
  const MAX_FALL = 13;
  const TILE = 30;
  const GROUND_ROW = 10; // صفوف الأرض: 10 و 11
  const START_ROW = 9;   // صف بداية اللاعب والأعداء (فوق الأرض)
  const PLAYER_SIZES = { small: { w: 22, h: 28 }, big: { w: 28, h: 40 }, fire: { w: 28, h: 40 } };

  // ألوان
  const C = {
    body: "#e8433a", skin: "#ffcf9e", cap: "#e8433a",
    overall: "#2b56d6", shoe: "#5a2d0c",
    coin: "#ffd21a", coinDark: "#d99a00", coinLight: "#fff6b0",
    enemy: "#9a5a2c", enemyDark: "#6b3d1a", enemyFoot: "#3a1d05",
  };

  // ============ تصميم المراحل (منطقي) ============
  // كل مرحلة تُبنى برمجياً: أرض متصلة بها فجوات، منصّات في متناول القفز،
  // كوينات في أقواس فوق الفجوات وفوق الصناديق، وأعداء على الأرض.
  const CONFIGS = [
    {
      width: 62,
      gaps: [[21, 2], [40, 2]],
      platforms: [
        { col: 8, row: 7, len: 1, type: "block" },
        { col: 14, row: 7, len: 2, type: "brick" },
        { col: 16, row: 7, len: 1, type: "block" },
        { col: 17, row: 7, len: 2, type: "brick" },
        { col: 29, row: 6, len: 3, type: "brick" },
        { col: 34, row: 7, len: 1, type: "block" },
        { col: 47, row: 7, len: 1, type: "block" },
        { col: 50, row: 6, len: 3, type: "brick" },
      ],
      coins: [[8, 5], [16, 5], [29, 4], [30, 4], [31, 4], [34, 5], [47, 5], [51, 4], [52, 4]],
      enemies: [12, 26, 37, 45, 54],
      pipes: [{ col: 24, warp: true }],
      start: 2,
    },
    {
      width: 78,
      gaps: [[18, 2], [33, 2], [52, 2], [66, 2]],
      platforms: [
        { col: 9, row: 7, len: 3, type: "brick" },
        { col: 10, row: 7, len: 1, type: "block" },
        { col: 25, row: 6, len: 1, type: "block" },
        { col: 27, row: 6, len: 1, type: "block" },
        { col: 26, row: 6, len: 1, type: "brick" },
        { col: 40, row: 7, len: 4, type: "brick" },
        { col: 42, row: 7, len: 1, type: "block" },
        { col: 44, row: 5, len: 3, type: "brick" },
        { col: 58, row: 7, len: 1, type: "block" },
        { col: 60, row: 6, len: 3, type: "brick" },
        { col: 61, row: 6, len: 1, type: "block" },
      ],
      coins: [[10, 5], [25, 4], [26, 4], [27, 4], [44, 3], [45, 3], [46, 3], [42, 5], [60, 4], [61, 4], [62, 4]],
      enemies: [14, 24, 30, 43, 48, 56, 63],
      pipes: [{ col: 37, warp: true }],
      start: 2,
    },
    {
      width: 92,
      gaps: [[16, 2], [28, 2], [41, 2], [55, 2], [68, 2], [80, 2]],
      platforms: [
        { col: 8, row: 6, len: 3, type: "brick" },
        { col: 9, row: 6, len: 1, type: "block" },
        { col: 22, row: 7, len: 1, type: "block" },
        { col: 24, row: 7, len: 1, type: "block" },
        { col: 35, row: 6, len: 4, type: "brick" },
        { col: 37, row: 6, len: 1, type: "block" },
        { col: 48, row: 7, len: 1, type: "block" },
        { col: 50, row: 5, len: 3, type: "brick" },
        { col: 62, row: 6, len: 3, type: "brick" },
        { col: 63, row: 6, len: 1, type: "block" },
        { col: 74, row: 7, len: 1, type: "block" },
        { col: 76, row: 6, len: 3, type: "brick" },
      ],
      coins: [[8, 4], [9, 4], [10, 4], [22, 5], [24, 5], [36, 4], [37, 4], [50, 3], [51, 3], [52, 3], [62, 4], [63, 4], [76, 4], [77, 4]],
      enemies: [12, 20, 26, 33, 39, 46, 53, 60, 66, 73, 84],
      start: 2,
    },
    {
      width: 100,
      gaps: [[14, 2], [26, 2], [37, 2], [49, 2], [60, 2], [72, 2], [85, 2]],
      platforms: [
        { col: 7, row: 7, len: 1, type: "block" },
        { col: 9, row: 5, len: 3, type: "brick" },
        { col: 20, row: 6, len: 1, type: "block" },
        { col: 22, row: 6, len: 1, type: "block" },
        { col: 31, row: 7, len: 4, type: "brick" },
        { col: 33, row: 7, len: 1, type: "block" },
        { col: 43, row: 5, len: 3, type: "brick" },
        { col: 44, row: 5, len: 1, type: "block" },
        { col: 55, row: 6, len: 1, type: "block" },
        { col: 57, row: 6, len: 1, type: "block" },
        { col: 66, row: 6, len: 4, type: "brick" },
        { col: 68, row: 6, len: 1, type: "block" },
        { col: 80, row: 5, len: 3, type: "brick" },
        { col: 90, row: 7, len: 1, type: "block" },
      ],
      coins: [[9, 4], [10, 4], [11, 4], [20, 5], [22, 5], [32, 6], [33, 6], [43, 4], [44, 4], [45, 4], [55, 5], [57, 5], [67, 5], [68, 5], [80, 4], [81, 4], [82, 4], [90, 6]],
      enemies: [11, 18, 24, 29, 35, 41, 47, 53, 58, 64, 70, 77, 82, 93],
      start: 2,
    },
    {
      width: 112,
      gaps: [[12, 2], [22, 2], [32, 2], [43, 2], [53, 2], [64, 2], [74, 2], [85, 2], [96, 2]],
      platforms: [
        { col: 7, row: 6, len: 3, type: "brick" },
        { col: 8, row: 6, len: 1, type: "block" },
        { col: 17, row: 7, len: 1, type: "block" },
        { col: 27, row: 5, len: 3, type: "brick" },
        { col: 28, row: 5, len: 1, type: "block" },
        { col: 38, row: 6, len: 1, type: "block" },
        { col: 40, row: 6, len: 1, type: "block" },
        { col: 48, row: 7, len: 4, type: "brick" },
        { col: 50, row: 7, len: 1, type: "block" },
        { col: 59, row: 5, len: 3, type: "brick" },
        { col: 60, row: 5, len: 1, type: "block" },
        { col: 70, row: 6, len: 1, type: "block" },
        { col: 72, row: 6, len: 1, type: "block" },
        { col: 80, row: 6, len: 4, type: "brick" },
        { col: 82, row: 6, len: 1, type: "block" },
        { col: 91, row: 5, len: 3, type: "brick" },
        { col: 102, row: 7, len: 1, type: "block" },
      ],
      coins: [[7, 4], [8, 4], [9, 4], [17, 5], [27, 3], [28, 3], [29, 3], [38, 5], [40, 5], [49, 6], [50, 6], [59, 4], [60, 4], [61, 4], [70, 5], [72, 5], [81, 5], [82, 5], [91, 3], [92, 3], [93, 3], [102, 6]],
      enemies: [10, 15, 20, 25, 30, 36, 41, 46, 52, 57, 62, 68, 73, 78, 83, 89, 94, 105],
      start: 2,
    },
    { // مرحلة الزعيم (الأخيرة)
      width: 22, boss: true,
      gaps: [],
      platforms: [{ col: 5, row: 7, len: 2, type: "brick" }, { col: 15, row: 7, len: 2, type: "brick" }],
      coins: [], enemies: [],
      start: 2,
    },
  ];

  // ============ حالة اللعبة ============
  let state = "start";
  let level = 0, coins = 0, lives = 3, score = 0;
  const LEVEL_TIME = 300;
  let timeLeft = LEVEL_TIME, timeAcc = 0;
  let solids = [], coinList = [], enemies = [], popCoins = [], powerups = [], fireballs = [], particles = [];
  let flag = null, worldW = 0, worldH = 0, player = null, camX = 0;
  let warpPipes = [], boss = null, currentWarp = null, inSecret = false, secretReturn = null;
  let playerState = "small"; // small | big | fire (يستمر بين المراحل)

  let bestScore = parseInt(localStorage.getItem("superRunBestScore") || "0", 10) || 0;
  let progress = parseInt(localStorage.getItem("superRunProgress") || "0", 10) || 0;
  function addScore(n) { score += n; updateHUD(); }
  (function showStartInfo() {
    const el = document.getElementById("best-line");
    if (el && bestScore > 0) el.textContent = "🏆 أعلى نتيجة: " + bestScore;
    const cb = document.getElementById("continue-btn");
    if (cb && progress > 0) {
      document.getElementById("cont-level").textContent = progress + 1;
      cb.style.display = "";
    }
  })();

  const keys = { left: false, right: false, jump: false, down: false };

  // ============ محرّك الصوت (WebAudio بدون ملفات) ============
  const Sound = (function () {
    let ac = null;
    let muted = localStorage.getItem("superRunMuted") === "1";
    function ctx2() {
      if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
      if (ac && ac.state === "suspended") ac.resume();
      return ac;
    }
    function tone(freq, dur, type, vol, whenOffset) {
      if (muted) return;
      const a = ctx2(); if (!a) return;
      const t0 = a.currentTime + (whenOffset || 0);
      const osc = a.createOscillator(), g = a.createGain();
      osc.type = type || "square";
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(a.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    }
    // نغمة عند وقت مطلق (للموسيقى)
    function blip(freq, tAbs, dur, type, vol) {
      const a = ac; if (!a || muted) return;
      const osc = a.createOscillator(), g = a.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, tAbs);
      g.gain.setValueAtTime(0.0001, tAbs);
      g.gain.exponentialRampToValueAtTime(vol, tAbs + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, tAbs + dur);
      osc.connect(g); g.connect(a.destination);
      osc.start(tAbs); osc.stop(tAbs + dur + 0.02);
    }
    // مُسلسِل موسيقى بسيط (لحن أصلي متكرّر)
    const LEAD = [392, 523, 659, 523, 587, 493, 587, 392, 440, 523, 659, 523, 587, 784, 659, 523];
    const BASS = [130.81, 130.81, 98, 98, 110, 110, 87.31, 98];
    let musicOn = false, mTimer = null, mStep = 0, mNext = 0;
    const STEP_DUR = 60 / 132 / 2; // إيقاع ثامنات عند 132bpm
    function mScheduler() {
      const a = ctx2(); if (!a) return;
      while (mNext < a.currentTime + 0.12) {
        const lf = LEAD[mStep % LEAD.length];
        if (lf) blip(lf, mNext, STEP_DUR * 0.9, "square", 0.05);
        if (mStep % 2 === 0) { const bf = BASS[(mStep / 2) % BASS.length]; if (bf) blip(bf, mNext, STEP_DUR * 1.8, "triangle", 0.06); }
        mNext += STEP_DUR; mStep++;
      }
    }

    return {
      isMuted: () => muted,
      toggle() { muted = !muted; localStorage.setItem("superRunMuted", muted ? "1" : "0"); if (!muted) tone(660, 0.08, "square", 0.15, 0); return muted; },
      resume() { ctx2(); },
      startMusic() { const a = ctx2(); if (!a || musicOn) return; musicOn = true; mStep = 0; mNext = a.currentTime + 0.1; mTimer = setInterval(mScheduler, 25); },
      stopMusic() { musicOn = false; if (mTimer) { clearInterval(mTimer); mTimer = null; } },
      jump() { tone(420, 0.14, "square", 0.14, 0); tone(700, 0.12, "square", 0.12, 0.05); },
      coin() { tone(988, 0.07, "square", 0.14, 0); tone(1319, 0.12, "square", 0.13, 0.06); },
      stomp() { tone(200, 0.12, "sawtooth", 0.18, 0); tone(120, 0.14, "sawtooth", 0.14, 0.05); },
      die() { tone(400, 0.15, "square", 0.16, 0); tone(300, 0.15, "square", 0.15, 0.12); tone(150, 0.3, "square", 0.15, 0.24); },
      win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, "square", 0.16, i * 0.12)); },
      power() { [392, 523, 659].forEach((f, i) => tone(f, 0.1, "square", 0.13, i * 0.06)); }, // ظهور القوة
      grow() { [523, 784, 1047, 1319].forEach((f, i) => tone(f, 0.09, "square", 0.15, i * 0.05)); }, // التكبير
      hurt() { tone(300, 0.12, "sawtooth", 0.16, 0); tone(200, 0.14, "sawtooth", 0.14, 0.08); }, // الأذى
      fire() { tone(880, 0.06, "square", 0.12, 0); tone(560, 0.08, "square", 0.1, 0.04); }, // رمي النار
      pipe() { tone(300, 0.12, "sine", 0.16, 0); tone(180, 0.16, "sine", 0.14, 0.1); tone(110, 0.2, "sine", 0.12, 0.22); }, // دخول أنبوب
    };
  })();

  // ============ بناء المرحلة من الإعداد ============
  function inGap(col, gaps) {
    for (const g of gaps) if (col >= g[0] && col < g[0] + g[1]) return true;
    return false;
  }
  function buildLevel(idx) {
    const cfg = CONFIGS[idx];
    solids = []; coinList = []; enemies = []; popCoins = []; powerups = []; fireballs = []; particles = [];
    warpPipes = []; boss = null; currentWarp = null; inSecret = false; secretReturn = null;
    worldW = cfg.width * TILE; worldH = 12 * TILE;
    timeLeft = LEVEL_TIME; timeAcc = 0;
    if (idx > progress) { progress = idx; localStorage.setItem("superRunProgress", String(progress)); }

    // الأرض (صفّان) مع فجوات
    for (let col = 0; col < cfg.width; col++) {
      if (inGap(col, cfg.gaps)) continue;
      solids.push({ x: col * TILE, y: GROUND_ROW * TILE, w: TILE, h: TILE, type: "ground" });
      solids.push({ x: col * TILE, y: (GROUND_ROW + 1) * TILE, w: TILE, h: TILE, type: "ground" });
    }
    // المنصّات — نثبّت ارتفاعها في الصفوف 6 أو 7 فقط لتظل في متناول القفز من الأرض
    // بعض صناديق ؟ نحوّلها لصناديق قوى (الأول والثالث) لتعطي فطر/زهرة نار
    let blockOrder = 0;
    for (const p of cfg.platforms) {
      const row = p.row < 6 ? 6 : (p.row > 7 ? 7 : p.row);
      let ptype = p.type;
      if (p.type === "block") { if (blockOrder === 0 || blockOrder === 2) ptype = "power"; blockOrder++; }
      for (let i = 0; i < p.len; i++) {
        const s = { x: (p.col + i) * TILE, y: row * TILE, w: TILE, h: TILE, type: ptype };
        solids.push(s);
        // كوين يستقرّ فوق الطوب فقط (مش فوق صناديق ؟). نطح الطوبة من تحت يلتقطه.
        if (p.type === "brick") addCoinXY(s.x + TILE / 2, s.y - 15);
      }
    }
    // كوينات أقواس فوق كل فجوة، على ارتفاع منخفض قابل للوصول (يرشدك للقفز)
    for (const g of cfg.gaps) {
      const s = g[0], w = g[1];
      addCoin(s - 1, 8); addCoin(s + w, 8);
      for (let i = 0; i < w; i++) addCoin(s + i, 7);
    }
    // الأعداء على الأرض — بأنواع/أشكال مختلفة
    for (let k = 0; k < cfg.enemies.length; k++) {
      const item = cfg.enemies[k];
      const col = typeof item === "object" ? item.col : item;
      const kind = typeof item === "object" && item.type ? item.type : ENEMY_KINDS[col % ENEMY_KINDS.length];
      enemies.push(makeEnemy(col * TILE, START_ROW * TILE, kind));
    }
    // الأنابيب الخضراء (بعضها يوصّل لغرفة سرية)
    if (cfg.pipes) for (const pp of cfg.pipes) {
      for (let r = 8; r <= 9; r++) for (let c = 0; c < 2; c++) solids.push({ x: (pp.col + c) * TILE, y: r * TILE, w: TILE, h: TILE, type: "pipe" });
      if (pp.warp) warpPipes.push({ x: pp.col * TILE, y: 8 * TILE, w: 2 * TILE });
    }
    // اللاعب (بحجم يوافق حالته الحالية)
    const sz = PLAYER_SIZES[playerState];
    player = { x: cfg.start * TILE, y: GROUND_ROW * TILE - sz.h, w: sz.w, h: sz.h, vx: 0, vy: 0, onGround: false, face: 1, dead: false, animTime: 0, state: playerState, invuln: 0 };
    if (cfg.boss) {
      // جدران حلبة الزعيم على الجانبين
      for (let r = 3; r <= 9; r++) {
        solids.push({ x: 0, y: r * TILE, w: TILE, h: TILE, type: "pipe" });
        solids.push({ x: (cfg.width - 1) * TILE, y: r * TILE, w: TILE, h: TILE, type: "pipe" });
      }
      boss = { x: (cfg.width / 2) * TILE - 27, y: GROUND_ROW * TILE - 54, w: 54, h: 54, dir: -1, speed: 1.5, vy: 0, hp: 3, maxhp: 3, alive: true, hitCd: 0, animTime: 0, jumpCd: 90 };
      flag = null;
    } else {
      // العلَم في النهاية
      flag = { x: (cfg.width - 2) * TILE + TILE / 2, y: GROUND_ROW * TILE };
    }
    camX = 0;
    refreshFireBtn();
  }
  function addCoin(col, row) { addCoinXY(col * TILE + TILE / 2, row * TILE + TILE / 2); }
  function addCoinXY(x, y) { coinList.push({ x: x, y: y, got: false, phase: x * 0.02 }); }

  // أنواع الأعداء (أشكال مختلفة)
  const ENEMY_KINDS = ["goomba", "koopa", "spike"];
  function makeEnemy(x, y, kind) {
    const spec = {
      goomba: { w: 26, h: 24, speed: 1.15 },
      koopa: { w: 26, h: 30, speed: 0.95 },
      spike: { w: 26, h: 22, speed: 1.4 },
    }[kind] || { w: 26, h: 24, speed: 1.15 };
    return { x: x + 2, y: y + (26 - spec.h), w: spec.w, h: spec.h, vx: -spec.speed, vy: 0, alive: true, dieTime: 0, animTime: 0, kind: kind };
  }

  // ============ كشف التصادم ============
  function rectHit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ============ تحديث اللاعب ============
  function updatePlayer() {
    const p = player;
    if (p.invuln > 0) p.invuln--;
    if (keys.left) { p.vx = -MOVE_SPEED; p.face = -1; }
    else if (keys.right) { p.vx = MOVE_SPEED; p.face = 1; }
    else p.vx = 0;

    if (keys.jump && p.onGround) { p.vy = JUMP_VELOCITY; p.onGround = false; Sound.jump(); }

    p.vy += GRAVITY;
    if (p.vy > MAX_FALL) p.vy = MAX_FALL;

    p.x += p.vx;
    for (const s of solids) {
      if (rectHit(p, s)) {
        if (p.vx > 0) p.x = s.x - p.w; else if (p.vx < 0) p.x = s.x + s.w;
        p.vx = 0;
      }
    }
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > worldW) p.x = worldW - p.w;

    p.onGround = false;
    p.y += p.vy;
    for (const s of solids) {
      if (rectHit(p, s)) {
        if (p.vy > 0) { p.y = s.y - p.h; p.vy = 0; p.onGround = true; }
        else if (p.vy < 0) {
          p.y = s.y + s.h; p.vy = 0;
          if (s.type === "block") { s.type = "used"; s.bump = 8; spawnPopCoin(s.x + s.w / 2, s.y); }
          else if (s.type === "power") { s.type = "used"; s.bump = 8; spawnPowerup(s.x + s.w / 2, s.y); }
          else if (s.type === "brick") { s.bump = 6; if (collectCoinOn(s)) s.type = "used"; }
        }
      }
    }

    if (Math.abs(p.vx) > 0.1) p.animTime += 1;
    if (p.y > worldH + 40) killPlayer();

    for (const coin of coinList) {
      if (!coin.got && rectHit(p, { x: coin.x - 9, y: coin.y - 9, w: 18, h: 18 })) {
        coin.got = true; coins++; score += 100; updateHUD(); Sound.coin(); burst(coin.x, coin.y, PC_GOLD, 8);
      }
    }
    if (flag && p.x + p.w > flag.x - 6) winLevel();

    // كشف الوقوف على أنبوب سحري + الدخول/الخروج
    currentWarp = null;
    if (p.onGround) {
      for (const wp of warpPipes) {
        if (wp.used) continue; // أنبوب دخول مُستهلَك (منع تكرار جمع الكوينز)
        if (p.x + p.w > wp.x + 4 && p.x < wp.x + wp.w - 4 && Math.abs((p.y + p.h) - wp.y) < 6) { currentWarp = wp; break; }
      }
    }
    if (currentWarp && keys.down) { keys.down = false; if (inSecret) exitSecret(); else enterPipe(currentWarp); }
  }

  // نطح الطوبة يلتقط الكوين المستقرّ فوقها — يرجّع true لو التقط كوين
  function collectCoinOn(s) {
    let got = false;
    for (const coin of coinList) {
      if (coin.got) continue;
      if (Math.abs(coin.x - (s.x + s.w / 2)) < 16 && coin.y > s.y - 26 && coin.y < s.y) {
        coin.got = true; spawnPopCoin(coin.x, s.y - 4); got = true;
      }
    }
    return got;
  }

  // كوين يطلع من الصندوق
  function spawnPopCoin(x, y) {
    popCoins.push({ x: x, y: y - 6, vy: -6.2, life: 34 });
    coins++; score += 100; updateHUD(); Sound.coin(); burst(x, y - 6, PC_GOLD, 8);
  }
  function updatePopCoins() {
    for (const pc of popCoins) { pc.vy += 0.42; pc.y += pc.vy; pc.life--; }
    popCoins = popCoins.filter((pc) => pc.life > 0);
  }

  // ============ الجسيمات (شرر/نجوم) ============
  const PC_GOLD = ["#ffd21a", "#fff6b0", "#d99a00"];
  const PC_STOMP = ["#ffffff", "#c8c8c8", "#9a5a2c"];
  const PC_FIRE = ["#ff9b1a", "#ffd21a", "#e53211"];
  const PC_POWER = ["#ff5a4d", "#2ecc40", "#ffd21a", "#3aa0ff"];
  function burst(x, y, colors, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 2.6;
      particles.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.6, life: 26 + Math.random() * 12, max: 38, color: colors[(Math.random() * colors.length) | 0], size: 2 + Math.random() * 2.5 });
    }
  }
  function updateParticles() {
    for (const p of particles) { p.vy += 0.16; p.x += p.vx; p.y += p.vy; p.life--; }
    particles = particles.filter((p) => p.life > 0);
  }
  function drawParticles() {
    for (const p of particles) {
      if (p.x < camX - 10 || p.x > camX + VW + 10) continue;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  // ============ القوى الخاصة (فطر / زهرة نار) ============
  function spawnPowerup(x, topY) {
    // فطر لو اللاعب صغير، وزهرة نار لو كبير/نار بالفعل
    const kind = player.state === "small" ? "mush" : "fire";
    powerups.push({ x: x - 13, y: topY - 2, w: 26, h: 26, vx: 1.3, vy: 0, kind: kind, emerging: TILE, t: 0 });
    Sound.power();
  }
  function updatePowerups() {
    for (const pu of powerups) {
      pu.t++;
      if (pu.emerging > 0) { pu.y -= 1; pu.emerging--; continue; } // يطلع من الصندوق
      if (pu.kind === "mush") {
        pu.vy += GRAVITY; if (pu.vy > MAX_FALL) pu.vy = MAX_FALL;
        pu.x += pu.vx;
        for (const s of solids) { if (rectHit(pu, s)) { if (pu.vx > 0) pu.x = s.x - pu.w; else pu.x = s.x + s.w; pu.vx = -pu.vx; } }
        pu.y += pu.vy;
        for (const s of solids) { if (rectHit(pu, s)) { if (pu.vy > 0) { pu.y = s.y - pu.h; pu.vy = 0; } else { pu.y = s.y + s.h; pu.vy = 0; } } }
        if (pu.y > worldH + 60) pu.dead = true;
      }
      if (!player.dead && rectHit(player, pu)) { applyPower(pu.kind); pu.dead = true; }
    }
    powerups = powerups.filter((pu) => !pu.dead);
  }
  function applyPower(kind) {
    if (kind === "mush") {
      if (player.state === "small") setSize("big"); else { score += 1000; updateHUD(); }
    } else { // زهرة نار
      setSize("fire");
    }
    player.invuln = Math.max(player.invuln, 40);
    Sound.grow();
    burst(player.x + player.w / 2, player.y + player.h / 2, PC_POWER, 16);
  }
  function setSize(newState) {
    const feet = player.y + player.h;
    player.state = newState; playerState = newState;
    const sz = PLAYER_SIZES[newState];
    player.w = sz.w; player.h = sz.h; player.y = feet - player.h;
    refreshFireBtn();
  }
  function takeDamage() {
    if (player.dead || player.invuln > 0) return;
    if (player.state === "fire") { setSize("big"); player.invuln = 100; Sound.hurt(); }
    else if (player.state === "big") { setSize("small"); player.invuln = 100; Sound.hurt(); }
    else killPlayer();
  }

  // ============ كرات النار ============
  function throwFire() {
    if (player.dead || player.state !== "fire") return;
    if (fireballs.length >= 2) return;
    const dir = player.face;
    fireballs.push({ x: player.x + (dir > 0 ? player.w - 4 : -8), y: player.y + player.h * 0.4, vx: dir * 5.4, vy: 2, w: 12, h: 12, life: 130, t: 0 });
    Sound.fire();
  }
  function updateFireballs() {
    for (const fb of fireballs) {
      fb.t++; fb.life--;
      fb.vy += 0.42; if (fb.vy > 10) fb.vy = 10;
      fb.x += fb.vx;
      for (const s of solids) { if (rectHit(fb, s)) { fb.dead = true; break; } }
      fb.y += fb.vy;
      for (const s of solids) { if (rectHit(fb, s)) { if (fb.vy > 0) { fb.y = s.y - fb.h; fb.vy = -5.5; } else { fb.y = s.y + s.h; fb.vy = 0.5; } } }
      if (fb.x < 0 || fb.x > worldW || fb.life <= 0) fb.dead = true;
      for (const e of enemies) {
        if (e.alive && rectHit(fb, e)) { e.alive = false; e.dieTime = 0; e.vy = -6; e.flip = true; score += 200; updateHUD(); Sound.stomp(); burst(e.x + e.w / 2, e.y + e.h / 2, PC_FIRE, 12); fb.dead = true; break; }
      }
      if (boss && boss.alive && !fb.dead && boss.hitCd === 0 && rectHit(fb, boss)) { fb.dead = true; hitBoss(); }
    }
    fireballs = fireballs.filter((fb) => !fb.dead);
  }

  // ============ الأنابيب والغرفة السرية ============
  function enterPipe(pipe) {
    if (inSecret) return;
    pipe.used = true; // مرة واحدة فقط
    Sound.pipe(); burst(pipe.x + pipe.w / 2, pipe.y + 4, PC_POWER, 12);
    secretReturn = { solids, coinList, enemies, popCoins, powerups, fireballs, particles, flag, worldW, worldH, warpPipes, boss, entry: { x: pipe.x, w: pipe.w, y: pipe.y } };
    buildSecretRoom();
    inSecret = true;
  }
  function buildSecretRoom() {
    solids = []; coinList = []; enemies = []; popCoins = []; powerups = []; fireballs = []; particles = []; boss = null; flag = null; warpPipes = [];
    worldW = 14 * TILE; worldH = 12 * TILE;
    for (let c = 0; c < 14; c++) { solids.push({ x: c * TILE, y: 10 * TILE, w: TILE, h: TILE, type: "ground" }); solids.push({ x: c * TILE, y: 11 * TILE, w: TILE, h: TILE, type: "ground" }); }
    for (let r = 2; r <= 9; r++) { solids.push({ x: 0, y: r * TILE, w: TILE, h: TILE, type: "pipe" }); solids.push({ x: 13 * TILE, y: r * TILE, w: TILE, h: TILE, type: "pipe" }); }
    for (let row = 0; row < 3; row++) for (let col = 0; col < 6; col++) addCoinXY((3 + col) * TILE + TILE / 2, (5 + row) * TILE + TILE / 2);
    for (let r = 8; r <= 9; r++) for (let c = 0; c < 2; c++) solids.push({ x: (10 + c) * TILE, y: r * TILE, w: TILE, h: TILE, type: "pipe" });
    warpPipes.push({ x: 10 * TILE, y: 8 * TILE, w: 2 * TILE, exit: true });
    player.x = 2 * TILE; player.y = GROUND_ROW * TILE - player.h; player.vx = 0; player.vy = 0; camX = 0;
  }
  function exitSecret() {
    const s = secretReturn; if (!s) return;
    Sound.pipe();
    solids = s.solids; coinList = s.coinList; enemies = s.enemies; popCoins = s.popCoins; powerups = s.powerups; fireballs = s.fireballs; particles = s.particles;
    flag = s.flag; worldW = s.worldW; worldH = s.worldH; warpPipes = s.warpPipes; boss = s.boss;
    player.x = s.entry.x + (s.entry.w - player.w) / 2; player.y = s.entry.y - player.h; player.vx = 0; player.vy = 0;
    inSecret = false; secretReturn = null; camX = 0;
  }

  // ============ الزعيم (Boss) ============
  function updateBoss() {
    if (!boss || !boss.alive) return;
    boss.animTime++;
    if (boss.hitCd > 0) boss.hitCd--;
    boss.vy += GRAVITY; if (boss.vy > MAX_FALL) boss.vy = MAX_FALL;
    boss.x += boss.dir * boss.speed;
    for (const s of solids) { if (rectHit(boss, s)) { if (boss.dir > 0) boss.x = s.x - boss.w; else boss.x = s.x + s.w; boss.dir = -boss.dir; } }
    let grounded = false;
    boss.y += boss.vy;
    for (const s of solids) { if (rectHit(boss, s)) { if (boss.vy > 0) { boss.y = s.y - boss.h; boss.vy = 0; grounded = true; } else { boss.y = s.y + s.h; boss.vy = 0; } } }
    boss.jumpCd--;
    if (grounded && boss.jumpCd <= 0) { boss.vy = -8.5; boss.jumpCd = 50 + boss.hp * 15; }
    const p = player;
    if (!p.dead && rectHit(p, boss)) {
      const stomped = p.vy > 0 && (p.y + p.h) - boss.y < 24;
      if (stomped && boss.hitCd === 0) { p.vy = JUMP_VELOCITY * 0.7; hitBoss(); }
      else if (!stomped && boss.hitCd === 0) takeDamage();
    }
  }
  function hitBoss() {
    boss.hp--; boss.hitCd = 70; boss.speed += 0.7;
    burst(boss.x + boss.w / 2, boss.y + boss.h / 2, PC_FIRE, 16); Sound.stomp();
    if (boss.hp <= 0) {
      boss.alive = false; score += 3000; updateHUD();
      burst(boss.x + boss.w / 2, boss.y + boss.h / 2, PC_POWER, 32);
      winLevel();
    }
  }

  // ============ تحديث الأعداء ============
  function updateEnemies() {
    for (const e of enemies) {
      if (!e.alive) { e.dieTime++; continue; }
      e.animTime++;
      e.vy += GRAVITY; if (e.vy > MAX_FALL) e.vy = MAX_FALL;
      e.x += e.vx;
      for (const s of solids) {
        if (rectHit(e, s)) { if (e.vx > 0) e.x = s.x - e.w; else e.x = s.x + s.w; e.vx = -e.vx; }
      }
      let grounded = false;
      e.y += e.vy;
      for (const s of solids) {
        if (rectHit(e, s)) { if (e.vy > 0) { e.y = s.y - e.h; e.vy = 0; grounded = true; } else { e.y = s.y + s.h; e.vy = 0; } }
      }
      // كشف الحافة: لو مفيش أرض أمامه وهو واقف، يلفّ بدل ما يقع في الفجوة
      if (grounded) {
        const dir = e.vx >= 0 ? 1 : -1;
        const probeX = dir > 0 ? e.x + e.w + 2 : e.x - 2;
        const probeY = e.y + e.h + 3;
        let groundAhead = false;
        for (const s of solids) {
          if (probeX >= s.x && probeX < s.x + s.w && probeY >= s.y && probeY < s.y + s.h) { groundAhead = true; break; }
        }
        if (!groundAhead) e.vx = -e.vx;
      }
      if (e.y > worldH + 60) e.alive = false;

      const p = player;
      if (!p.dead && rectHit(p, e)) {
        const stomped = p.vy > 0 && (p.y + p.h) - e.y < 18;
        if (stomped) { e.alive = false; e.dieTime = 0; p.vy = JUMP_VELOCITY * 0.6; score += 200; updateHUD(); Sound.stomp(); burst(e.x + e.w / 2, e.y + e.h / 2, PC_STOMP, 9); }
        else takeDamage();
      }
    }
    enemies = enemies.filter((e) => e.alive || e.dieTime < 30);
  }

  // ============ المؤقّت ============
  function updateTimer() {
    if (player.dead || inSecret) return; // المؤقّت يتجمّد داخل الغرفة السرية
    timeAcc++;
    if (timeAcc >= 24) { // ~0.4s لكل وحدة زمن
      timeAcc = 0; timeLeft--; updateHUD();
      if (timeLeft <= 0) { timeLeft = 0; killPlayer(); }
    }
  }

  // ============ الموت والفوز ============
  function killPlayer() {
    if (player.dead) return;
    player.dead = true; player.onGround = false;
    player.vy = -10; player.deathSpin = 0; player.deathTime = 0; // نطّة كوميدية
    playerState = "small"; // الرجوع صغيراً بعد الموت
    lives--; updateHUD(); Sound.die();
    state = "dying";
  }
  // سقوط كوميدي: يطير لأعلى ثم يسقط وهو يلفّ (بدون تصادم)
  function updateDeath() {
    const p = player;
    p.deathTime++;
    p.vy += GRAVITY; if (p.vy > MAX_FALL + 5) p.vy = MAX_FALL + 5;
    p.y += p.vy;
    p.deathSpin += 0.32;
    if (p.y > worldH + 160 || p.deathTime > 160) {
      if (lives > 0) { buildLevel(level); state = "playing"; }
      else endGame(false);
    }
  }
  function winLevel() {
    if (state !== "playing") return;
    if (timeLeft > 0) { score += timeLeft * 10; updateHUD(); } // بونص الوقت المتبقّي
    state = "win-anim"; Sound.win();
    setTimeout(() => {
      level++;
      if (level < CONFIGS.length) { buildLevel(level); updateHUD(); state = "playing"; }
      else endGame(true);
    }, 800);
  }
  function endGame(won) {
    state = won ? "win" : "dead";
    Sound.stopMusic();
    let isRecord = false;
    if (score > bestScore) { bestScore = score; localStorage.setItem("superRunBestScore", String(bestScore)); isRecord = true; }
    document.getElementById("hud").classList.add("hidden");
    document.getElementById("controls").classList.add("hidden");
    const es = document.getElementById("end-screen");
    document.getElementById("end-emoji").textContent = won ? "🏆" : "💀";
    document.getElementById("end-title").textContent = won ? "مبروك! أنهيت اللعبة" : "انتهت اللعبة";
    document.getElementById("end-msg").innerHTML =
      "🏅 نتيجتك: <b>" + score + "</b> — جمعت " + coins + " عملة" +
      "<br/>" + (isRecord ? "🎉 رقم قياسي جديد!" : "أعلى نتيجة: " + bestScore);
    es.classList.remove("hidden");
    // إظهار زر المتابعة لو فيه تقدّم محفوظ
    const cb = document.getElementById("continue-btn");
    if (cb && progress > 0) { document.getElementById("cont-level").textContent = progress + 1; }
  }

  // ============ الرسم عالي الدقة ============
  let scaleX = 1, scaleY = 1;
  function draw() {
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    drawSky();

    camX = player.x + player.w / 2 - VW / 2;
    if (camX < 0) camX = 0;
    if (worldW > VW && camX > worldW - VW) camX = worldW - VW;
    else if (worldW <= VW) camX = 0;

    drawHills();

    ctx.save();
    ctx.translate(-Math.round(camX), 0);
    drawSolids();
    drawCoins();
    drawPopCoins();
    drawPowerups();
    drawFlag();
    drawEnemies();
    drawBoss();
    drawFireballs();
    drawPlayer();
    drawParticles();
    if (currentWarp && !player.dead) drawWarpHint(currentWarp);
    ctx.restore();
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, VH);
    g.addColorStop(0, "#6ba4ff");
    g.addColorStop(0.6, "#8fc0ff");
    g.addColorStop(1, "#cfe8ff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VW, VH);
    // غيوم
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    const off = (camX * 0.25) % 300;
    for (let i = -1; i < 3; i++) puff(i * 300 - off + 60, 55 + (i % 2) * 30);
  }
  function puff(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, 7); ctx.arc(x + 20, y + 6, 22, 0, 7);
    ctx.arc(x + 44, y, 16, 0, 7); ctx.arc(x + 22, y - 8, 18, 0, 7);
    ctx.fill();
  }
  function drawHills() {
    const off = (camX * 0.5) % 260;
    ctx.fillStyle = "#7ec850";
    const baseY = GROUND_ROW * TILE;
    for (let i = -1; i < 4; i++) {
      const hx = i * 260 - off + 40;
      ctx.beginPath();
      ctx.moveTo(hx - 70, baseY); ctx.quadraticCurveTo(hx, baseY - 90, hx + 70, baseY);
      ctx.fill();
    }
    ctx.fillStyle = "#6cb542";
    for (let i = -1; i < 4; i++) {
      const hx = i * 260 - off + 180;
      ctx.beginPath();
      ctx.moveTo(hx - 55, baseY); ctx.quadraticCurveTo(hx, baseY - 60, hx + 55, baseY);
      ctx.fill();
    }
  }

  function drawSolids() {
    for (const s of solids) {
      if (s.x + s.w < camX - 2 || s.x > camX + VW + 2) continue;
      const by = s.bump ? -s.bump : 0;
      if (s.bump) { s.bump -= 1; if (s.bump < 0) s.bump = 0; }

      if (s.type === "ground") {
        const g = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
        g.addColorStop(0, "#b5651d"); g.addColorStop(1, "#8a4a12");
        ctx.fillStyle = g; ctx.fillRect(s.x, s.y, s.w, s.h);
        if (s.y === GROUND_ROW * TILE) { // العشب على السطح
          ctx.fillStyle = "#5fbf3a"; ctx.fillRect(s.x, s.y, s.w, 8);
          ctx.fillStyle = "#4aa32c"; ctx.fillRect(s.x, s.y + 8, s.w, 3);
        }
        ctx.fillStyle = "rgba(0,0,0,0.10)";
        ctx.fillRect(s.x + 5, s.y + 15, 4, 4); ctx.fillRect(s.x + 18, s.y + 20, 4, 4);
      } else if (s.type === "brick") {
        rrect(s.x, s.y + by, s.w, s.h, 4, "#c0492f");
        ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1.5;
        ctx.strokeRect(s.x + 2, s.y + by + 2, s.w - 4, s.h / 2 - 2);
        ctx.strokeRect(s.x + 2, s.y + by + s.h / 2, s.w - 4, s.h / 2 - 3);
        ctx.strokeRect(s.x + s.w / 2 - 1, s.y + by + 2, 1, s.h - 5);
      } else if (s.type === "block" || s.type === "power") {
        const g = ctx.createLinearGradient(0, s.y + by, 0, s.y + by + s.h);
        g.addColorStop(0, "#ffcf5a"); g.addColorStop(1, "#e59a1f");
        rrectGrad(s.x, s.y + by, s.w, s.h, 5, g);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        [[6, 6], [s.w - 10, 6], [6, s.h - 10], [s.w - 10, s.h - 10]].forEach((r) => ctx.fillRect(s.x + r[0], s.y + by + r[1], 4, 4));
        ctx.fillStyle = "#7a4a0a"; ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const glow = 0.6 + 0.4 * Math.abs(Math.sin(performance.now() / 300));
        ctx.globalAlpha = glow; ctx.fillText("?", s.x + s.w / 2, s.y + by + s.h / 2 + 1); ctx.globalAlpha = 1;
      } else if (s.type === "used") {
        const g = ctx.createLinearGradient(0, s.y + by, 0, s.y + by + s.h);
        g.addColorStop(0, "#9a6a2a"); g.addColorStop(1, "#6f4a17");
        rrectGrad(s.x, s.y + by, s.w, s.h, 5, g);
      } else if (s.type === "pipe") {
        const g = ctx.createLinearGradient(s.x, 0, s.x + s.w, 0);
        g.addColorStop(0, "#219a2e"); g.addColorStop(0.4, "#7dffa0"); g.addColorStop(0.6, "#4bd75e"); g.addColorStop(1, "#177a24");
        ctx.fillStyle = g; ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.strokeStyle = "rgba(0,50,0,0.35)"; ctx.lineWidth = 1; ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
        const hasAbove = solids.some((o) => o.type === "pipe" && o.x === s.x && o.y === s.y - TILE);
        if (!hasAbove) { // حافة الأنبوب العلوية
          ctx.fillStyle = "#2fbf40"; ctx.fillRect(s.x - 3, s.y - 2, s.w + 6, 10);
          ctx.fillStyle = "#9dffbc"; ctx.fillRect(s.x - 3, s.y - 2, s.w + 6, 3);
          ctx.strokeStyle = "rgba(0,50,0,0.35)"; ctx.strokeRect(s.x - 2.5, s.y - 1.5, s.w + 5, 9);
        }
      }
    }
  }
  function rrect(x, y, w, h, r, color) { ctx.fillStyle = color; pathRR(x, y, w, h, r); ctx.fill(); }
  function rrectGrad(x, y, w, h, r, grad) { ctx.fillStyle = grad; pathRR(x, y, w, h, r); ctx.fill(); }
  function pathRR(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCoin(cx, cy, spin) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(0.35 + 0.65 * spin, 1); // دوران
    const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, 10);
    g.addColorStop(0, C.coinLight); g.addColorStop(0.6, C.coin); g.addColorStop(1, C.coinDark);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 9.5, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(120,80,0,0.5)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillRect(-1.5, -5, 3, 10);
    ctx.restore();
  }
  function drawCoins() {
    const t = performance.now() / 1000;
    for (const coin of coinList) {
      if (coin.got) continue;
      if (coin.x < camX - 20 || coin.x > camX + VW + 20) continue;
      const bob = Math.sin(t * 3 + coin.phase) * 5;     // حركة الموجة (فوق/تحت)
      const spin = Math.abs(Math.sin(t * 3 + coin.phase * 1.3)); // دوران
      drawCoin(coin.x, coin.y + bob, spin);
    }
  }
  function drawPopCoins() {
    for (const pc of popCoins) {
      const spin = Math.abs(Math.sin(pc.life * 0.5));
      ctx.globalAlpha = Math.min(1, pc.life / 14);
      drawCoin(pc.x, pc.y, spin);
      ctx.globalAlpha = 1;
    }
  }

  function drawPowerups() {
    for (const pu of powerups) {
      if (pu.x + pu.w < camX || pu.x > camX + VW) continue;
      const cx = pu.x + pu.w / 2, cy = pu.y + pu.h / 2;
      if (pu.kind === "mush") {
        // ساق
        ctx.fillStyle = "#ffe8c0"; rrect(cx - 8, cy, 16, pu.h / 2, 3, "#ffe8c0");
        ctx.fillStyle = "#000"; ctx.fillRect(cx - 4, cy + 4, 2, 4); ctx.fillRect(cx + 2, cy + 4, 2, 4);
        // قبعة حمراء
        const g = ctx.createLinearGradient(0, pu.y, 0, cy);
        g.addColorStop(0, "#ff5a4d"); g.addColorStop(1, "#d8342a");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, pu.w / 2, Math.PI, 0); ctx.fill();
        ctx.fillRect(cx - pu.w / 2, cy - 1, pu.w, 3);
        // بقع بيضاء
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(cx - 6, cy - 4, 3.2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 6, cy - 4, 3.2, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy - 9, 3.2, 0, 7); ctx.fill();
      } else {
        // زهرة نار: بتلات برتقالي/أحمر تدور + قلب أصفر + ساق خضراء
        ctx.fillStyle = "#2f9e3f"; ctx.fillRect(cx - 2, cy + 3, 4, pu.h / 2 - 3);
        ctx.save(); ctx.translate(cx, cy - 2); ctx.rotate(pu.t * 0.06);
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.fillStyle = i % 2 ? "#ff7a1a" : "#ff3b30";
          ctx.beginPath(); ctx.ellipse(0, -8, 4, 7, 0, 0, 7); ctx.fill();
        }
        ctx.fillStyle = "#ffd21a"; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(-1.5, -1.5, 1.6, 0, 7); ctx.fill();
        ctx.restore();
      }
    }
  }
  function drawFireballs() {
    for (const fb of fireballs) {
      const cx = fb.x + fb.w / 2, cy = fb.y + fb.h / 2;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(fb.t * 0.4);
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, fb.w / 2 + 2);
      g.addColorStop(0, "#fff2a0"); g.addColorStop(0.5, "#ff9b1a"); g.addColorStop(1, "#e53211");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, fb.w / 2, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.arc(-2, -2, 2, 0, 7); ctx.fill();
      ctx.restore();
    }
  }

  function drawBoss() {
    if (!boss || !boss.alive) return;
    if (boss.x + boss.w < camX || boss.x > camX + VW) return;
    const cx = boss.x + boss.w / 2, cy = boss.y + boss.h / 2;
    // ظل
    ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(cx, boss.y + boss.h, boss.w / 2.1, 6, 0, 0, 7); ctx.fill();
    const flash = boss.hitCd > 0 && Math.floor(boss.hitCd / 5) % 2 === 0;
    // جسم
    const g = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, boss.w / 2);
    g.addColorStop(0, flash ? "#ffffff" : "#8a3ad6"); g.addColorStop(1, flash ? "#ffb0b0" : "#4b1d86");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, boss.w / 2, boss.h / 2, 0, 0, 7); ctx.fill();
    // أشواك حول الرأس
    ctx.fillStyle = flash ? "#fff" : "#ffd21a";
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI + i * (Math.PI / 6);
      const sx = cx + Math.cos(a) * (boss.w / 2 - 2), sy = cy + Math.sin(a) * (boss.h / 2 - 2);
      ctx.beginPath(); ctx.moveTo(sx - 4, sy); ctx.lineTo(sx + Math.cos(a) * 9, sy + Math.sin(a) * 9); ctx.lineTo(sx + 4, sy); ctx.fill();
    }
    // عيون غاضبة
    const dir = boss.dir;
    ctx.fillStyle = "#fff"; ctx.fillRect(cx - 14, cy - 6, 12, 12); ctx.fillRect(cx + 2, cy - 6, 12, 12);
    ctx.fillStyle = "#c00"; ctx.fillRect(cx - 12 + dir * 3, cy - 2, 5, 6); ctx.fillRect(cx + 6 + dir * 3, cy - 2, 5, 6);
    ctx.strokeStyle = flash ? "#fff" : "#2a0f52"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 15, cy - 10); ctx.lineTo(cx - 3, cy - 6); ctx.moveTo(cx + 15, cy - 10); ctx.lineTo(cx + 3, cy - 6); ctx.stroke();
    // فم
    ctx.fillStyle = "#2a0f52"; ctx.fillRect(cx - 8, cy + 9, 16, 4);
    // شريط الصحة
    const bw = 46, bx = cx - bw / 2, byy = boss.y - 12;
    ctx.fillStyle = "rgba(0,0,0,0.4)"; ctx.fillRect(bx - 1, byy - 1, bw + 2, 7);
    ctx.fillStyle = "#e23b2e"; ctx.fillRect(bx, byy, bw * (boss.hp / boss.maxhp), 5);
  }
  function drawWarpHint(wp) {
    const bob = Math.sin(performance.now() / 200) * 3;
    const x = wp.x + wp.w / 2, y = wp.y - 16 + bob;
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 8, y - 8); ctx.lineTo(x + 8, y - 8); ctx.lineTo(x, y + 4); ctx.closePath();
    ctx.fill(); ctx.stroke();
  }

  function drawFlag() {
    if (!flag) return;
    const topY = flag.y - TILE * 4;
    ctx.fillStyle = "#e8e8e8"; ctx.fillRect(flag.x - 2, topY, 4, TILE * 4);
    ctx.fillStyle = "#ffd21a"; ctx.beginPath(); ctx.arc(flag.x, topY - 3, 5, 0, 7); ctx.fill();
    const wave = Math.sin(performance.now() / 200) * 3;
    ctx.fillStyle = "#2ecc40";
    ctx.beginPath();
    ctx.moveTo(flag.x + 2, topY + 3);
    ctx.quadraticCurveTo(flag.x + 22, topY + 8 + wave, flag.x + 40, topY + 13);
    ctx.lineTo(flag.x + 2, topY + 24);
    ctx.fill();
  }

  function drawEnemies() {
    for (const e of enemies) {
      if (e.x + e.w < camX - 4 || e.x > camX + VW + 4) continue;
      // ظل
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath();
      ctx.ellipse(e.x + e.w / 2, e.y + e.h, e.w / 2.2, 4, 0, 0, 7); ctx.fill();
      if (!e.alive) { // مهروس
        ctx.fillStyle = C.enemyDark; rrect(e.x, e.y + e.h - 7, e.w, 7, 3, C.enemyDark); continue;
      }
      const cx = e.x + e.w / 2, wob = Math.floor(e.animTime / 8) % 2;
      const dir = e.vx >= 0 ? 1 : -1;
      if (e.kind === "koopa") drawKoopa(e, cx, wob, dir);
      else if (e.kind === "spike") drawSpike(e, cx, wob, dir);
      else drawGoomba(e, cx, wob, dir);
    }
  }
  function eyes(e, cx, dir) {
    const ox = dir * 2;
    ctx.fillStyle = "#fff"; ctx.fillRect(cx - 9 + ox, e.y + 7, 6, 8); ctx.fillRect(cx + 3 + ox, e.y + 7, 6, 8);
    ctx.fillStyle = "#000"; ctx.fillRect(cx - 6 + ox + dir, e.y + 10, 3, 4); ctx.fillRect(cx + 6 + ox + dir, e.y + 10, 3, 4);
  }
  function drawGoomba(e, cx, wob, dir) {
    const g = ctx.createRadialGradient(cx - 4, e.y + e.h / 2 - 4, 2, cx, e.y + e.h / 2, e.w / 2);
    g.addColorStop(0, "#b5732f"); g.addColorStop(1, C.enemyDark);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.ellipse(cx, e.y + e.h / 2, e.w / 2, e.h / 2, 0, 0, 7); ctx.fill();
    eyes(e, cx, dir);
    // حاجب غاضب
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(cx - 9, e.y + 5); ctx.lineTo(cx - 2, e.y + 8);
    ctx.moveTo(cx + 9, e.y + 5); ctx.lineTo(cx + 2, e.y + 8); ctx.stroke();
    ctx.fillStyle = C.enemyFoot; ctx.fillRect(e.x + 2, e.y + e.h - 4, 8, 5 + wob); ctx.fillRect(e.x + e.w - 10, e.y + e.h - 4, 8, 5 + (1 - wob));
  }
  function drawKoopa(e, cx, wob, dir) {
    // أقدام
    ctx.fillStyle = "#e0a030"; ctx.fillRect(e.x + 3, e.y + e.h - 5, 7, 5 + wob); ctx.fillRect(e.x + e.w - 10, e.y + e.h - 5, 7, 5 + (1 - wob));
    // صدفة خضراء
    const g = ctx.createRadialGradient(cx - 4, e.y + e.h / 2, 2, cx, e.y + e.h / 2, e.w / 2 + 2);
    g.addColorStop(0, "#7ed957"); g.addColorStop(1, "#2f9e3f");
    ctx.fillStyle = g; ctx.beginPath();
    ctx.ellipse(cx, e.y + e.h * 0.62, e.w / 2, e.h * 0.38, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = "#1d6b2a"; ctx.lineWidth = 1.5; ctx.stroke();
    // نقوش الصدفة
    ctx.beginPath(); ctx.moveTo(cx, e.y + e.h * 0.3); ctx.lineTo(cx, e.y + e.h); ctx.stroke();
    // رأس
    ctx.fillStyle = "#e0c060"; ctx.beginPath(); ctx.arc(cx + dir * 4, e.y + 8, 7, 0, 7); ctx.fill();
    ctx.fillStyle = "#000"; ctx.fillRect(cx + dir * 6, e.y + 5, 2, 3);
  }
  function drawSpike(e, cx, wob, dir) {
    // جسم أحمر
    const g = ctx.createRadialGradient(cx - 4, e.y + e.h / 2 - 3, 2, cx, e.y + e.h / 2, e.w / 2);
    g.addColorStop(0, "#ff6b5e"); g.addColorStop(1, "#b52a1e");
    ctx.fillStyle = g; ctx.beginPath();
    ctx.ellipse(cx, e.y + e.h / 2, e.w / 2, e.h / 2, 0, 0, 7); ctx.fill();
    // أشواك فوق
    ctx.fillStyle = "#ffd21a";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * 8 - 4, e.y + 2); ctx.lineTo(cx + i * 8, e.y - 6); ctx.lineTo(cx + i * 8 + 4, e.y + 2);
      ctx.fill();
    }
    eyes(e, cx, dir);
    ctx.fillStyle = "#000"; ctx.fillRect(e.x + 2, e.y + e.h - 4, 8, 5 + wob); ctx.fillRect(e.x + e.w - 10, e.y + e.h - 4, 8, 5 + (1 - wob));
  }

  function drawPlayer() {
    const p = player;
    // ظل
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h, p.w / 2, 4, 0, 0, 7); ctx.fill();

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y);
    if (p.dead) { ctx.translate(0, p.h / 2); ctx.rotate(p.deathSpin || 0); ctx.translate(0, -p.h / 2); }
    if (p.invuln > 0 && !p.dead && Math.floor(p.invuln / 5) % 2 === 0) ctx.globalAlpha = 0.4;
    const s = p.h / 32;                       // تكبير الرسم حسب حالة اللاعب
    ctx.scale(p.face < 0 ? -s : s, s);        // مع قلب الاتجاه
    const walking = p.onGround && Math.abs(p.vx) > 0.1;
    const step = Math.floor(p.animTime / 5) % 2;
    const jumping = !p.onGround;
    const overallColor = p.state === "fire" ? "#f2f2f2" : C.overall; // زهرة النار: أفرول أبيض

    // ===== الأحذية =====
    ctx.fillStyle = C.shoe;
    if (jumping) { rr(-11, 27, 9, 5, 2); rr(3, 25, 9, 5, 2); }
    else if (walking) {
      const a = step ? 3 : -1, b = step ? -1 : 3;
      rr(-11 - a, 28, 9, 4, 2); rr(3 + b, 28, 9, 4, 2);
    } else { rr(-11, 28, 9, 4, 2); rr(3, 28, 9, 4, 2); }

    // ===== أفرول (سروال) =====
    ctx.fillStyle = overallColor; rr(-10, 17, 20, 13, 3);
    // أرجل الأفرول
    rr(-10, 24, 8, 8, 2); rr(2, 24, 8, 8, 2);
    // حمّالات الأفرول لأعلى
    ctx.fillStyle = overallColor; ctx.fillRect(-8, 9, 4, 10); ctx.fillRect(4, 9, 4, 10);
    // أزرار صفراء
    ctx.fillStyle = "#ffd21a"; ctx.beginPath(); ctx.arc(-6, 18, 2, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(6, 18, 2, 0, 7); ctx.fill();

    // ===== قميص أحمر + أكمام =====
    ctx.fillStyle = C.body; rr(-10, 9, 20, 9, 3);
    // كتف/كم أمامي
    rr(6, 11, 7, 8, 3);

    // ===== يد بقفاز أبيض =====
    ctx.fillStyle = "#ffffff";
    const handY = jumping ? 8 : 15;
    ctx.beginPath(); ctx.arc(11, handY, 4, 0, 7); ctx.fill();
    ctx.strokeStyle = "#d0d0d0"; ctx.lineWidth = 0.8; ctx.stroke();

    // ===== الرأس =====
    ctx.fillStyle = C.skin; rr(-8, -3, 16, 14, 6);
    // أذن
    ctx.beginPath(); ctx.arc(-7, 5, 3, 0, 7); ctx.fill();
    // سالفة (شعر)
    ctx.fillStyle = "#5a3212"; ctx.fillRect(-9, 2, 3, 7);
    // أنف
    ctx.fillStyle = "#ffbe86"; ctx.beginPath(); ctx.arc(8, 5, 3.4, 0, 7); ctx.fill();
    // عين
    ctx.fillStyle = "#1b3a6b"; ctx.fillRect(3, 0, 2.5, 5);
    // حاجب
    ctx.fillStyle = "#5a3212"; ctx.fillRect(2, -2, 5, 2);
    // شارب
    ctx.fillStyle = "#4a2a0e";
    ctx.beginPath();
    ctx.moveTo(2, 8); ctx.quadraticCurveTo(9, 7, 12, 10);
    ctx.quadraticCurveTo(9, 9.5, 2, 10.5); ctx.fill();

    // ===== القبعة الحمراء =====
    ctx.fillStyle = C.cap;
    ctx.beginPath();
    ctx.moveTo(-9, 0); ctx.quadraticCurveTo(-9, -9, 2, -9);
    ctx.quadraticCurveTo(10, -9, 11, -2); ctx.lineTo(-9, -2); ctx.closePath(); ctx.fill();
    // حافة القبعة الأمامية
    ctx.fillStyle = "#c9382f"; rr(6, -3, 10, 3.5, 2);
    // شعار القبعة
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(0, -5, 3, 0, 7); ctx.fill();
    ctx.fillStyle = C.cap; ctx.font = "bold 5px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("S", 0, -4.5);

    ctx.restore();
  }
  function rr(x, y, w, h, r) { pathRR(x, y, w, h, r); ctx.fill(); }

  // ============ الحلقة الرئيسية ============
  function loop() {
    if (state === "playing") { updatePlayer(); updateEnemies(); updateBoss(); updatePopCoins(); updatePowerups(); updateFireballs(); updateTimer(); updateParticles(); updateWarpBtn(); }
    else if (state === "dying") { updateDeath(); updatePopCoins(); updateParticles(); }
    else if (state === "win-anim" || state === "dead") { updatePopCoins(); }
    if (player && (state === "playing" || state === "dying" || state === "win-anim" || state === "dead" || state === "win")) draw();
    requestAnimationFrame(loop);
  }

  // ============ HUD ============
  function updateHUD() {
    document.getElementById("hud-score").textContent = score;
    document.getElementById("hud-coins").textContent = coins;
    document.getElementById("hud-level").textContent = level + 1;
    document.getElementById("hud-lives").textContent = lives;
    const t = document.getElementById("hud-time");
    if (t) t.textContent = timeLeft;
    const tb = document.getElementById("time-box");
    if (tb) tb.classList.toggle("low", timeLeft <= 30);
  }

  // ============ بدء / إعادة ============
  function startGameAt(startLevel) {
    Sound.resume();
    // محاولة قفل الاتجاه أفقياً (تنجح على التطبيق المثبّت/وضع ملء الشاشة)
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () {}); } catch (e) {}
    level = startLevel; coins = 0; lives = 3; score = 0; playerState = "small";
    buildLevel(level); updateHUD(); refreshFireBtn(); Sound.startMusic(); state = "playing";
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("end-screen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("controls").classList.remove("hidden");
  }
  function startGame() { startGameAt(0); }

  // ============ التحكم ============
  addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
    if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") { keys.jump = true; e.preventDefault(); }
    if ((e.code === "KeyF" || e.code === "KeyX" || e.code === "ShiftLeft") && !e.repeat) throwFire();
    if (e.code === "ArrowDown" || e.code === "KeyS") { keys.down = true; e.preventDefault(); }
  });
  addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
    if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") keys.jump = false;
    if (e.code === "ArrowDown" || e.code === "KeyS") keys.down = false;
  });
  function bindTouch(id, onDown, onUp) {
    const el = document.getElementById(id);
    const down = (e) => { e.preventDefault(); el.classList.add("pressed"); onDown(); };
    const up = (e) => { e.preventDefault(); el.classList.remove("pressed"); onUp(); };
    el.addEventListener("touchstart", down, { passive: false });
    el.addEventListener("touchend", up, { passive: false });
    el.addEventListener("touchcancel", up, { passive: false });
    el.addEventListener("mousedown", down); el.addEventListener("mouseup", up); el.addEventListener("mouseleave", up);
  }
  bindTouch("btn-left", () => (keys.left = true), () => (keys.left = false));
  bindTouch("btn-right", () => (keys.right = true), () => (keys.right = false));
  bindTouch("btn-jump", () => (keys.jump = true), () => (keys.jump = false));
  bindTouch("btn-fire", () => throwFire(), () => {});
  bindTouch("btn-down", () => (keys.down = true), () => (keys.down = false));

  // زر النار يظهر مفعّلاً فقط في حالة زهرة النار
  function refreshFireBtn() {
    const b = document.getElementById("btn-fire");
    if (b) b.style.opacity = (player && player.state === "fire") ? "1" : "0.35";
  }
  // زر النزول يظهر فقط فوق أنبوب سحري
  let lastWarpShown = null;
  function updateWarpBtn() {
    const show = !!currentWarp;
    if (show === lastWarpShown) return;
    lastWarpShown = show;
    const b = document.getElementById("btn-down");
    if (b) b.style.display = show ? "flex" : "none";
  }
  document.getElementById("start-btn").addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", startGame);
  const contBtn = document.getElementById("continue-btn");
  if (contBtn) contBtn.addEventListener("click", () => startGameAt(Math.min(progress, CONFIGS.length - 1)));
  const muteBtn = document.getElementById("btn-mute");
  function refreshMuteIcon() { muteBtn.textContent = Sound.isMuted() ? "🔇" : "🔊"; }
  if (muteBtn) { refreshMuteIcon(); muteBtn.addEventListener("click", () => { Sound.toggle(); refreshMuteIcon(); }); }

  // ============ ضبط الحجم بدقة عالية (High-DPI) ============
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const scale = Math.min(innerWidth / VW, innerHeight / VH);
    const cssW = Math.floor(VW * scale), cssH = Math.floor(VH * scale);
    canvas.style.width = cssW + "px"; canvas.style.height = cssH + "px";
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    scaleX = canvas.width / VW; scaleY = canvas.height / VH;
    ctx.imageSmoothingEnabled = true;
  }
  addEventListener("resize", resize);
  addEventListener("orientationchange", resize);
  resize();

  // ============ Service Worker + تحديث ذاتي ============
  if ("serviceWorker" in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { if (refreshing) return; refreshing = true; location.reload(); });
    addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then((reg) => {
        reg.update();
        document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update(); });
      }).catch(() => {});
    });
  }

  loop();
})();
