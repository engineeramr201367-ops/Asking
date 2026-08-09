/* ============================================================
   سوبر جري - Super Run
   لعبة منصّات على طراز ماريو، بتقنية Canvas، تعمل باللمس والكيبورد.
   ============================================================ */
(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const VW = canvas.width;   // عرض العالم المرئي (الكاميرا)
  const VH = canvas.height;

  // إبقاء الرسم حادًّا لعرض البكسل
  ctx.imageSmoothingEnabled = false;

  // ============ إعدادات فيزياء اللعبة ============
  const GRAVITY = 0.6;
  const MOVE_SPEED = 2.4;
  const JUMP_VELOCITY = -10.2;
  const MAX_FALL = 12;
  const TILE = 30; // حجم المربّع

  // ألوان
  const C = {
    sky: "#5c94fc",
    ground: "#c84c0c",
    groundTop: "#00a800",
    brick: "#b53120",
    brickLine: "#7a1f14",
    block: "#e8a33d",
    blockDark: "#b06a1a",
    coin: "#fbd000",
    coinDark: "#c99700",
    body: "#e8433a",
    skin: "#ffcc99",
    cap: "#e8433a",
    overall: "#2b56d6",
    shoe: "#5a2d0c",
    enemy: "#8b4513",
    enemyFoot: "#3a1d05",
    cloud: "#ffffff",
    flagPole: "#dddddd",
    flag: "#2ecc40",
  };

  // ============ تصميم المراحل ============
  // كل مرحلة عبارة عن مصفوفة صفوف من الرموز:
  //  X = أرض/تربة، B = طوبة، ? = صندوق عملة، C = عملة حرة
  //  E = عدو، P = بداية اللاعب، F = العلَم (النهاية)، فراغ = هواء
  const LEVELS = [
    [
      "                                                                          ",
      "                                                                          ",
      "                                                                          ",
      "                     C C                                                  ",
      "            ?        BBB              C   C                            F   ",
      "                              C                                        F   ",
      "                          ?          BBB          ? ?                  F   ",
      "        C            E                        E                E       F   ",
      "     BBB      ?    XXXXX        BBBB      XXXXXX      BBB    XXXXXXX    F   ",
      "P                                                                     XX   ",
      "XXXXXXXXXXXXXX  XXXXXXXXXXX  XXXXXXXXXXXX  XXXXXXXXXXX  XXXXXXXXXXXXXXXXXX  ",
      "XXXXXXXXXXXXXX  XXXXXXXXXXX  XXXXXXXXXXXX  XXXXXXXXXXX  XXXXXXXXXXXXXXXXXX  ",
    ],
    [
      "                                                                                    ",
      "                                                                                    ",
      "              C C C                                                                  ",
      "          ?  BBBBB  ?                    C C C                                    F  ",
      "                            E E        BB???BB                                   F  ",
      "                     C                              C   C        E    E          F  ",
      "        ? ?       XXXXXXX          E           ?          BBBB                    F  ",
      "     E                        BBBBB        XXXXXX                    XXXXXX       F  ",
      "   XXXXX     BBB    E    ?              C              BBB      E                  F  ",
      "P                XXXXXXXXX      XXXX          XXXXXXXX       XXXXXXXXXXXX         XX  ",
      "XXXXXXXXXXX  XXXXXXXXXXXXXX  XXXXXXXX  XXXXX  XXXXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
      "XXXXXXXXXXX  XXXXXXXXXXXXXX  XXXXXXXX  XXXXX  XXXXXXXXXX  XXXXXXXXXXXXXXXXXXXXXXXXXX  ",
    ],
    [
      "                                                                                              ",
      "         C C C C                                                                               ",
      "        BB?????BB                     E   E   E                                                ",
      "                          C C                                       C  C  C                    ",
      "                      ?  BBBBB  ?              ? ? ?              BB??????BB                 F  ",
      "     E        C                       C C C                                                 F  ",
      "   BBBB    XXXXXX     E E      ?    XXXXXXXX          E E E    ?                              F  ",
      "                  BB          XXXXX          BBBB          XXXXXXX        E   E              F  ",
      "P        E                 ?              E              ?             BBBBBB     ?          F  ",
      "XXXXX  XXXXXXXX  XXXX  XXXXXXXXXX  XXXX  XXXXXXX  XXXX  XXXXXXXXXX  XXXX  XXXXXXXXXXXXXXX    XX  ",
      "XXXXX  XXXXXXXX  XXXX  XXXXXXXXXX  XXXX  XXXXXXX  XXXX  XXXXXXXXXX  XXXX  XXXXXXXXXXXXXXX  XXXX  ",
      "XXXXX  XXXXXXXX  XXXX  XXXXXXXXXX  XXXX  XXXXXXX  XXXX  XXXXXXXXXX  XXXX  XXXXXXXXXXXXXXX  XXXX  ",
    ],
    [
      "                                                                                                        ",
      "                    C C C                                                                                ",
      "        C          BB???BB              E E E E                          C C C C                         ",
      "       ???                        C C C                    ? ? ?        BB?????BB                        ",
      "                            C            BBBBBB                                        E E E          F  ",
      "    E E      C C       ?              C          C C        E E E    C            ??                  F  ",
      "  BBBB    XXXXXXX   BB      ? ?    XXXXXXX   E          XXXXXXXXX          BBBB          E   E         F  ",
      "                          XXXXX          BBBB      E E          XXXXXXX       ? ?    XXXXXXX          F  ",
      "P     E        ?               E              ?             E E E        ?              BBBBBBB   ?   F  ",
      "XXXX  XXXXXX  XXX  XXXX  XXXXXXXX  XXX  XXXXX  XXX  XXXXXXXX  XXX  XXXXX  XXX  XXXXXXXX  XXXXXXXXXXX  XX  ",
      "XXXX  XXXXXX  XXX  XXXX  XXXXXXXX  XXX  XXXXX  XXX  XXXXXXXX  XXX  XXXXX  XXX  XXXXXXXX  XXXXXXXXXXX  XXX ",
      "XXXX  XXXXXX  XXX  XXXX  XXXXXXXX  XXX  XXXXX  XXX  XXXXXXXX  XXX  XXXXX  XXX  XXXXXXXX  XXXXXXXXXXX  XXX ",
    ],
    [
      "                                                                                                                  ",
      "     C C C C C                                                                                                     ",
      "    BB?????BB                    E E E E E                              C C C C C                                  ",
      "                      C C C                        ? ? ? ?            BB???????BB                                  ",
      "                  ?  BBBBB  ?          C C C                                              E E E E              F   ",
      "   E E E    C C                  ?              ?           E E E E    C C C        ? ?                        F   ",
      " BBBBB   XXXXXXXX   BBB    ? ?  XXXXXXXXX   E E        XXXXXXXXXX          BBBBB          E E E              ??  F   ",
      "                          XXXXXX          BBBBB   E E E          XXXXXXXX       ? ?    XXXXXXXXX             F   ",
      "P    E E       ? ?             E E             ? ?          E E E E E     ? ?             BBBBBBBB    ? ?    F   ",
      "XXX  XXXXX  XX  XXX  XXXXXXX  XX  XXXX  XX  XXXXXXX  XX  XXXX  XX  XXXXXXX  XX  XXXX  XX  XXXXXXXXXXX  XXXXX  XX   ",
      "XXX  XXXXX  XX  XXX  XXXXXXX  XX  XXXX  XX  XXXXXXX  XX  XXXX  XX  XXXXXXX  XX  XXXX  XX  XXXXXXXXXXX  XXXXX  XXX  ",
      "XXX  XXXXX  XX  XXX  XXXXXXX  XX  XXXX  XX  XXXXXXX  XX  XXXX  XX  XXXXXXX  XX  XXXX  XX  XXXXXXXXXXX  XXXXX  XXX  ",
    ],
  ];

  // ============ حالة اللعبة ============
  let state = "start"; // start | playing | dead | win
  let level = 0;
  let coins = 0;
  let lives = 3;

  let solids = [];   // مربّعات صلبة {x,y,w,h,type}
  let coinList = []; // عملات {x,y,got}
  let enemies = [];  // أعداء
  let flag = null;   // {x,y}
  let worldW = 0, worldH = 0;
  let player = null;
  let camX = 0;

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

    function ctx() {
      if (!ac) {
        try { ac = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { ac = null; }
      }
      if (ac && ac.state === "suspended") ac.resume();
      return ac;
    }

    // نغمة واحدة
    function tone(freq, dur, type, vol, whenOffset) {
      if (muted) return;
      const a = ctx(); if (!a) return;
      const t0 = a.currentTime + (whenOffset || 0);
      const osc = a.createOscillator();
      const g = a.createGain();
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
      toggle() {
        muted = !muted;
        localStorage.setItem("superRunMuted", muted ? "1" : "0");
        if (!muted) tone(660, 0.08, "square", 0.15, 0);
        return muted;
      },
      resume() { ctx(); },
      jump()  { tone(420, 0.14, "square", 0.14, 0); tone(700, 0.12, "square", 0.12, 0.05); },
      coin()  { tone(988, 0.07, "square", 0.14, 0); tone(1319, 0.12, "square", 0.13, 0.06); },
      stomp() { tone(200, 0.12, "sawtooth", 0.18, 0); tone(120, 0.14, "sawtooth", 0.14, 0.05); },
      die()   { tone(400, 0.15, "square", 0.16, 0); tone(300, 0.15, "square", 0.15, 0.12); tone(150, 0.3, "square", 0.15, 0.24); },
      win()   { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, "square", 0.16, i * 0.12)); },
    };
  })();

  // ============ بناء المرحلة من الخريطة ============
  function buildLevel(idx) {
    const map = LEVELS[idx];
    solids = []; coinList = []; enemies = []; flag = null;
    worldW = map[0].length * TILE;
    worldH = map.length * TILE;

    for (let r = 0; r < map.length; r++) {
      const row = map[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        const x = c * TILE, y = r * TILE;
        switch (ch) {
          case "X": solids.push({ x, y, w: TILE, h: TILE, type: "ground" }); break;
          case "B": solids.push({ x, y, w: TILE, h: TILE, type: "brick" }); break;
          case "?": solids.push({ x, y, w: TILE, h: TILE, type: "block" }); break;
          case "C": coinList.push({ x: x + TILE / 2, y: y + TILE / 2, got: false }); break;
          case "E": enemies.push(makeEnemy(x, y)); break;
          case "P":
            player = {
              x, y: y - 6, w: 22, h: 30, vx: 0, vy: 0,
              onGround: false, face: 1, dead: false, animTime: 0,
            };
            break;
          case "F": if (!flag) flag = { x: x + TILE / 2, y }; break;
        }
      }
    }
    // احتياطي لو لم توجد بداية
    if (!player) player = { x: 40, y: 40, w: 22, h: 30, vx: 0, vy: 0, onGround: false, face: 1, dead: false, animTime: 0 };
    camX = 0;
  }

  function makeEnemy(x, y) {
    return { x: x + 4, y: y + 2, w: 26, h: 26, vx: -1.1, alive: true, dieTime: 0, animTime: 0 };
  }

  // ============ كشف التصادم ============
  function rectHit(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ============ تحديث اللاعب ============
  function updatePlayer() {
    const p = player;

    // حركة أفقية
    if (keys.left) { p.vx = -MOVE_SPEED; p.face = -1; }
    else if (keys.right) { p.vx = MOVE_SPEED; p.face = 1; }
    else p.vx = 0;

    // قفز
    if (keys.jump && p.onGround) {
      p.vy = JUMP_VELOCITY;
      p.onGround = false;
      Sound.jump();
    }

    // جاذبية
    p.vy += GRAVITY;
    if (p.vy > MAX_FALL) p.vy = MAX_FALL;

    // تحرك أفقي مع تصادم
    p.x += p.vx;
    for (const s of solids) {
      if (rectHit(p, s)) {
        if (p.vx > 0) p.x = s.x - p.w;
        else if (p.vx < 0) p.x = s.x + s.w;
        p.vx = 0;
      }
    }
    // حدود العالم
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > worldW) p.x = worldW - p.w;

    // تحرك رأسي مع تصادم
    p.onGround = false;
    p.y += p.vy;
    for (const s of solids) {
      if (rectHit(p, s)) {
        if (p.vy > 0) { p.y = s.y - p.h; p.vy = 0; p.onGround = true; }
        else if (p.vy < 0) {
          p.y = s.y + s.h; p.vy = 0;
          // نطح الصندوق يعطي عملة
          if (s.type === "block") { s.type = "used"; coins++; updateHUD(); Sound.coin(); }
        }
      }
    }

    if (Math.abs(p.vx) > 0.1) p.animTime += 1;

    // السقوط في الحفرة = موت
    if (p.y > worldH + 40) killPlayer();

    // جمع العملات
    for (const coin of coinList) {
      if (!coin.got) {
        const cx = coin.x, cy = coin.y;
        if (cx > p.x - 6 && cx < p.x + p.w + 6 && cy > p.y - 6 && cy < p.y + p.h + 6) {
          coin.got = true; coins++; updateHUD(); Sound.coin();
        }
      }
    }

    // الوصول للعلَم = فوز
    if (flag && p.x + p.w > flag.x - 6) winLevel();
  }

  // ============ تحديث الأعداء ============
  function updateEnemies() {
    for (const e of enemies) {
      if (!e.alive) { e.dieTime++; continue; }
      e.animTime++;

      // جاذبية بسيطة للعدو
      e.vy = (e.vy || 0) + GRAVITY;
      if (e.vy > MAX_FALL) e.vy = MAX_FALL;

      // أفقي
      e.x += e.vx;
      for (const s of solids) {
        if (rectHit(e, s)) {
          if (e.vx > 0) e.x = s.x - e.w;
          else e.x = s.x + s.w;
          e.vx = -e.vx; // ارتد
        }
      }
      // رأسي
      e.y += e.vy;
      let grounded = false;
      for (const s of solids) {
        if (rectHit(e, s)) {
          if (e.vy > 0) { e.y = s.y - e.h; e.vy = 0; grounded = true; }
          else { e.y = s.y + s.h; e.vy = 0; }
        }
      }
      // لو خرج من العالم
      if (e.y > worldH + 60) e.alive = false;

      // تصادم مع اللاعب
      const p = player;
      if (!p.dead && rectHit(p, e)) {
        const stomped = p.vy > 0 && (p.y + p.h) - e.y < 18;
        if (stomped) {
          e.alive = false; e.dieTime = 0;
          p.vy = JUMP_VELOCITY * 0.6; // ارتداد
          coins++; updateHUD(); Sound.stomp();
        } else {
          killPlayer();
        }
      }
    }
    // تنظيف الأعداء الميتين بعد فترة
    enemies = enemies.filter((e) => e.alive || e.dieTime < 30);
  }

  // ============ الموت والفوز ============
  function killPlayer() {
    if (player.dead) return;
    player.dead = true;
    lives--;
    updateHUD();
    Sound.die();
    setTimeout(() => {
      if (lives > 0) { buildLevel(level); state = "playing"; }
      else endGame(false);
    }, 700);
  }

  function winLevel() {
    if (state !== "playing") return;
    state = "win-anim";
    Sound.win();
    setTimeout(() => {
      level++;
      if (level < LEVELS.length) {
        buildLevel(level); updateHUD(); state = "playing";
      } else {
        endGame(true);
      }
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

  // ============ الرسم ============
  function draw() {
    // خلفية
    ctx.fillStyle = C.sky;
    ctx.fillRect(0, 0, VW, VH);
    drawClouds();

    // الكاميرا تتبع اللاعب
    camX = player.x + player.w / 2 - VW / 2;
    if (camX < 0) camX = 0;
    if (camX > worldW - VW) camX = worldW - VW;

    ctx.save();
    ctx.translate(-Math.round(camX), 0);

    drawSolids();
    drawCoins();
    drawFlag();
    drawEnemies();
    drawPlayer();

    ctx.restore();
  }

  function drawClouds() {
    ctx.fillStyle = C.cloud;
    const offset = (camX * 0.3) % 260;
    for (let i = -1; i < 4; i++) {
      const bx = i * 260 - offset + 40;
      const by = 40 + (i % 2) * 26;
      puff(bx, by);
    }
  }
  function puff(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, 7); ctx.arc(x + 16, y + 4, 18, 0, 7);
    ctx.arc(x + 36, y, 14, 0, 7); ctx.arc(x + 18, y - 6, 15, 0, 7);
    ctx.fill();
  }

  function drawSolids() {
    for (const s of solids) {
      if (s.x + s.w < camX || s.x > camX + VW) continue; // خارج الشاشة
      if (s.type === "ground") {
        ctx.fillStyle = C.ground;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = C.groundTop;
        ctx.fillRect(s.x, s.y, s.w, 7);
        ctx.fillStyle = "rgba(0,0,0,.12)";
        ctx.fillRect(s.x, s.y + s.h - 4, s.w, 4);
      } else if (s.type === "brick") {
        ctx.fillStyle = C.brick;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.strokeStyle = C.brickLine; ctx.lineWidth = 2;
        ctx.strokeRect(s.x + 1, s.y + 1, s.w - 2, s.h / 2 - 1);
        ctx.strokeRect(s.x + 1, s.y + s.h / 2, s.w - 2, s.h / 2 - 1);
      } else if (s.type === "block") {
        ctx.fillStyle = C.block;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = C.blockDark;
        ctx.fillRect(s.x + 2, s.y + 2, s.w - 4, s.h - 4);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("?", s.x + s.w / 2, s.y + s.h / 2 + 1);
      } else if (s.type === "used") {
        ctx.fillStyle = C.blockDark;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = "#8a5313";
        ctx.fillRect(s.x + 2, s.y + 2, s.w - 4, s.h - 4);
      }
    }
  }

  function drawCoins() {
    for (const coin of coinList) {
      if (coin.got) continue;
      if (coin.x < camX - 20 || coin.x > camX + VW + 20) continue;
      const wob = Math.abs(Math.sin(coin.x + performance.now() / 200));
      ctx.save();
      ctx.translate(coin.x, coin.y);
      ctx.scale(0.4 + wob * 0.6, 1);
      ctx.fillStyle = C.coin;
      ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill();
      ctx.fillStyle = C.coinDark;
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill();
      ctx.restore();
    }
  }

  function drawFlag() {
    if (!flag) return;
    ctx.fillStyle = C.flagPole;
    ctx.fillRect(flag.x - 2, flag.y - TILE * 4, 4, TILE * 5);
    ctx.fillStyle = C.flag;
    ctx.beginPath();
    ctx.moveTo(flag.x + 2, flag.y - TILE * 4);
    ctx.lineTo(flag.x + 36, flag.y - TILE * 4 + 12);
    ctx.lineTo(flag.x + 2, flag.y - TILE * 4 + 24);
    ctx.fill();
    ctx.fillStyle = "#ffd700";
    ctx.beginPath(); ctx.arc(flag.x, flag.y - TILE * 4 - 4, 5, 0, 7); ctx.fill();
  }

  function drawEnemies() {
    for (const e of enemies) {
      if (e.x + e.w < camX || e.x > camX + VW) continue;
      if (!e.alive) {
        // مهروس
        ctx.fillStyle = C.enemy;
        ctx.fillRect(e.x, e.y + e.h - 8, e.w, 8);
        continue;
      }
      const wob = Math.floor(e.animTime / 8) % 2;
      // جسم
      ctx.fillStyle = C.enemy;
      ctx.beginPath();
      ctx.ellipse(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, e.h / 2, 0, 0, 7);
      ctx.fill();
      // عيون
      ctx.fillStyle = "#fff";
      ctx.fillRect(e.x + 5, e.y + 8, 6, 8);
      ctx.fillRect(e.x + e.w - 11, e.y + 8, 6, 8);
      ctx.fillStyle = "#000";
      ctx.fillRect(e.x + 7, e.y + 11, 3, 4);
      ctx.fillRect(e.x + e.w - 9, e.y + 11, 3, 4);
      // أقدام
      ctx.fillStyle = C.enemyFoot;
      ctx.fillRect(e.x + 2, e.y + e.h - 4, 8, 5 + wob);
      ctx.fillRect(e.x + e.w - 10, e.y + e.h - 4, 8, 5 + (1 - wob));
    }
  }

  function drawPlayer() {
    const p = player;
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y);
    if (p.face < 0) ctx.scale(-1, 1);
    const step = Math.floor(p.animTime / 6) % 2;
    const legShift = p.onGround && Math.abs(p.vx) > 0.1 ? step * 3 : 0;

    if (p.dead) ctx.globalAlpha = 0.5;

    // حذاء
    ctx.fillStyle = C.shoe;
    ctx.fillRect(-9, p.h - 5, 8, 5);
    ctx.fillRect(1 + legShift, p.h - 5, 8, 5);
    // أفرول
    ctx.fillStyle = C.overall;
    ctx.fillRect(-9, 16, 18, p.h - 21);
    // جسم/قميص
    ctx.fillStyle = C.body;
    ctx.fillRect(-9, 11, 18, 8);
    // يد
    ctx.fillStyle = C.skin;
    ctx.fillRect(6, 14, 5, 8);
    // رأس
    ctx.fillStyle = C.skin;
    ctx.fillRect(-8, 0, 16, 12);
    // قبعة
    ctx.fillStyle = C.cap;
    ctx.fillRect(-9, -2, 18, 5);
    ctx.fillRect(2, 0, 9, 3);
    // عين
    ctx.fillStyle = "#000";
    ctx.fillRect(3, 4, 2, 4);
    // شارب
    ctx.fillRect(2, 9, 7, 2);

    ctx.restore();
  }

  // ============ الحلقة الرئيسية ============
  function loop() {
    if (state === "playing") {
      updatePlayer();
      updateEnemies();
    }
    if (state === "playing" || state === "win-anim" || state === "dead" || state === "win") {
      if (player) draw();
    }
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

  // ============ بدء / إعادة اللعبة ============
  function startGame() {
    Sound.resume();
    level = 0; coins = 0; lives = 3;
    buildLevel(0);
    updateHUD();
    state = "playing";
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("end-screen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    document.getElementById("controls").classList.remove("hidden");
  }

  // ============ التحكم ============
  // كيبورد
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

  // لمس
  function bindTouch(id, onDown, onUp) {
    const el = document.getElementById(id);
    const down = (e) => { e.preventDefault(); el.classList.add("pressed"); onDown(); };
    const up = (e) => { e.preventDefault(); el.classList.remove("pressed"); onUp(); };
    el.addEventListener("touchstart", down, { passive: false });
    el.addEventListener("touchend", up, { passive: false });
    el.addEventListener("touchcancel", up, { passive: false });
    el.addEventListener("mousedown", down);
    el.addEventListener("mouseup", up);
    el.addEventListener("mouseleave", up);
  }
  bindTouch("btn-left", () => (keys.left = true), () => (keys.left = false));
  bindTouch("btn-right", () => (keys.right = true), () => (keys.right = false));
  bindTouch("btn-jump", () => (keys.jump = true), () => (keys.jump = false));

  document.getElementById("start-btn").addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", startGame);

  // زر كتم/تشغيل الصوت
  const muteBtn = document.getElementById("btn-mute");
  function refreshMuteIcon() { muteBtn.textContent = Sound.isMuted() ? "🔇" : "🔊"; }
  if (muteBtn) {
    refreshMuteIcon();
    muteBtn.addEventListener("click", () => { Sound.toggle(); refreshMuteIcon(); });
  }

  // ============ ضبط حجم الكانفس ليملأ الشاشة مع الحفاظ على النسبة ============
  function resize() {
    const scale = Math.min(innerWidth / VW, innerHeight / VH);
    canvas.style.width = Math.floor(VW * scale) + "px";
    canvas.style.height = Math.floor(VH * scale) + "px";
  }
  addEventListener("resize", resize);
  addEventListener("orientationchange", resize);
  resize();

  // تسجيل الـ Service Worker (لتشغيل اللعبة كتطبيق يعمل بدون إنترنت)
  // مع تحديث ذاتي: لو ظهرت نسخة جديدة، الصفحة تتحدّث مرة واحدة تلقائياً.
  if ("serviceWorker" in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
    addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then((reg) => {
        reg.update();
        // افحص وجود تحديث كل مرة يرجع فيها التطبيق للواجهة
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) reg.update();
        });
      }).catch(() => {});
    });
  }

  loop();
})();
