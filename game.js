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
  ];

  // ============ حالة اللعبة ============
  let state = "start";
  let level = 0, coins = 0, lives = 3;
  let solids = [], coinList = [], enemies = [], popCoins = [];
  let flag = null, worldW = 0, worldH = 0, player = null, camX = 0;

  let bestScore = parseInt(localStorage.getItem("superRunBest") || "0", 10) || 0;
  (function showBestOnStart() {
    const el = document.getElementById("best-line");
    if (el && bestScore > 0) el.textContent = "🏆 أفضل نتيجة: " + bestScore + " عملة";
  })();

  const keys = { left: false, right: false, jump: false };

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
    return {
      isMuted: () => muted,
      toggle() { muted = !muted; localStorage.setItem("superRunMuted", muted ? "1" : "0"); if (!muted) tone(660, 0.08, "square", 0.15, 0); return muted; },
      resume() { ctx2(); },
      jump() { tone(420, 0.14, "square", 0.14, 0); tone(700, 0.12, "square", 0.12, 0.05); },
      coin() { tone(988, 0.07, "square", 0.14, 0); tone(1319, 0.12, "square", 0.13, 0.06); },
      stomp() { tone(200, 0.12, "sawtooth", 0.18, 0); tone(120, 0.14, "sawtooth", 0.14, 0.05); },
      die() { tone(400, 0.15, "square", 0.16, 0); tone(300, 0.15, "square", 0.15, 0.12); tone(150, 0.3, "square", 0.15, 0.24); },
      win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, "square", 0.16, i * 0.12)); },
    };
  })();

  // ============ بناء المرحلة من الإعداد ============
  function inGap(col, gaps) {
    for (const g of gaps) if (col >= g[0] && col < g[0] + g[1]) return true;
    return false;
  }
  function buildLevel(idx) {
    const cfg = CONFIGS[idx];
    solids = []; coinList = []; enemies = []; popCoins = [];
    worldW = cfg.width * TILE; worldH = 12 * TILE;

    // الأرض (صفّان) مع فجوات
    for (let col = 0; col < cfg.width; col++) {
      if (inGap(col, cfg.gaps)) continue;
      solids.push({ x: col * TILE, y: GROUND_ROW * TILE, w: TILE, h: TILE, type: "ground" });
      solids.push({ x: col * TILE, y: (GROUND_ROW + 1) * TILE, w: TILE, h: TILE, type: "ground" });
    }
    // المنصّات — نثبّت ارتفاعها في الصفوف 6 أو 7 فقط لتظل في متناول القفز من الأرض
    for (const p of cfg.platforms) {
      const row = p.row < 6 ? 6 : (p.row > 7 ? 7 : p.row);
      for (let i = 0; i < p.len; i++) {
        const s = { x: (p.col + i) * TILE, y: row * TILE, w: TILE, h: TILE, type: p.type };
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
    // اللاعب
    player = { x: cfg.start * TILE, y: START_ROW * TILE - 8, w: 24, h: 32, vx: 0, vy: 0, onGround: false, face: 1, dead: false, animTime: 0 };
    // العلَم في النهاية
    flag = { x: (cfg.width - 2) * TILE + TILE / 2, y: GROUND_ROW * TILE };
    camX = 0;
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
          else if (s.type === "brick") { s.bump = 6; if (collectCoinOn(s)) s.type = "used"; }
        }
      }
    }

    if (Math.abs(p.vx) > 0.1) p.animTime += 1;
    if (p.y > worldH + 40) killPlayer();

    for (const coin of coinList) {
      if (!coin.got && rectHit(p, { x: coin.x - 9, y: coin.y - 9, w: 18, h: 18 })) {
        coin.got = true; coins++; updateHUD(); Sound.coin();
      }
    }
    if (flag && p.x + p.w > flag.x - 6) winLevel();
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
    coins++; updateHUD(); Sound.coin();
  }
  function updatePopCoins() {
    for (const pc of popCoins) { pc.vy += 0.42; pc.y += pc.vy; pc.life--; }
    popCoins = popCoins.filter((pc) => pc.life > 0);
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
        if (stomped) { e.alive = false; e.dieTime = 0; p.vy = JUMP_VELOCITY * 0.6; coins++; updateHUD(); Sound.stomp(); }
        else killPlayer();
      }
    }
    enemies = enemies.filter((e) => e.alive || e.dieTime < 30);
  }

  // ============ الموت والفوز ============
  function killPlayer() {
    if (player.dead) return;
    player.dead = true; player.onGround = false;
    player.vy = -10; player.deathSpin = 0; player.deathTime = 0; // نطّة كوميدية
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
    state = "win-anim"; Sound.win();
    setTimeout(() => {
      level++;
      if (level < CONFIGS.length) { buildLevel(level); updateHUD(); state = "playing"; }
      else endGame(true);
    }, 800);
  }
  function endGame(won) {
    state = won ? "win" : "dead";
    let isRecord = false;
    if (coins > bestScore) { bestScore = coins; localStorage.setItem("superRunBest", String(bestScore)); isRecord = true; }
    document.getElementById("hud").classList.add("hidden");
    document.getElementById("controls").classList.add("hidden");
    const es = document.getElementById("end-screen");
    document.getElementById("end-emoji").textContent = won ? "🏆" : "💀";
    document.getElementById("end-title").textContent = won ? "مبروك! أنهيت اللعبة" : "انتهت اللعبة";
    document.getElementById("end-msg").innerHTML =
      (won ? "أنت بطل حقيقي! " : "حاول مرة أخرى. ") + "جمعت " + coins + " عملة 🪙" +
      "<br/>" + (isRecord ? "🎉 رقم قياسي جديد!" : "أفضل نتيجة: " + bestScore + " 🪙");
    es.classList.remove("hidden");
  }

  // ============ الرسم عالي الدقة ============
  let scaleX = 1, scaleY = 1;
  function draw() {
    ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    drawSky();

    camX = player.x + player.w / 2 - VW / 2;
    if (camX < 0) camX = 0;
    if (camX > worldW - VW) camX = worldW - VW;

    drawHills();

    ctx.save();
    ctx.translate(-Math.round(camX), 0);
    drawSolids();
    drawCoins();
    drawPopCoins();
    drawFlag();
    drawEnemies();
    drawPlayer();
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
      } else if (s.type === "block") {
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
    if (p.face < 0) ctx.scale(-1, 1);
    const walking = p.onGround && Math.abs(p.vx) > 0.1;
    const step = Math.floor(p.animTime / 5) % 2;
    const jumping = !p.onGround;

    // ===== الأحذية =====
    ctx.fillStyle = C.shoe;
    if (jumping) { rr(-11, 27, 9, 5, 2); rr(3, 25, 9, 5, 2); }
    else if (walking) {
      const a = step ? 3 : -1, b = step ? -1 : 3;
      rr(-11 - a, 28, 9, 4, 2); rr(3 + b, 28, 9, 4, 2);
    } else { rr(-11, 28, 9, 4, 2); rr(3, 28, 9, 4, 2); }

    // ===== أفرول أزرق (سروال) =====
    ctx.fillStyle = C.overall; rr(-10, 17, 20, 13, 3);
    // أرجل الأفرول
    rr(-10, 24, 8, 8, 2); rr(2, 24, 8, 8, 2);
    // حمّالات الأفرول لأعلى
    ctx.fillStyle = C.overall; ctx.fillRect(-8, 9, 4, 10); ctx.fillRect(4, 9, 4, 10);
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
    if (state === "playing") { updatePlayer(); updateEnemies(); updatePopCoins(); }
    else if (state === "dying") { updateDeath(); updatePopCoins(); }
    else if (state === "win-anim" || state === "dead") { updatePopCoins(); }
    if (player && (state === "playing" || state === "dying" || state === "win-anim" || state === "dead" || state === "win")) draw();
    requestAnimationFrame(loop);
  }

  // ============ HUD ============
  function updateHUD() {
    document.getElementById("hud-coins").textContent = coins;
    document.getElementById("hud-level").textContent = level + 1;
    document.getElementById("hud-lives").textContent = lives;
    const best = document.getElementById("hud-best");
    if (best) best.textContent = Math.max(bestScore, coins);
  }

  // ============ بدء / إعادة ============
  function startGame() {
    Sound.resume();
    // محاولة قفل الاتجاه أفقياً (تنجح على التطبيق المثبّت/وضع ملء الشاشة)
    try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () {}); } catch (e) {}
    level = 0; coins = 0; lives = 3;
    buildLevel(0); updateHUD(); state = "playing";
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("end-screen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("controls").classList.remove("hidden");
  }

  // ============ التحكم ============
  addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
    if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") { keys.jump = true; e.preventDefault(); }
  });
  addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
    if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
    if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") keys.jump = false;
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
  document.getElementById("start-btn").addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", startGame);
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
