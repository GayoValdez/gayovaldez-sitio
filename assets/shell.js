/* Marco del sitio: mantiene la música sonando al cambiar de página. */
(function () {
  /* ---------- Ventana principal: construir el marco + barra ---------- */
  var u = new URLSearchParams(location.search).get("u") || "";
  if (!u || /^[a-z][a-z0-9+.-]*:/i.test(u) || u.indexOf("//") === 0) u = "";   // solo páginas de este sitio
  var root = location.pathname.replace(/shell\.html$/, "");
  var start = root + u;
  try { history.replaceState(null, "", start); } catch (e) {}

  var st = document.createElement("style");
  st.textContent =
    "html,body{margin:0;height:100%;background:#100E08;overflow:hidden}" +
    "#gvf{position:fixed;left:0;top:0;width:100%;height:calc(100% - 52px - env(safe-area-inset-bottom,0px));border:0;background:#100E08}" +
    ".gvp{position:fixed;left:0;right:0;bottom:0;z-index:40;height:calc(52px + env(safe-area-inset-bottom,0px));box-sizing:border-box;display:flex;align-items:flex-start;gap:8px;padding:9px max(14px,env(safe-area-inset-left,0px)) 0;background:#100E08;border-top:2px solid #FEC009;font:700 13px 'Space Grotesk',system-ui,sans-serif;color:#FFF3CF}" +
    ".gvp button{all:unset;box-sizing:border-box;cursor:pointer;width:34px;height:34px;display:grid;place-items:center;border:2px solid #FEC009;color:#FEC009;font-size:14px;line-height:1;transition:transform .2s cubic-bezier(.3,1.6,.5,1),background .2s,color .2s}" +
    ".gvp button:hover,.gvp button:focus-visible{background:#FEC009;color:#100E08;transform:translateY(-2px) rotate(-4deg)}" +
    ".gvp button.on{background:#FEC009;color:#100E08}" +
    ".gvp .gvp-lb{align-self:center;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".gvp .eq{align-self:center;display:inline-flex;gap:2px;align-items:flex-end;height:14px}.gvp .eq i{width:3px;background:#5AA5FF;height:3px}" +
    ".gvp.go .eq i{animation:gveq .8s ease-in-out infinite}.gvp.go .eq i:nth-child(2){animation-delay:-.3s}.gvp.go .eq i:nth-child(3){animation-delay:-.6s}" +
    "@keyframes gveq{0%,100%{height:3px}50%{height:14px}}" +
    ".gvp-hold{position:fixed;left:-420px;bottom:0;width:300px;height:80px;opacity:0;pointer-events:none}";
  document.head.appendChild(st);

  var fr = document.createElement("iframe");
  fr.id = "gvf"; fr.title = "Gayo Valdez"; fr.src = start;
  fr.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
  fr.setAttribute("allowfullscreen", "");
  document.body.appendChild(fr);

  var bar = document.createElement("div");
  bar.className = "gvp";
  bar.innerHTML = '<button type="button" id="gvpPlay" aria-label="Reproducir">&#9654;</button><button type="button" id="gvpStop" aria-label="Detener">&#9632;</button><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="gvp-lb" id="gvpLb">Toca para escuchar</span>';
  document.body.appendChild(bar);
  var q = function (s) { return bar.querySelector(s); };

  var ctl = null, playing = false, stopped = false;
  function ui(on) {
    playing = on; bar.classList.toggle("go", on);
    q("#gvpPlay").classList.toggle("on", on);
    q("#gvpLb").textContent = on ? "This Is Gayo Valdez" : "Toca para escuchar";
  }
  var hold = document.createElement("div"); hold.className = "gvp-hold";
  var mount = document.createElement("div"); hold.appendChild(mount); document.body.appendChild(hold);
  window.onSpotifyIframeApiReady = function (API) {
    API.createController(mount, { uri: URI, width: 300, height: 80 }, function (c) {
      ctl = c;
      c.addListener("playback_update", function (e) { if (e && e.data) ui(!e.data.isPaused); });
      c.addListener("ready", function () { if (!stopped) try { c.play(); } catch (e) {} });
    });
  };
  var s = document.createElement("script"); s.src = "https://open.spotify.com/embed/iframe-api/v1"; s.async = true; document.body.appendChild(s);

  q("#gvpPlay").onclick = function () { stopped = false; if (ctl) ctl.play(); };
  q("#gvpStop").onclick = function () { stopped = true; if (ctl) { ctl.pause(); try { ctl.seek(0); } catch (e) {} } ui(false); };

  // El navegador no deja sonar sin un toque: el primer toque en el sitio inicia la música.
  var firstDone = false;
  function firstGesture() { if (firstDone) return; if (stopped || !ctl) return; firstDone = true; try { ctl.play(); } catch (e) {} }
  ["pointerdown", "touchend", "keydown"].forEach(function (n) { addEventListener(n, firstGesture, true); });

  addEventListener("message", function (e) {
    var d = e.data; if (!d || !d.gv) return;
    if (d.gv === "gesture") { firstGesture(); return; }
    if (d.gv === "page") {
      try { if (d.title) document.title = d.title; } catch (er) {}
      try { var u = new URL(d.href); if (u.origin === location.origin) history.replaceState(null, "", u.pathname + u.search + u.hash); } catch (er) {}
    }
  });
})();
