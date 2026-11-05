/* Gayo Valdez: efectos divertidos. Se carga solo dentro del marco (player.js lo inyecta). */
(function () {
  "use strict";
  /* ====== EDITA AQUÍ ====== */
  // Cuenta regresiva: deja fecha vacía para ocultarla. Ejemplo: "2026-12-01T00:00:00-06:00"
  var RELEASE = { nombre: "", fecha: "" };
  // Frases del botón "Frase". Cámbialas por líneas de tus canciones.
  var FRASES = [
    "Hijo de la melancolía.",
    "A veces la lluvia también canta.",
    "Lo que duele, se vuelve canción.",
    "Hoy toca sentirlo todo.",
    "Un lofi para los que se quedaron despiertos.",
    "Escribir es la forma más bonita de llorar.",
    "No todo lo triste es malo.",
    "Amarillo por fuera, azul por dentro."
  ];
  var DICHOS = ["¡Hola!", "¿Ya escuchaste Amarilla?", "Hijo de la melancolía", "💔", "Dale play ▶", "Weise Kinder"];
  /* ========================= */

  var doc = document, root = doc.documentElement;
  var reduce = false; try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var coarse = false; try { coarse = matchMedia("(pointer: coarse)").matches; } catch (e) {}
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  var css = doc.createElement("style");
  css.textContent =
    "#gvfx{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483000}" +
    ".gvn-tint{position:fixed;inset:0;pointer-events:none;z-index:2147482990;background:rgba(8,24,70,.42);opacity:0;transition:opacity .6s}" +
    "html.gv-night .gvn-tint{opacity:1}" +
    ".gv-fab{position:fixed;bottom:12px;z-index:2147483001;height:38px;min-width:38px;padding:0 12px;border:2px solid #FEC009;background:#100E08;color:#FEC009;font:700 14px 'Space Grotesk',system-ui,sans-serif;cursor:pointer;border-radius:0}" +
    ".gv-fab:hover{background:#FEC009;color:#100E08}.gv-fab:focus-visible{outline:3px solid #5AA5FF;outline-offset:2px}" +
    "#gvFrase,#gvNight{bottom:auto;right:8px;width:38px;padding:0;font-size:18px;line-height:1;opacity:.85}#gvFrase{top:calc(50% - 44px)}#gvNight{top:50%}.gv-fab:hover{opacity:1}" +
    "html.gv-night #gvNight{background:#5AA5FF;border-color:#5AA5FF;color:#100E08}" +
    ".gv-toast{position:fixed;right:56px;top:calc(50% - 44px);max-width:min(320px,calc(100vw - 24px));z-index:2147483001;background:#FEC009;color:#100E08;padding:12px 14px;font:700 16px/1.35 'Space Grotesk',system-ui,sans-serif;box-shadow:5px 5px 0 #0460CD;transform:translateY(8px);opacity:0;pointer-events:none;transition:.25s}" +
    ".gv-toast.on{transform:none;opacity:1;pointer-events:auto}.gv-toast button{display:block;margin-top:8px;border:2px solid #100E08;background:transparent;font:700 13px 'Space Grotesk',sans-serif;padding:3px 10px;cursor:pointer;color:#100E08}" +
    ".gv-logo{transition:transform .12s ease-out;will-change:transform;cursor:pointer;-webkit-tap-highlight-color:transparent}" +
    ".gv-logo.jump{animation:gvjump .6s cubic-bezier(.3,1.6,.5,1)}@keyframes gvjump{0%{transform:translateY(0)}35%{transform:translateY(-26px) rotate(-6deg)}70%{transform:translateY(0) rotate(4deg)}100%{transform:none}}" +
    ".gv-bub{position:fixed;z-index:2147483002;background:#fff;color:#100E08;padding:6px 10px;font:700 14px 'Space Grotesk',system-ui,sans-serif;border:2px solid #100E08;pointer-events:none;white-space:nowrap;transform:translate(-50%,-100%);animation:gvbub 1.6s forwards}" +
    "@keyframes gvbub{0%{opacity:0;margin-top:8px}15%{opacity:1;margin-top:0}85%{opacity:1}100%{opacity:0;margin-top:-10px}}" +
    ".gv-cd{display:inline-flex;gap:10px;align-items:baseline;margin:6px 0;padding:6px 12px;border:2px dashed #FEC009;font:700 15px 'Space Grotesk',system-ui,sans-serif;color:#FFF3CF}.gv-cd b{color:#FEC009;font-size:20px}" +
    "@media (prefers-reduced-motion:reduce){.gv-logo.jump{animation:none}}";
  doc.head.appendChild(css);

  /* ---------- lienzo de partículas ---------- */
  var cv = doc.createElement("canvas"); cv.id = "gvfx"; cv.setAttribute("aria-hidden", "true");
  var cx = cv.getContext("2d"), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  doc.body.appendChild(cv); size(); addEventListener("resize", size);
  var P = [], rain = [], night = false, raf = 0, last = 0;
  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function add(p) { if (P.length < 260) P.push(p); start(); }
  var COLORS = ["#FEC009", "#5AA5FF", "#FFF3CF", "#0460CD"];
  function spark(x, y, n, notes) {
    if (reduce) return;
    for (var i = 0; i < n; i++) {
      var a = rnd(0, 6.283), s = rnd(1.2, 4.2);
      add({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, g: .12, life: 1, d: rnd(.018, .03),
        c: COLORS[(Math.random() * COLORS.length) | 0], r: rnd(2, 4.5), ch: notes && Math.random() < .5 ? (Math.random() < .5 ? "♪" : "♫") : "" });
    }
  }
  function floatEmoji(x, y, list, n) {
    if (reduce) return;
    for (var i = 0; i < n; i++) add({ x: x + rnd(-14, 14), y: y, vx: rnd(-.8, .8), vy: rnd(-3.4, -1.6), g: -.01, life: 1, d: .012, em: list[(Math.random() * list.length) | 0], r: rnd(18, 28) });
  }
  function confetti() {
    if (reduce) return;
    for (var i = 0; i < 140; i++) add({ x: rnd(0, W), y: rnd(-40, -5), vx: rnd(-1, 1), vy: rnd(2, 5), g: .04, life: 1.4, d: .006, c: COLORS[(Math.random() * 4) | 0], sq: 1, r: rnd(5, 9) });
  }
  function loop(t) {
    var dt = Math.min(2, (t - last) / 16.7); last = t;
    cx.clearRect(0, 0, W, H);
    if (night && !reduce) {
      if (rain.length < 90) for (var k = 0; k < 3; k++) rain.push({ x: rnd(-40, W), y: rnd(-H, 0), v: rnd(11, 18), l: rnd(10, 20) });
      cx.strokeStyle = "rgba(160,200,255,.55)"; cx.lineWidth = 1.2; cx.beginPath();
      for (var i = 0; i < rain.length; i++) {
        var d = rain[i]; d.x += 2.2 * dt; d.y += d.v * dt;
        cx.moveTo(d.x, d.y); cx.lineTo(d.x - 2.2, d.y - d.l);
        if (d.y > H) { d.y = rnd(-80, 0); d.x = rnd(-40, W); }
      }
      cx.stroke();
    } else if (rain.length) rain.length = 0;
    for (var j = P.length - 1; j >= 0; j--) {
      var p = P[j]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.life -= p.d * dt;
      if (p.life <= 0 || p.y > H + 40) { P.splice(j, 1); continue; }
      cx.globalAlpha = Math.max(0, Math.min(1, p.life));
      if (p.em) { cx.font = p.r + "px serif"; cx.fillText(p.em, p.x, p.y); }
      else if (p.ch) { cx.fillStyle = p.c; cx.font = "700 " + (p.r * 4) + "px sans-serif"; cx.fillText(p.ch, p.x, p.y); }
      else if (p.sq) { cx.fillStyle = p.c; cx.fillRect(p.x, p.y, p.r, p.r * .6); }
      else { cx.fillStyle = p.c; cx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r); }
    }
    cx.globalAlpha = 1;
    raf = (P.length || (night && !reduce)) ? requestAnimationFrame(loop) : 0;
  }

  /* ---------- estela del cursor y chispas al tocar ---------- */
  var lastT = 0;
  addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    var n = performance.now(); if (n - lastT < 35) return; lastT = n;
    spark(e.clientX, e.clientY, 1, false);
  }, { passive: true });
  var EMO = ["💔", "🌧️", "🔥", "🖤", "💛"];
  addEventListener("pointerdown", function (e) {
    var t = e.target && e.target.closest ? e.target.closest(".rel-row,a.stat,.promo,.al,.v") : null;
    if (t) floatEmoji(e.clientX, e.clientY, EMO, 5);
    spark(e.clientX, e.clientY, t ? 6 : 12, true);
  }, { passive: true });

  /* ---------- código Konami → lluvia de notas ---------- */
  var KON = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"], ki = 0;
  function notesRain() {
    if (reduce) return;
    var n = 0, iv = setInterval(function () {
      for (var i = 0; i < 5; i++) add({ x: rnd(0, W), y: -20, vx: rnd(-.5, .5), vy: rnd(2, 4), g: .02, life: 2, d: .006, em: ["♪", "♫", "💔", "💛", "🎵"][(Math.random() * 5) | 0], r: rnd(22, 38) });
      if (++n > 40) clearInterval(iv);
    }, 130);
  }
  addEventListener("keydown", function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    ki = (k === KON[ki]) ? ki + 1 : (k === KON[0] ? 1 : 0);
    if (ki === KON.length) { ki = 0; notesRain(); toast("¡Código secreto! 🎵"); }
  });

  /* ---------- botones flotantes + toast ---------- */
  var tEl = doc.createElement("div"); tEl.className = "gv-toast"; tEl.setAttribute("role", "status");
  doc.body.appendChild(tEl);
  var tTimer = 0;
  function toast(msg, again) {
    tEl.textContent = msg;
    if (again) { var b = doc.createElement("button"); b.type = "button"; b.textContent = "Otra"; b.onclick = function (e) { e.stopPropagation(); frase(); }; tEl.appendChild(b); }
    tEl.classList.add("on"); clearTimeout(tTimer); tTimer = setTimeout(function () { tEl.classList.remove("on"); }, again ? 12000 : 3500);
  }
  var fi = -1;
  function frase() { var n; do { n = (Math.random() * FRASES.length) | 0; } while (n === fi && FRASES.length > 1); fi = n; toast("“" + FRASES[n] + "”", true); }
  var bF = doc.createElement("button"); bF.id = "gvFrase"; bF.className = "gv-fab"; bF.type = "button"; bF.textContent = "✦"; bF.title = "Frase aleatoria"; bF.setAttribute("aria-label", "Frase aleatoria");
  bF.onclick = function (e) { e.stopPropagation(); if (tEl.classList.contains("on")) { clearTimeout(tTimer); tEl.classList.remove("on"); } else frase(); };
  var bN = doc.createElement("button"); bN.id = "gvNight"; bN.className = "gv-fab"; bN.type = "button"; bN.setAttribute("aria-label", "Modo noche triste");
  function setNight(on, save) {
    night = on; root.classList.toggle("gv-night", on); bN.textContent = "☾"; bN.title = on ? "Noche triste: activada" : "Noche triste";
    bN.setAttribute("aria-pressed", on ? "true" : "false"); if (save) store("gv-night", on ? "1" : "0"); start();
  }
  bN.onclick = function (e) { e.stopPropagation(); setNight(!night, true); };
  var tint = doc.createElement("div"); tint.className = "gvn-tint";
  doc.body.appendChild(tint); doc.body.appendChild(bF); doc.body.appendChild(bN);
  setNight(store("gv-night") === "1", false);

  /* ---------- personaje (logo) que te mira y reacciona ---------- */
  var logo = doc.querySelector(".cover-logo");
  if (logo) {
    logo.classList.add("gv-logo"); var taps = 0, tapT = 0;
    addEventListener("pointermove", function (e) {
      if (reduce || e.pointerType !== "mouse") return;
      var r = logo.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      logo.style.transform = "translate(" + (dx * 14).toFixed(1) + "px," + (dy * 14).toFixed(1) + "px) rotate(" + (dx * 8).toFixed(1) + "deg)";
    }, { passive: true });
    logo.addEventListener("click", function (e) {
      e.stopPropagation();
      logo.classList.remove("jump"); void logo.offsetWidth; logo.classList.add("jump");
      var r = logo.getBoundingClientRect(), b = doc.createElement("div"); b.className = "gv-bub";
      b.textContent = DICHOS[(Math.random() * DICHOS.length) | 0];
      b.style.left = Math.min(Math.max(r.left + r.width / 2, 70), innerWidth - 70) + "px"; b.style.top = Math.max(r.top, 40) + "px";
      doc.body.appendChild(b); setTimeout(function () { b.remove(); }, 1700);
      spark(r.left + r.width / 2, r.top + r.height / 2, 14, true);
      var n = Date.now(); taps = (n - tapT < 700) ? taps + 1 : 1; tapT = n; if (taps >= 5) { taps = 0; notesRain(); }
    });
  }

  /* ---------- cuenta regresiva ---------- */
  if (RELEASE.fecha && doc.querySelector(".cover .lead")) {
    var end = new Date(RELEASE.fecha).getTime();
    if (end && end > Date.now()) {
      var cd = doc.createElement("div"); cd.className = "gv-cd"; cd.setAttribute("aria-live", "off");
      doc.querySelector(".cover .lead").insertAdjacentElement("afterend", cd);
      var fired = false;
      (function tick() {
        var s = Math.max(0, Math.floor((end - Date.now()) / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), q = s % 60;
        if (s === 0) { cd.innerHTML = "<b>¡Ya salió!</b> " + (RELEASE.nombre || ""); if (!fired) { fired = true; confetti(); } return; }
        cd.innerHTML = (RELEASE.nombre ? RELEASE.nombre + " en " : "Próximo lanzamiento en ") + "<b>" + d + "</b>d <b>" + h + "</b>h <b>" + m + "</b>m <b>" + q + "</b>s";
        setTimeout(tick, 1000);
      })();
    }
  }
  // en las páginas normales (no la portada), dejar espacio abajo para los botones flotantes
  if (!doc.querySelector(".cover")) doc.body.style.paddingBottom = "64px";
  window.GVFX = { spark: spark, floatEmoji: floatEmoji, confetti: confetti, notesRain: notesRain };
})();
