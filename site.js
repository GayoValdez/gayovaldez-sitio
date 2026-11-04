(function(){
  var C = window.GAYO || {links:{}};
  document.querySelectorAll("[data-link]").forEach(function(a){
    var u = C.links[a.dataset.link];
    if (u) { a.href = u; a.target = "_blank"; a.rel = "noopener"; }
    else { var li = a.closest("li"); if (li) li.hidden = true; else a.hidden = true; }
  });
  document.querySelectorAll("[data-email]").forEach(function(n){
    n.textContent = C.email;
    if (n.tagName === "A") n.href = "mailto:" + C.email;
  });
  document.querySelectorAll("[data-tiktok]").forEach(function(n){ n.textContent = C.tiktokUser; });
  document.querySelectorAll("[data-year]").forEach(function(n){ n.textContent = new Date().getFullYear(); });
  var b = document.getElementById("cp");
  if (b) b.addEventListener("click", function(){
    function done(){ b.textContent = "Copiado"; setTimeout(function(){ b.textContent = "Copiar"; }, 1800); }
    if (navigator.clipboard) navigator.clipboard.writeText(C.email).then(done, function(){});
  });
})();
