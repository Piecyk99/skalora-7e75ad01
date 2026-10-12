export const MANIFEST = JSON.stringify({
  name: "Gym",
  short_name: "Gym",
  description: "Dziennik treningowy",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#0f1115",
  theme_color: "#0f1115",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
  ],
});

// Service worker: tylko pliki statyczne z cache; API zawsze z sieci.
export const SW = `
const C = "gym-v1";
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.pathname.startsWith("/api/")) return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(C).then((c) => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then((m) => m || caches.match("/")))
  );
});
`;

export const HTML = String.raw`<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<title>Gym</title>
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#0f1115">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Gym">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>
:root{--bg:#0f1115;--card:#181b21;--line:#262a33;--tx:#e8eaee;--mut:#8b919d;--ac:#34d399;--acd:#0b3d2e;--bad:#f87171}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.4 -apple-system,system-ui,Segoe UI,Roboto,sans-serif}
body{padding:env(safe-area-inset-top) 16px calc(76px + env(safe-area-inset-bottom))}
main{max-width:560px;margin:0 auto;padding-top:14px}
h1{font-size:22px;margin:6px 0 14px}
h2{font-size:15px;color:var(--mut);font-weight:600;margin:20px 0 8px;text-transform:uppercase;letter-spacing:.04em}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:12px}
label{display:block;font-size:12px;color:var(--mut);margin:0 0 4px}
input,select{width:100%;background:#0f1115;color:var(--tx);border:1px solid var(--line);border-radius:10px;padding:12px;font-size:16px;font-family:inherit}
input:focus,select:focus{outline:2px solid var(--ac);border-color:transparent}
.row{display:flex;gap:10px}.row>*{flex:1;min-width:0}
button{background:var(--ac);color:#06281d;border:0;border-radius:10px;padding:13px 16px;font-size:16px;font-weight:700;font-family:inherit;width:100%}
button.sec{background:var(--line);color:var(--tx);font-weight:600}
button.mini{width:auto;padding:6px 10px;font-size:13px;background:transparent;color:var(--mut);border:1px solid var(--line);font-weight:500}
button:active{opacity:.8}
.mt{margin-top:12px}
.set{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-top:1px solid var(--line)}
.set:first-of-type{border-top:0}
.ex{font-weight:700;margin-bottom:4px}
.mut{color:var(--mut);font-size:13px}
.big{font-size:26px;font-weight:800}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat{background:#0f1115;border:1px solid var(--line);border-radius:10px;padding:10px}
nav{position:fixed;left:0;right:0;bottom:0;background:rgba(24,27,33,.96);backdrop-filter:blur(8px);border-top:1px solid var(--line);display:flex;padding:6px 8px calc(6px + env(safe-area-inset-bottom))}
nav button{background:transparent;color:var(--mut);font-size:12px;font-weight:600;padding:8px 4px;border-radius:8px;flex:1}
nav button.on{color:var(--ac)}
nav button span{display:block;font-size:20px;line-height:1.1}
.err{color:var(--bad);font-size:14px;min-height:20px;margin-top:8px}
.center{max-width:340px;margin:18vh auto 0;text-align:center}
.pin{font-size:28px;letter-spacing:.4em;text-align:center}
svg{width:100%;height:auto;display:block}
.hidden{display:none}
</style>
</head>
<body>
<main id="app"></main>
<script>
(function () {
  "use strict";
  var app = document.getElementById("app");
  var PRESETS = ["Wyciskanie sztangi leżąc","Wyciskanie hantli na ławce skośnej","Przysiad ze sztangą","Martwy ciąg","Martwy ciąg rumuński","Wyciskanie żołnierskie","Podciąganie","Wiosłowanie sztangą","Wiosłowanie hantlą","Ściąganie drążka górnego","Dipy","Uginanie ramion ze sztangą","Uginanie młotkowe","Prostowanie ramion na wyciągu","Wznosy bokiem","Face pull","Wykroki","Hip thrust","Prostowanie nóg na maszynie","Uginanie nóg leżąc","Wspięcia na palce","Brzuszki na wyciągu","Plank"];
  var state = { tab: "today", day: today(), sets: [], exercises: [], selEx: null, hist: [], weights: [] };

  function today() { var d = new Date(); return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
  function p2(n) { return n < 10 ? "0" + n : "" + n; }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === "text") e.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function fmt(n) { return (Math.round(n * 10) / 10).toString().replace(".", ","); }
  function api(path, method, body) {
    return fetch(path, { method: method || "GET", headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || "err"); e.status = r.status; e.data = j; throw e; } return j; }); });
  }
  function clear() { while (app.firstChild) app.removeChild(app.firstChild); }

  // ---------- auth ----------
  function authScreen(setup) {
    clear();
    var pin = el("input", { type: "password", inputmode: "numeric", pattern: "[0-9]*", maxlength: "12", class: "pin", autocomplete: setup ? "new-password" : "current-password", placeholder: "••••" });
    var pin2 = setup ? el("input", { type: "password", inputmode: "numeric", pattern: "[0-9]*", maxlength: "12", class: "pin mt", placeholder: "powtórz" }) : null;
    var err = el("div", { class: "err" });
    var btn = el("button", { class: "mt", text: setup ? "Ustaw PIN" : "Wejdź", onclick: go });
    function go() {
      err.textContent = "";
      if (setup && pin.value !== pin2.value) { err.textContent = "PIN-y się różnią"; return; }
      api(setup ? "/api/setup" : "/api/login", "POST", { pin: pin.value }).then(boot).catch(function (e) {
        err.textContent = e.data && e.data.error === "locked" ? "Za dużo prób. Spróbuj za " + Math.ceil(e.data.retry_s / 60) + " min" :
          e.data && e.data.error === "pin_format" ? "PIN: 4-12 cyfr" : "Zły PIN";
      });
    }
    pin.addEventListener("keydown", function (e) { if (e.key === "Enter" && !setup) go(); });
    app.appendChild(el("div", { class: "center" }, [
      el("h1", { text: setup ? "Ustaw PIN" : "Gym" }),
      el("p", { class: "mut", text: setup ? "To pierwsze uruchomienie. PIN chroni Twoje dane (4-12 cyfr)." : "Podaj PIN" }),
      pin, pin2, btn, err
    ]));
    setTimeout(function () { pin.focus(); }, 50);
  }

  // ---------- shell ----------
  function shell(content) {
    clear();
    app.appendChild(content);
    var tabs = [["today", "🏋️", "Dziś"], ["prog", "📈", "Postępy"], ["weight", "⚖️", "Waga"], ["more", "⚙️", "Więcej"]];
    var old = document.querySelector("nav"); if (old) old.remove();
    var nav = el("nav", {}, tabs.map(function (t) {
      return el("button", { class: state.tab === t[0] ? "on" : "", onclick: function () { state.tab = t[0]; render(); } }, [el("span", { text: t[1] }), t[2]]);
    }));
    document.body.appendChild(nav);
  }
  function render() {
    ({ today: viewToday, prog: viewProg, weight: viewWeight, more: viewMore })[state.tab]();
  }

  // ---------- today ----------
  function loadToday() {
    return Promise.all([api("/api/sets?day=" + state.day), api("/api/exercises")]).then(function (r) { state.sets = r[0]; state.exercises = r[1]; });
  }
  function viewToday() {
    loadToday().then(function () {
      var names = {}; state.exercises.forEach(function (e) { names[e.exercise] = 1; });
      var dl = el("datalist", { id: "exlist" });
      state.exercises.map(function (e) { return e.exercise; }).concat(PRESETS.filter(function (n) { return !names[n]; })).forEach(function (n) { dl.appendChild(el("option", { value: n })); });
      var dayIn = el("input", { type: "date", value: state.day, onchange: function (e) { if (e.target.value) { state.day = e.target.value; viewToday(); } } });
      var exIn = el("input", { id: "exin", list: "exlist", placeholder: "Ćwiczenie", autocomplete: "off", autocapitalize: "sentences" });
      var wIn = el("input", { id: "win", type: "number", inputmode: "decimal", step: "0.25", min: "0", placeholder: "0" });
      var rIn = el("input", { id: "rin", type: "number", inputmode: "numeric", step: "1", min: "1", placeholder: "0" });
      var hint = el("div", { class: "mut mt" });
      function prefill() {
        var f = state.exercises.filter(function (e) { return e.exercise === exIn.value.trim(); })[0];
        if (f) { wIn.value = f.last_weight; rIn.value = f.last_reps; hint.textContent = "Ostatnio: " + fmt(f.last_weight) + " kg × " + f.last_reps + " (" + f.last_day + ")"; }
        else hint.textContent = "";
      }
      exIn.addEventListener("change", prefill); exIn.addEventListener("input", prefill);
      var err = el("div", { class: "err" });
      var add = el("button", { class: "mt", text: "Dodaj serię", onclick: function () {
        err.textContent = "";
        api("/api/sets", "POST", { day: state.day, exercise: exIn.value, weight: wIn.value, reps: rIn.value }).then(function () { viewToday(); }).catch(function () { err.textContent = "Uzupełnij ćwiczenie, ciężar i powtórzenia"; });
      } });
      var form = el("div", { class: "card" }, [
        el("label", { text: "Dzień" }), dayIn,
        el("label", { class: "mt", text: "Ćwiczenie" }), exIn, dl,
        el("div", { class: "row mt" }, [el("div", {}, [el("label", { text: "Ciężar (kg)" }), wIn]), el("div", {}, [el("label", { text: "Powtórzenia" }), rIn])]),
        hint, add, err
      ]);
      var groups = {}, order = [], vol = 0;
      state.sets.forEach(function (s) { if (!groups[s.exercise]) { groups[s.exercise] = []; order.push(s.exercise); } groups[s.exercise].push(s); vol += s.weight * s.reps; });
      var list = el("div", {});
      if (!order.length) list.appendChild(el("p", { class: "mut", text: "Brak serii tego dnia." }));
      order.forEach(function (name) {
        var c = el("div", { class: "card" }, [el("div", { class: "ex", text: name })]);
        groups[name].forEach(function (s, i) {
          c.appendChild(el("div", { class: "set" }, [
            el("div", { text: (i + 1) + ".  " + fmt(s.weight) + " kg × " + s.reps }),
            el("button", { class: "mini", text: "Usuń", onclick: function () { api("/api/sets/" + s.id, "DELETE").then(viewToday); } })
          ]));
        });
        list.appendChild(c);
      });
      shell(el("div", {}, [el("h1", { text: "Dziś" }), form,
        order.length ? el("h2", { text: "Serie · objętość " + Math.round(vol) + " kg" }) : null, list]));
    }).catch(handleErr);
  }

  // ---------- progress ----------
  function lineChart(points, label) {
    var W = 320, H = 160, pad = 28;
    if (!points.length) return el("p", { class: "mut", text: "Brak danych." });
    var xs = points.map(function (p) { return p.t; }), ys = points.map(function (p) { return p.y; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    if (y1 === y0) { y1 += 1; y0 -= 1; }
    var m = (y1 - y0) * 0.1; y0 -= m; y1 += m;
    function X(t) { return x1 === x0 ? W / 2 : pad + (t - x0) / (x1 - x0) * (W - pad - 8); }
    function Y(v) { return H - 18 - (v - y0) / (y1 - y0) * (H - 18 - 10); }
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg"); svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    function add(tag, a, txt) { var n = document.createElementNS(ns, tag); for (var k in a) n.setAttribute(k, a[k]); if (txt) n.textContent = txt; svg.appendChild(n); }
    [0, 0.5, 1].forEach(function (f) { var v = y0 + (y1 - y0) * f; add("line", { x1: pad, x2: W - 8, y1: Y(v), y2: Y(v), stroke: "#262a33" }); add("text", { x: 2, y: Y(v) + 4, fill: "#8b919d", "font-size": 10 }, fmt(v)); });
    var d = points.map(function (p, i) { return (i ? "L" : "M") + X(p.t).toFixed(1) + " " + Y(p.y).toFixed(1); }).join(" ");
    add("path", { d: d, fill: "none", stroke: "#34d399", "stroke-width": 2.5, "stroke-linejoin": "round" });
    points.forEach(function (p) { add("circle", { cx: X(p.t), cy: Y(p.y), r: 3.5, fill: "#34d399" }); });
    add("text", { x: pad, y: H - 3, fill: "#8b919d", "font-size": 10 }, points[0].label);
    add("text", { x: W - 8, y: H - 3, fill: "#8b919d", "font-size": 10, "text-anchor": "end" }, points[points.length - 1].label);
    return svg;
  }
  function tms(day) { return new Date(day + "T00:00:00").getTime(); }
  function viewProg() {
    api("/api/exercises").then(function (ex) {
      state.exercises = ex;
      if (!ex.length) { shell(el("div", {}, [el("h1", { text: "Postępy" }), el("p", { class: "mut", text: "Dodaj pierwsze serie, a tu pojawi się wykres." })])); return; }
      if (!state.selEx || !ex.some(function (e) { return e.exercise === state.selEx; })) state.selEx = ex[0].exercise;
      return api("/api/history?exercise=" + encodeURIComponent(state.selEx)).then(function (h) {
        var sel = el("select", { onchange: function (e) { state.selEx = e.target.value; viewProg(); } }, ex.map(function (e) { var o = el("option", { value: e.exercise, text: e.exercise }); if (e.exercise === state.selEx) o.selected = true; return o; }));
        var best = h.reduce(function (a, d) { return Math.max(a, d.best_e1rm); }, 0);
        var top = h.reduce(function (a, d) { return Math.max(a, d.top_weight); }, 0);
        var pts = h.map(function (d) { return { t: tms(d.day), y: d.best_e1rm, label: d.day.slice(5) }; });
        var recent = el("div", { class: "card" });
        h.slice(-8).reverse().forEach(function (d) {
          recent.appendChild(el("div", { class: "set" }, [el("div", { text: d.day }), el("div", { class: "mut", text: d.sets + " serii · max " + fmt(d.top_weight) + " kg · e1RM " + fmt(d.best_e1rm) })]));
        });
        shell(el("div", {}, [el("h1", { text: "Postępy" }), sel,
          el("div", { class: "grid mt" }, [
            el("div", { class: "stat" }, [el("div", { class: "mut", text: "Szac. 1RM (rekord)" }), el("div", { class: "big", text: fmt(best) + " kg" })]),
            el("div", { class: "stat" }, [el("div", { class: "mut", text: "Najcięższa seria" }), el("div", { class: "big", text: fmt(top) + " kg" })])]),
          el("h2", { text: "Szacowany 1RM w czasie" }), el("div", { class: "card" }, [lineChart(pts)]),
          el("h2", { text: "Ostatnie treningi" }), recent]));
      });
    }).catch(handleErr);
  }

  // ---------- weight ----------
  function viewWeight() {
    api("/api/weight").then(function (w) {
      var dayIn = el("input", { type: "date", value: today() });
      var kgIn = el("input", { type: "number", inputmode: "decimal", step: "0.1", placeholder: w.length ? String(w[w.length - 1].kg) : "kg" });
      var err = el("div", { class: "err" });
      var form = el("div", { class: "card" }, [
        el("div", { class: "row" }, [el("div", {}, [el("label", { text: "Dzień" }), dayIn]), el("div", {}, [el("label", { text: "Waga (kg)" }), kgIn])]),
        el("button", { class: "mt", text: "Zapisz wagę", onclick: function () {
          api("/api/weight", "POST", { day: dayIn.value, kg: kgIn.value }).then(viewWeight).catch(function () { err.textContent = "Podaj poprawną wagę"; });
        } }), err]);
      var pts = w.map(function (d) { return { t: tms(d.day), y: d.kg, label: d.day.slice(5) }; });
      var list = el("div", { class: "card" });
      w.slice(-10).reverse().forEach(function (d) {
        list.appendChild(el("div", { class: "set" }, [el("div", { text: d.day + "  ·  " + fmt(d.kg) + " kg" }),
          el("button", { class: "mini", text: "Usuń", onclick: function () { api("/api/weight/" + d.day, "DELETE").then(viewWeight); } })]));
      });
      shell(el("div", {}, [el("h1", { text: "Waga ciała" }), form, el("h2", { text: "Wykres" }), el("div", { class: "card" }, [lineChart(pts)]),
        w.length ? el("h2", { text: "Pomiary" }) : null, w.length ? list : null]));
    }).catch(handleErr);
  }

  // ---------- more ----------
  function viewMore() {
    var msg = el("div", { class: "mut mt" });
    var file = el("input", { type: "file", accept: "application/json", class: "hidden", onchange: function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (t) { return api("/api/import", "POST", JSON.parse(t)); })
        .then(function (r) { msg.textContent = "Zaimportowano pozycji: " + r.imported; })
        .catch(function () { msg.textContent = "Nie udało się zaimportować pliku"; });
    } });
    shell(el("div", {}, [el("h1", { text: "Więcej" }),
      el("div", { class: "card" }, [
        el("p", { class: "mut", text: "Dane są w Twojej bazie Cloudflare D1. Eksport do JSON to pełna kopia." }),
        el("button", { class: "sec", text: "Eksportuj dane (JSON)", onclick: function () { location.href = "/api/export"; } }),
        el("button", { class: "sec mt", text: "Importuj dane (JSON)", onclick: function () { file.click(); } }), file, msg]),
      el("div", { class: "card" }, [
        el("p", { class: "mut", text: "iPhone: Safari → Udostępnij → Dodaj do ekranu głównego. Android: Chrome → menu → Zainstaluj aplikację." }),
        el("button", { class: "sec", text: "Wyloguj", onclick: function () { api("/api/logout", "POST").then(boot); } })])]));
  }

  function handleErr(e) { if (e && e.status === 401) boot(); else { clear(); app.appendChild(el("p", { class: "err", text: "Błąd połączenia. Odśwież stronę." })); } }

  function boot() {
    var nav = document.querySelector("nav"); if (nav) nav.remove();
    api("/api/state").then(function (s) {
      if (!s.setup) authScreen(true); else if (!s.authed) authScreen(false); else render();
    }).catch(function () { app.textContent = "Brak połączenia."; });
  }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(function () {});
  boot();
})();
</script>
</body>
</html>`;
