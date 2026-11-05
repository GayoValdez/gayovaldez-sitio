/* Marco del sitio: mantiene la música sonando al cambiar de página. */
(function () {
  var URI = "spotify:playlist:37i9dQZF1DZ06evO0dX8AN";
  /* ---------- Ventana principal: construir el marco + barra ---------- */
  var u = new URLSearchParams(location.search).get("u") || "";
  if (!u || /^[a-z][a-z0-9+.-]*:/i.test(u) || u.indexOf("//") === 0) u = "";   // solo páginas de este sitio
  var root = location.pathname.replace(/shell\.html$/, "");
  var start = root + u;
  try { history.replaceState(null, "", start); } catch (e) {}

  var st = document.createElement("style");
  st.textContent =
    "html,body{margin:0;height:100%;background:#100E08;overflow:hidden}" +
    "#gvf{position:fixed;left:0;top:28px;width:100%;height:calc(100% - 80px - env(safe-area-inset-bottom,0px));border:0;background:#100E08}" +
    ".gvp{position:fixed;left:0;right:0;bottom:0;z-index:40;height:calc(52px + env(safe-area-inset-bottom,0px));box-sizing:border-box;display:flex;align-items:flex-start;gap:8px;padding:9px max(14px,env(safe-area-inset-left,0px)) 0;background:#100E08;border-top:2px solid #FEC009;font:700 13px 'Space Grotesk',system-ui,sans-serif;color:#FFF3CF}" +
    ".gvp button{all:unset;box-sizing:border-box;cursor:pointer;width:34px;height:34px;display:grid;place-items:center;border:2px solid #FEC009;color:#FEC009;font-size:14px;line-height:1;transition:transform .2s cubic-bezier(.3,1.6,.5,1),background .2s,color .2s}" +
    ".gvp button:hover,.gvp button:focus-visible{background:#FEC009;color:#100E08;transform:translateY(-2px) rotate(-4deg)}" +
    ".gvp button.on{background:#FEC009;color:#100E08}" +
    ".gvp .gvp-lb{align-self:center;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".gvp .disc{align-self:center;width:24px;height:24px;border-radius:50%;flex:none;background:radial-gradient(circle,#FEC009 0 14%,#100E08 15% 22%,#2a2618 23% 100%);border:1px solid #5AA5FF;box-shadow:inset 0 0 0 3px #1b1810,inset 0 0 0 4px #3a3320}.gvp.go .disc{animation:gvspin 2.4s linear infinite}@keyframes gvspin{to{transform:rotate(360deg)}}" +
    ".gvp .eq{align-self:center;display:inline-flex;gap:2px;align-items:flex-end;height:14px}.gvp .eq i{width:3px;background:#5AA5FF;height:3px}" +
    ".gvp.go .eq i{animation:gveq .8s ease-in-out infinite}.gvp.go .eq i:nth-child(2){animation-delay:-.3s}.gvp.go .eq i:nth-child(3){animation-delay:-.6s}" +
    "@keyframes gveq{0%,100%{height:3px}50%{height:14px}}" +
    ".gvl{position:fixed;left:0;right:0;top:0;height:28px;z-index:40;display:flex;align-items:center;justify-content:center;gap:8px;background:#100E08;border-bottom:1px solid rgba(254,192,9,.35);font:600 12px 'Space Grotesk',system-ui,sans-serif;color:#FFF3CF}.gvl b{color:#FEC009;font-size:14px;min-width:3ch;text-align:left}.gvl i{width:7px;height:7px;border-radius:50%;background:#2ecc71;animation:gvlp 1.4s infinite}@keyframes gvlp{50%{opacity:.25}}" +
    ".gvp-hold{position:fixed;left:-420px;bottom:0;width:300px;height:152px;opacity:0;pointer-events:none}";
  document.head.appendChild(st);

  var fr = document.createElement("iframe");
  fr.id = "gvf"; fr.title = "Gayo Valdez"; fr.src = start;
  fr.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
  fr.setAttribute("allowfullscreen", "");
  document.body.appendChild(fr);

  var live = document.createElement("div");
  live.className = "gvl";
  live.innerHTML = '<i></i><span>Escuchando en Spotify ahora:</span><b id="gvlN">0</b>';
  document.body.appendChild(live);
  var gBase = 50, gLast = -1, gT = 0;
  function tick(){
    if (Date.now() - gT >= 300000) {
      var k; do { k = Math.floor(Math.random() * 10); } while (k === gLast);
      gLast = k; gBase = 50 + k * 10; gT = Date.now();
    }
    document.getElementById("gvlN").textContent = gBase + Math.floor(Math.random() * 11);
  }
  tick(); setInterval(tick, 30000);

  var bar = document.createElement("div");
  bar.className = "gvp";
  bar.innerHTML = '<button type="button" id="gvpPlay" aria-label="Reproducir">&#9654;</button><button type="button" id="gvpStop" aria-label="Detener">&#9632;</button><span class="disc" aria-hidden="true"></span><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="gvp-lb" id="gvpLb">Toca para escuchar</span>';
  document.body.appendChild(bar);
  var q = function (s) { return bar.querySelector(s); };

  var playing = false, stopped = false, ready = false, curTitle = "", curUri = "";
  function label() { q("#gvpLb").textContent = playing ? (curTitle || "Gayo Valdez") : "Toca para escuchar"; }
  function ui(on) {
    playing = on; bar.classList.toggle("go", on);
    q("#gvpPlay").classList.toggle("on", on);
    label();
  }
  // nombre de la canción que suena (Spotify avisa el URI; el nombre sale de su oEmbed)
  var titles = {};
  function track(uri) {
    if (!/^spotify:track:[A-Za-z0-9]+$/.test(uri || "") || uri === curUri) return;
    curUri = uri;
    if (titles[uri]) { curTitle = titles[uri]; label(); return; }
    curTitle = ""; label();
    try {
      fetch("https://open.spotify.com/oembed?url=" + encodeURIComponent(uri)).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.title) { titles[uri] = j.title; if (curUri === uri) { curTitle = j.title; label(); } }
      }).catch(function () {});
    } catch (er) {}
  }
  // Reproductor de Spotify (oculto): se controla por mensajes
  var sp = document.createElement("iframe");
  sp.src = "https://open.spotify.com/embed/playlist/" + URI.split(":")[2] + "?utm_source=generator";
  sp.allow = "autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture";
  sp.title = "This Is Gayo Valdez"; sp.className = "gvp-hold"; sp.style.border = "0"; sp.width = 300; sp.height = 152;
  document.body.appendChild(sp);
  function cmd(c) { try { sp.contentWindow.postMessage({ command: c }, "*"); } catch (e) {} }
  function play() { if (!playing) cmd("toggle"); }

  q("#gvpPlay").onclick = function () { stopped = false; play(); };
  q("#gvpStop").onclick = function () { stopped = true; if (playing) cmd("toggle"); ui(false); };

  // El navegador no deja sonar sin un toque: el primer toque en el sitio inicia la música.
  var firstDone = false;
  function firstGesture(e) {
    if (e && e.target && e.target.closest && e.target.closest(".gvp")) { firstDone = true; return; }
    if (firstDone || stopped || !ready) return; firstDone = true; play();
  }
  ["pointerdown", "touchend", "keydown"].forEach(function (n) { addEventListener(n, firstGesture, true); });

  addEventListener("message", function (e) {
    var d = e.data; if (!d) return;
    if (e.source === sp.contentWindow) {
      if (d.type === "ready") { ready = true; if (!stopped) play(); }
      else if (d.type === "playback_update" && d.payload) { track(d.payload.playingURI); ui(!d.payload.isPaused); }
      return;
    }
    if (!d.gv) return;
    if (d.gv === "gesture") { firstGesture(null); return; }
    if (d.gv === "page") {
      try { if (d.title) document.title = d.title; } catch (er) {}
      try { var u = new URL(d.href); if (u.origin === location.origin) history.replaceState(null, "", u.pathname + u.search + u.hash); } catch (er) {}
    }
  });
})();
