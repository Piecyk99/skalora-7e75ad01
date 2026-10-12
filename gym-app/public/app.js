(function () {
  "use strict";
  var app = document.getElementById("app");
  var state = {
    tab: "today", day: today(), sets: [], exercises: [], selEx: null, progMode: "ex",
    catalog: null, byId: {}, byName: {}, catFilter: "all", catQuery: "",
    prefillEx: null, planId: null, session: null, rest: null
  };

  // ---------- helpers ----------
  function p2(n) { return n < 10 ? "0" + n : "" + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
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
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + p2(s % 60); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function api(path, method, body) {
    return fetch(path, { method: method || "GET", headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || "err"); e.status = r.status; e.data = j; throw e; } return j; }); });
  }
  function clear() { while (app.firstChild) app.removeChild(app.firstChild); }
  function scrollTop() { window.scrollTo(0, 0); }

  // ---------- catalog ----------
  function loadCatalog() {
    if (state.catalog) return Promise.resolve();
    return fetch("/exercises.json").then(function (r) { return r.json(); }).then(function (c) {
      state.catalog = c;
      c.exercises.forEach(function (e) { state.byId[e.id] = e; state.byName[e.name_pl] = e; });
    });
  }
  function planById(id) { return state.catalog.plans.filter(function (p) { return p.id === id; })[0]; }
  function parseReps(s) {
    var m = String(s).match(/(\d+)\s*[–-]\s*(\d+)/);
    if (m) return { lo: +m[1], hi: +m[2] };
    var n = String(s).match(/\d+/);
    return n ? { lo: +n[0], hi: +n[0] } : { lo: 0, hi: 0 };
  }
  function increment(ex) {
    var eq = ex.equipment.join(" ").toLowerCase();
    if (eq.indexOf("hantl") >= 0) return 2;
    return 2.5;
  }
  // Progresja podwójna z katalogu: wszystkie serie na górze zakresu => dołóż ciężar.
  function suggestion(item, ex, last) {
    if (!last || !last.sets || !last.sets.length) return null;
    var r = parseReps(item.reps);
    var maxW = Math.max.apply(null, last.sets.map(function (s) { return s.weight; }));
    var allTop = last.sets.length >= item.sets && last.sets.every(function (s) { return s.reps >= r.hi; });
    var txt = last.sets.map(function (s) { return fmt(s.weight) + "×" + s.reps; }).join(", ");
    if (allTop) return { weight: maxW + increment(ex), reps: r.lo, text: "Ostatnio (" + last.day + "): " + txt + ". Góra zakresu we wszystkich seriach: dołóż do " + fmt(maxW + increment(ex)) + " kg i wróć do " + r.lo + " powt." };
    return { weight: last.sets[0].weight, reps: last.sets[0].reps, text: "Ostatnio (" + last.day + "): " + txt + ". Celuj w więcej powtórzeń do " + r.hi + "." };
  }

  // ---------- rest timer ----------
  var restBar = el("div", { id: "restbar", class: "hidden" });
  var restTick = null;
  var audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination); o.frequency.value = 880; g.gain.value = 0.15;
      o.start(); o.stop(audioCtx.currentTime + 0.35);
    } catch (e) { /* brak dźwięku */ }
  }
  function startRest(sec, label) {
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === "suspended") audioCtx.resume(); } catch (e) { /* ok */ }
    state.rest = { end: Date.now() + sec * 1000, label: label || "" };
    drawRest();
    if (!restTick) restTick = setInterval(drawRest, 250);
  }
  function stopRest() {
    state.rest = null;
    if (restTick) { clearInterval(restTick); restTick = null; }
    restBar.className = "hidden";
  }
  function drawRest() {
    if (!state.rest) return;
    var left = (state.rest.end - Date.now()) / 1000;
    if (left <= 0) {
      stopRest();
      if (navigator.vibrate) navigator.vibrate([250, 120, 250]);
      beep();
      return;
    }
    while (restBar.firstChild) restBar.removeChild(restBar.firstChild);
    restBar.className = "";
    restBar.appendChild(el("div", { class: "t", text: mmss(left) }));
    restBar.appendChild(el("div", { class: "l", text: "Przerwa" + (state.rest.label ? " · " + state.rest.label : "") }));
    restBar.appendChild(el("button", { class: "sec", text: "+30 s", onclick: function () { state.rest.end += 30000; drawRest(); } }));
    restBar.appendChild(el("button", { class: "sec", text: "Pomiń", onclick: stopRest }));
  }

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
    var tabs = [["today", "🏋️", "Dziś"], ["plan", "📋", "Plan"], ["catalog", "📚", "Katalog"], ["prog", "📈", "Postępy"], ["more", "⚙️", "Więcej"]];
    var old = document.querySelector("nav"); if (old) old.remove();
    var nav = el("nav", {}, tabs.map(function (t) {
      return el("button", { class: state.tab === t[0] ? "on" : "", onclick: function () { state.tab = t[0]; state.planId = null; state.session = null; render(); scrollTop(); } }, [el("span", { text: t[1] }), t[2]]);
    }));
    document.body.appendChild(nav);
    if (!restBar.parentNode) document.body.appendChild(restBar);
  }
  function render() {
    if (state.tab === "today") viewToday();
    else if (state.tab === "plan") { if (state.session) viewSession(); else if (state.planId) viewPlan(); else viewPlans(); }
    else if (state.tab === "catalog") viewCatalog();
    else if (state.tab === "prog") viewProg();
    else viewMore();
  }

  // ---------- exercise detail sheet ----------
  function closeModal() { var m = document.getElementById("modal"); if (m) m.remove(); document.body.classList.remove("lock"); }
  function listBlock(title, arr, ordered) {
    if (!arr || !arr.length) return null;
    return el("div", {}, [el("h2", { text: title }), el(ordered ? "ol" : "ul", {}, arr.map(function (t) { return el("li", { text: t }); }))]);
  }
  function openDetail(id) {
    var ex = state.byId[id]; if (!ex) return;
    closeModal();
    var d = ex.default;
    var sheet = el("div", { class: "sheet", onclick: function (e) { e.stopPropagation(); } }, [
      el("div", { class: "bar" }, [el("button", { class: "mini", text: "Zamknij ✕", onclick: closeModal })]),
      el("img", { class: "ex", src: "/" + ex.image, alt: ex.name_pl }),
      el("h1", { class: "mt", text: ex.name_pl }),
      el("div", { class: "mut mb", text: ex.name_en }),
      el("div", {}, [cap(ex.category), cap(ex.type)].concat(ex.equipment).map(function (t) { return el("span", { class: "tag", text: t }); })),
      el("p", { class: "mut", text: "Główne: " + ex.muscles_primary.join(", ") + (ex.muscles_secondary.length ? ". Pomocnicze: " + ex.muscles_secondary.join(", ") : "") + "." }),
      el("p", { text: "Domyślnie: " + d.sets + " × " + d.reps + ", przerwa " + mmss(d.rest_s) + ", RIR " + d.rir }),
      ex.solo_safety ? el("div", { class: "callout", text: ex.solo_safety }) : null,
      listBlock("Wykonanie", ex.steps, true),
      listBlock("Wskazówki", ex.tips),
      listBlock("Częste błędy", ex.mistakes),
      ex.alternatives.length ? el("div", {}, [el("h2", { text: "Zamienniki" }), el("div", { class: "chips" }, ex.alternatives.map(function (a) {
        return el("button", { class: "chip", text: state.byId[a] ? state.byId[a].name_pl : a, onclick: function () { openDetail(a); } });
      }))]) : null,
      el("button", { class: "mt", text: "Dodaj serię tego ćwiczenia", onclick: function () { closeModal(); state.prefillEx = ex.name_pl; state.tab = "today"; state.day = today(); render(); scrollTop(); } })
    ]);
    var modal = el("div", { class: "modal", id: "modal", onclick: closeModal }, [sheet]);
    document.body.appendChild(modal);
    document.body.classList.add("lock");
  }

  // ---------- today ----------
  function loadToday() {
    return Promise.all([api("/api/sets?day=" + state.day), api("/api/exercises")]).then(function (r) { state.sets = r[0]; state.exercises = r[1]; });
  }
  function viewToday() {
    loadToday().then(function () {
      var names = {}; state.exercises.forEach(function (e) { names[e.exercise] = 1; });
      var dl = el("datalist", { id: "exlist" });
      var catNames = state.catalog ? state.catalog.exercises.map(function (e) { return e.name_pl; }) : [];
      state.exercises.map(function (e) { return e.exercise; }).concat(catNames.filter(function (n) { return !names[n]; })).forEach(function (n) { dl.appendChild(el("option", { value: n })); });
      var dayIn = el("input", { type: "date", value: state.day, onchange: function (e) { if (e.target.value) { state.day = e.target.value; viewToday(); } } });
      var exIn = el("input", { id: "exin", list: "exlist", placeholder: "Ćwiczenie", autocomplete: "off", autocapitalize: "sentences" });
      var wIn = el("input", { id: "win", type: "number", inputmode: "decimal", step: "0.25", min: "0", placeholder: "0" });
      var rIn = el("input", { id: "rin", type: "number", inputmode: "numeric", step: "1", min: "1", placeholder: "0" });
      var hint = el("div", { class: "mut mt" });
      var info = el("div", {});
      function prefill() {
        var name = exIn.value.trim();
        var f = state.exercises.filter(function (e) { return e.exercise === name; })[0];
        if (f) { wIn.value = f.last_weight; rIn.value = f.last_reps; hint.textContent = "Ostatnio: " + fmt(f.last_weight) + " kg × " + f.last_reps + " (" + f.last_day + ")"; }
        else hint.textContent = "";
        while (info.firstChild) info.removeChild(info.firstChild);
        var c = state.byName[name];
        if (c) info.appendChild(el("button", { class: "link mt", text: "Pokaż opis i technikę →", onclick: function () { openDetail(c.id); } }));
      }
      exIn.addEventListener("change", prefill); exIn.addEventListener("input", prefill);
      var err = el("div", { class: "err" });
      var add = el("button", { class: "mt", text: "Dodaj serię", onclick: function () {
        err.textContent = "";
        api("/api/sets", "POST", { day: state.day, exercise: exIn.value, weight: wIn.value, reps: rIn.value }).then(function () { state.prefillEx = exIn.value; viewToday(); }).catch(function () { err.textContent = "Uzupełnij ćwiczenie, ciężar i powtórzenia"; });
      } });
      var form = el("div", { class: "card" }, [
        el("label", { text: "Dzień" }), dayIn,
        el("label", { class: "mt", text: "Ćwiczenie" }), exIn, dl,
        el("div", { class: "row mt" }, [el("div", {}, [el("label", { text: "Ciężar (kg)" }), wIn]), el("div", {}, [el("label", { text: "Powtórzenia" }), rIn])]),
        hint, info, add, err
      ]);
      var groups = {}, order = [], vol = 0;
      state.sets.forEach(function (s) { if (!groups[s.exercise]) { groups[s.exercise] = []; order.push(s.exercise); } groups[s.exercise].push(s); vol += s.weight * s.reps; });
      var list = el("div", {});
      if (!order.length) list.appendChild(el("p", { class: "mut", text: "Brak serii tego dnia. Wybierz plan w zakładce Plan albo dodaj serię ręcznie." }));
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
      if (state.prefillEx) { exIn.value = state.prefillEx; state.prefillEx = null; prefill(); }
    }).catch(handleErr);
  }

  // ---------- plans ----------
  function viewPlans() {
    var c = state.catalog, r = c.rules;
    var list = el("div", {}, c.plans.map(function (p) {
      var sets = p.items.reduce(function (a, it) { return a + it.sets; }, 0);
      return el("div", { class: "card" }, [
        el("h3", { text: p.name }),
        el("div", { class: "mut mb", text: (p.when || "") + " · " + p.items.length + " ćwiczeń · " + sets + " serii" }),
        el("div", { class: "row" }, [
          el("button", { class: "sec", text: "Podgląd", onclick: function () { state.planId = p.id; render(); scrollTop(); } }),
          el("button", { text: "Start", onclick: function () { startSession(p.id); } })
        ])
      ]);
    }));
    var labels = { progression: "Progresja", rir: "RIR (zapas powtórzeń)", rest: "Przerwy", warmup: "Rozgrzewka", tempo: "Tempo", deload: "Deload" };
    var rules = el("div", {}, Object.keys(labels).filter(function (k) { return r[k]; }).map(function (k) {
      return el("details", {}, [el("summary", { text: labels[k] }), el("p", { text: r[k] })]);
    }));
    shell(el("div", {}, [el("h1", { text: "Plan" }), list, el("h2", { text: "Zasady" }), rules]));
  }
  function viewPlan() {
    var p = planById(state.planId);
    shell(el("div", {}, [
      el("button", { class: "link mb", text: "← Plany", onclick: function () { state.planId = null; render(); } }),
      el("h1", { text: p.name }), el("div", { class: "mut mb", text: p.when || "" }),
      el("button", { text: "Start treningu", onclick: function () { startSession(p.id); } }),
      el("div", { class: "card mt" }, p.items.map(function (it) {
        var ex = state.byId[it.exercise_id];
        return el("div", { class: "planitem" }, [
          el("img", { class: "th", src: "/" + ex.image, alt: "", loading: "lazy" }),
          el("div", {}, [
            el("button", { class: "link", text: ex.name_pl, onclick: function () { openDetail(ex.id); } }),
            el("div", { class: "mut", text: it.sets + " × " + it.reps + (it.superset_group ? " · superseria " + it.superset_group : "") }),
            it.note ? el("div", { class: "note", text: it.note }) : null
          ])
        ]);
      }))
    ]));
  }

  // ---------- guided session ----------
  var wakeLock = null;
  function keepAwake() { try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { wakeLock = l; }).catch(function () {}); } catch (e) { /* ok */ } }
  function startSession(planId) {
    var plan = planById(planId);
    state.tab = "plan"; state.planId = planId;
    state.session = { planId: planId, day: today(), last: {} };
    keepAwake();
    Promise.all(plan.items.map(function (it) {
      var ex = state.byId[it.exercise_id];
      return api("/api/last?exercise=" + encodeURIComponent(ex.name_pl) + "&before=" + state.session.day).then(function (l) { state.session.last[it.exercise_id] = l; });
    })).then(function () { viewSession(); scrollTop(); }).catch(handleErr);
  }
  function viewSession() {
    var S = state.session, plan = planById(S.planId), y = window.scrollY;
    api("/api/sets?day=" + S.day).then(function (all) {
      var cards = [], doneItems = 0, vol = 0, nsets = 0;
      all.forEach(function (s) { vol += s.weight * s.reps; nsets++; });
      plan.items.forEach(function (it, idx) {
        var ex = state.byId[it.exercise_id];
        var mine = all.filter(function (s) { return s.exercise === ex.name_pl; });
        var done = mine.length >= it.sets; if (done) doneItems++;
        var prevGroup = idx > 0 ? plan.items[idx - 1].superset_group : null;
        var nextItem = plan.items[idx + 1];
        var sg = it.superset_group;
        var isLastInGroup = !sg || !nextItem || nextItem.superset_group !== sg;
        var sug = suggestion(it, ex, S.last[it.exercise_id]);
        var wIn = el("input", { type: "number", inputmode: "decimal", step: "0.25", min: "0", placeholder: "kg" });
        var rIn = el("input", { type: "number", inputmode: "numeric", step: "1", min: "1", placeholder: "powt." });
        if (mine.length) { var ls = mine[mine.length - 1]; wIn.value = ls.weight; rIn.value = ls.reps; }
        else if (sug) { wIn.value = sug.weight; rIn.value = sug.reps; }
        var restS = it.rest_s || ex.default.rest_s;
        var btn = el("button", { text: "Zapisz serię " + (mine.length + 1) + "/" + it.sets });
        btn.addEventListener("click", function () {
          btn.disabled = true;
          api("/api/sets", "POST", { day: S.day, exercise: ex.name_pl, weight: wIn.value, reps: rIn.value }).then(function () {
            if (isLastInGroup) startRest(restS, ex.name_pl);
            else { stopRest(); }
            viewSession();
          }).catch(function () { btn.disabled = false; btn.textContent = "Uzupełnij kg i powtórzenia"; });
        });
        var chips = el("div", { class: "mb" }, mine.map(function (s) {
          return el("span", { class: "setchip" }, [fmt(s.weight) + " × " + s.reps, el("button", { text: "×", "aria-label": "Usuń serię", onclick: function () { api("/api/sets/" + s.id, "DELETE").then(viewSession); } })]);
        }));
        var cls = "card" + (done ? " done" : "") + (sg ? " grp" : "");
        cards.push(el("div", {}, [
          sg && sg !== prevGroup ? el("h2", { text: "Superseria " + sg + " (przerwa po ostatnim)" }) : null,
          el("div", { class: cls }, [
            el("div", { class: "head" }, [
              el("img", { class: "th", src: "/" + ex.image, alt: "", loading: "lazy", onclick: function () { openDetail(ex.id); } }),
              el("div", {}, [
                el("button", { class: "link", text: (done ? "✓ " : "") + ex.name_pl, onclick: function () { openDetail(ex.id); } }),
                el("div", { class: "mut", text: it.sets + " × " + it.reps + " · przerwa " + mmss(restS) + " · RIR " + ex.default.rir })
              ])
            ]),
            it.note ? el("div", { class: "note", text: it.note }) : null,
            sug ? el("div", { class: "hint", text: sug.text }) : el("div", { class: "note", text: "Pierwszy raz: zacznij lekko i dobierz ciężar tak, by zostało " + ex.default.rir + " powt. w zapasie." }),
            chips,
            el("div", { class: "row" }, [el("div", {}, [el("label", { text: "Ciężar (kg)" }), wIn]), el("div", {}, [el("label", { text: "Powtórzenia" }), rIn])]),
            el("div", { class: "mt" }, [btn])
          ])
        ]));
      });
      var warm = state.catalog.rules.warmup;
      shell(el("div", {}, [
        el("button", { class: "link mb", text: "← Zakończ i wróć", onclick: function () { state.session = null; stopRest(); if (wakeLock) { try { wakeLock.release(); } catch (e) { /* ok */ } } render(); scrollTop(); } }),
        el("h1", { text: plan.name }),
        el("div", { class: "mut mb", text: "Zrobione: " + doneItems + "/" + plan.items.length + " ćwiczeń · " + nsets + " serii · objętość " + Math.round(vol) + " kg" }),
        warm ? el("details", {}, [el("summary", { text: "Rozgrzewka" }), el("p", { text: warm })]) : null,
        el("div", { class: "mt" }, cards),
        el("button", { class: "sec", text: "Zakończ trening", onclick: function () { state.session = null; state.planId = null; state.tab = "today"; state.day = today(); stopRest(); render(); scrollTop(); } })
      ]));
      window.scrollTo(0, y);
    }).catch(handleErr);
  }

  // ---------- catalog ----------
  function viewCatalog() {
    var cats = ["all"]; state.catalog.exercises.forEach(function (e) { if (cats.indexOf(e.category) < 0) cats.push(e.category); });
    var q = el("input", { type: "search", placeholder: "Szukaj ćwiczenia lub mięśnia", value: state.catQuery });
    var grid = el("div", { class: "cat" });
    function fill() {
      while (grid.firstChild) grid.removeChild(grid.firstChild);
      var t = state.catQuery.trim().toLowerCase();
      var items = state.catalog.exercises.filter(function (e) {
        if (state.catFilter !== "all" && e.category !== state.catFilter) return false;
        if (!t) return true;
        return (e.name_pl + " " + e.name_en + " " + e.muscles_primary.join(" ") + " " + e.muscles_secondary.join(" ") + " " + e.equipment.join(" ")).toLowerCase().indexOf(t) >= 0;
      });
      if (!items.length) grid.appendChild(el("p", { class: "mut", text: "Brak wyników." }));
      items.forEach(function (e) {
        grid.appendChild(el("button", { onclick: function () { openDetail(e.id); } }, [el("img", { src: "/" + e.image, alt: "", loading: "lazy" }), el("span", { text: e.name_pl })]));
      });
    }
    q.addEventListener("input", function () { state.catQuery = q.value; fill(); });
    var chips = el("div", { class: "chips" }, cats.map(function (c) {
      return el("button", { class: "chip" + (state.catFilter === c ? " on" : ""), text: c === "all" ? "Wszystkie" : cap(c), onclick: function () { state.catFilter = c; viewCatalog(); } });
    }));
    fill();
    shell(el("div", {}, [el("h1", { text: "Katalog" }), q, chips, grid]));
  }

  // ---------- progress & weight ----------
  function lineChart(points) {
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
  function segControl() {
    return el("div", { class: "seg" }, [["ex", "Ćwiczenia"], ["w", "Waga ciała"]].map(function (t) {
      return el("button", { class: state.progMode === t[0] ? "on" : "", text: t[1], onclick: function () { state.progMode = t[0]; viewProg(); } });
    }));
  }
  function viewProg() { if (state.progMode === "w") viewWeight(); else viewExProg(); }
  function viewExProg() {
    api("/api/exercises").then(function (ex) {
      state.exercises = ex;
      if (!ex.length) { shell(el("div", {}, [el("h1", { text: "Postępy" }), segControl(), el("p", { class: "mut", text: "Dodaj pierwsze serie, a tu pojawi się wykres." })])); return; }
      if (!state.selEx || !ex.some(function (e) { return e.exercise === state.selEx; })) state.selEx = ex[0].exercise;
      return api("/api/history?exercise=" + encodeURIComponent(state.selEx)).then(function (h) {
        var sel = el("select", { onchange: function (e) { state.selEx = e.target.value; viewExProg(); } }, ex.map(function (e) { var o = el("option", { value: e.exercise, text: e.exercise }); if (e.exercise === state.selEx) o.selected = true; return o; }));
        var best = h.reduce(function (a, d) { return Math.max(a, d.best_e1rm); }, 0);
        var top = h.reduce(function (a, d) { return Math.max(a, d.top_weight); }, 0);
        var pts = h.map(function (d) { return { t: tms(d.day), y: d.best_e1rm, label: d.day.slice(5) }; });
        var recent = el("div", { class: "card" });
        h.slice(-8).reverse().forEach(function (d) {
          recent.appendChild(el("div", { class: "set" }, [el("div", { text: d.day }), el("div", { class: "mut", text: d.sets + " serii · max " + fmt(d.top_weight) + " kg · e1RM " + fmt(d.best_e1rm) })]));
        });
        shell(el("div", {}, [el("h1", { text: "Postępy" }), segControl(), sel,
          el("div", { class: "grid mt" }, [
            el("div", { class: "stat" }, [el("div", { class: "mut", text: "Szac. 1RM (rekord)" }), el("div", { class: "big", text: fmt(best) + " kg" })]),
            el("div", { class: "stat" }, [el("div", { class: "mut", text: "Najcięższa seria" }), el("div", { class: "big", text: fmt(top) + " kg" })])]),
          el("h2", { text: "Szacowany 1RM w czasie" }), el("div", { class: "card" }, [lineChart(pts)]),
          el("h2", { text: "Ostatnie treningi" }), recent]));
      });
    }).catch(handleErr);
  }
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
      shell(el("div", {}, [el("h1", { text: "Postępy" }), segControl(), form, el("h2", { text: "Wykres" }), el("div", { class: "card" }, [lineChart(pts)]),
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
    stopRest(); closeModal();
    Promise.all([api("/api/state"), loadCatalog()]).then(function (r) {
      var s = r[0];
      if (!s.setup) authScreen(true); else if (!s.authed) authScreen(false); else render();
    }).catch(function () { clear(); app.appendChild(el("p", { class: "err", text: "Brak połączenia. Odśwież stronę." })); });
  }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(function () {});
  boot();
})();
