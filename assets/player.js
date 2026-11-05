/* Gayo Valdez: reproductor continuo. Cada página corre dentro de shell.html, que tiene la música. */
(function () {
  if (window.top !== window) {
    var tell = function () { try { parent.postMessage({ gv: "page", href: location.href, title: document.title }, "*"); } catch (e) {} };
    tell(); addEventListener("load", tell);
    ["pointerdown", "touchend", "keydown"].forEach(function (n) {
      addEventListener(n, function () { try { parent.postMessage({ gv: "gesture" }, "*"); } catch (e) {} }, { capture: true, passive: true });
    });
    // enlaces a otros sitios: abrir en la ventana principal (Stripe, etc. no se dejan enmarcar)
    addEventListener("click", function (e) {
      var a = e.target && e.target.closest && e.target.closest("a[href]");
      if (!a || a.target) return;
      try { var u = new URL(a.href, location.href); if (/^https?:$/.test(u.protocol) && u.origin !== location.origin) a.target = "_top"; } catch (er) {}
    }, true);
    return;
  }
  // Página abierta sola: mandarla al marco con la música
  var cs = document.currentScript; if (!cs) return;
  var rootUrl = new URL(cs.src.replace(/assets\/player\.js.*$/, ""), location.href);
  var rel = location.pathname.slice(rootUrl.pathname.length) + location.search + location.hash;
  document.documentElement.style.background = "#100E08";
  document.documentElement.style.visibility = "hidden";
  setTimeout(function () { document.documentElement.style.visibility = "visible"; }, 3000);
  location.replace(rootUrl.pathname + "shell.html?u=" + encodeURIComponent(rel));
})();
